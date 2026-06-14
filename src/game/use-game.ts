import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { avatarOrder } from "@/game/avatars";
import { ensureContent } from "@/game/content-client";
import {
  parseSelection,
  serializeSelection,
  type ContentLevel,
  type ContentSelection,
} from "@/game/content-selection";
import type { ContentBundle } from "@/game/content-types";
import {
  EMPTY_GLOBAL_SETTINGS,
  loadGlobalSettings,
  saveGlobalSettings,
  type GlobalSettings,
} from "@/game/global-settings";
import { colorOrder, defaultSettings, makeRoomCode } from "@/game/data";
import * as roomApi from "@/game/room-api";
import { SPIN_MS } from "@/game/room-api";
import type { PlayerDoc, RoomDoc, VoteDoc } from "@/game/room-api";
import type {
  ApprovalState,
  AvatarId,
  ChallengeType,
  Phase,
  Player,
  RoomSettings,
  RoomTab,
} from "@/game/types";
import { appwriteClient, playersChannel, roomChannel, votesChannel } from "@/lib/appwrite";
import { useClientId } from "@/lib/client-id";
import type { PlayerColorId } from "@/theme/colors";

export type Stage = "entry" | "profile" | "room";

const SPIN_TICK_MS = 110;
/** Odliczanie przed automatycznym losowaniem (gdy włączony auto-start). */
const AUTO_START_MS = 2500;

function botClientId(): string {
  return `bot_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Cały stan i logika gry „Butelka”. Profil i nawigacja są lokalne, a stan pokoju
 * pochodzi z Appwrite (Realtime) — ekrany konsumują niezmieniony interfejs GameApi.
 * Rozstrzygnięcia (spin finalize, liczenie głosów) wykonuje wyłącznie host.
 */
export function useGame() {
  const clientId = useClientId();

  // Lokalny stan profilu i nawigacji (zanim gracz dołączy do pokoju).
  const [stage, setStage] = useState<Stage>("entry");
  const [roomTab, setRoomTab] = useState<RoomTab>("create");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>(avatarOrder[0]);
  const [colorId, setColorId] = useState<PlayerColorId>(colorOrder[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [spinTick, setSpinTick] = useState(0);
  // Testowanie na jednym urządzeniu: tożsamość, jako którą oglądamy/gramy.
  // null = realne urządzenie; inaczej clientId wybranego gracza testowego.
  const [actingClientId, setActingClientId] = useState<string | null>(null);
  // Potwierdzenie wyjścia z pokoju + zapamiętana sesja do ponownego dołączenia z ekranu głównego.
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [lastSession, setLastSession] = useState<{
    code: string;
    name: string;
    avatarId: AvatarId;
    colorId: PlayerColorId;
  } | null>(null);

  // Surowy stan pokoju z Appwrite: undefined = ładowanie, null = pokój nie istnieje.
  const [roomDoc, setRoomDoc] = useState<RoomDoc | null | undefined>(undefined);
  const [playerDocs, setPlayerDocs] = useState<PlayerDoc[]>([]);
  const [voteDocs, setVoteDocs] = useState<VoteDoc[]>([]);

  // Paczka treści z content API (modes/categories/cards) — ładowana raz, cache na dysku.
  const [contentBundle, setContentBundle] = useState<ContentBundle | null>(null);
  useEffect(() => {
    let alive = true;
    void ensureContent().then((bundle) => {
      if (alive && bundle) setContentBundle(bundle);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Globalne ustawienia gracza (domyślne imię/avatar/kolor + domyślny dobór treści) — z dysku.
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(EMPTY_GLOBAL_SETTINGS);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  useEffect(() => {
    let alive = true;
    void loadGlobalSettings().then((loaded) => {
      if (alive) setGlobalSettings(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Tożsamość, którą traktujemy jako „Ty” (umożliwia podgląd jako gracz testowy).
  const effectiveClientId = actingClientId ?? clientId;

  // Pełne przeładowanie stanu pokoju (po evencie Realtime albo własnej akcji).
  const reload = useCallback(async (code: string) => {
    try {
      const next = await roomApi.loadRoomState(code);
      if (next === null) {
        setRoomDoc(null);
        setPlayerDocs([]);
        setVoteDocs([]);
      } else {
        setRoomDoc(next.room);
        setPlayerDocs(next.players);
        setVoteDocs(next.votes);
      }
    } catch {
      // Przejściowy błąd sieci — zostaw poprzedni stan; Realtime ponowi.
    }
  }, []);

  // Subskrypcja Realtime: po wejściu do pokoju wczytaj i nasłuchuj zmian (pokój/gracze/głosy).
  useEffect(() => {
    if (stage !== "room" || roomCode.length === 0) {
      return;
    }
    const code = roomCode;
    // Pierwsze wczytanie odraczamy (setState poza ciałem efektu).
    let timer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => void reload(code), 0);
    const channels = [roomChannel(code), playersChannel(), votesChannel()];
    const unsubscribe = appwriteClient.subscribe(channels, (event) => {
      const payload = (event as { payload?: { roomCode?: string } }).payload;
      // Eventy z kolekcji players/votes filtrujemy do tego pokoju (room channel jest już wąski).
      if (payload && payload.roomCode && payload.roomCode !== code) {
        return;
      }
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => void reload(code), 60);
    });
    // Fallback: odpytuj stan co 2,5 s. Realtime bywa zawodny na natywie (WebSocket gubi się
    // np. po Fast Refresh / w tle), a polling gwarantuje synchronizację między urządzeniami.
    const poll = setInterval(() => void reload(code), 2500);
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      clearInterval(poll);
      unsubscribe();
    };
  }, [stage, roomCode, reload]);

  // Host: po SPIN_MS ujawnia szczęśliwca (spinning -> chosen) na podstawie spinStartedAt.
  useEffect(() => {
    if (!roomDoc || roomDoc.phase !== "spinning" || roomDoc.hostClientId !== clientId) {
      return;
    }
    const code = roomDoc.code;
    const seed = roomDoc.spinSeed;
    const startedAt = roomDoc.spinStartedAt ?? Date.now();
    const remaining = Math.max(0, SPIN_MS - (Date.now() - startedAt));
    const id = setTimeout(() => {
      void roomApi.finalizeSpin(code, seed).then(() => reload(code));
    }, remaining);
    return () => clearTimeout(id);
  }, [roomDoc, clientId, reload]);

  // Host: rozstrzyga głosowanie, gdy pojawiają się głosy. Ref chroni przed nakładaniem się.
  const resolvingRef = useRef(false);
  useEffect(() => {
    if (!roomDoc || !roomDoc.pendingAction || roomDoc.hostClientId !== clientId) {
      return;
    }
    if (resolvingRef.current) {
      return;
    }
    const code = roomDoc.code;
    resolvingRef.current = true;
    void roomApi
      .resolveVotes(roomDoc, playerDocs, voteDocs)
      .then((acted) => {
        // Host po realnym rozstrzygnięciu przeładowuje swój stan — nie czeka tylko na Realtime
        // (inaczej jego własny dialog mógłby nie zniknąć). Reload tylko gdy coś zmieniono => brak pętli.
        if (acted) {
          return reload(code);
        }
      })
      .finally(() => {
        resolvingRef.current = false;
      });
  }, [clientId, playerDocs, reload, roomDoc, voteDocs]);

  const sortedPlayers = useMemo(
    () => [...playerDocs].sort((a, b) => a.joinedAt - b.joinedAt),
    [playerDocs]
  );

  const pendingApproval = roomDoc?.pendingAction ?? null;

  const approvedClientIds = useMemo(() => {
    if (!pendingApproval) {
      return new Set<string>();
    }
    return new Set(
      voteDocs.filter((v) => v.action === pendingApproval && v.approved).map((v) => v.clientId)
    );
  }, [voteDocs, pendingApproval]);

  const players: Player[] = useMemo(
    () =>
      sortedPlayers.map((p) => ({
        id: p.$id,
        name: p.name,
        avatarId: p.avatarId as AvatarId,
        colorId: p.colorId as PlayerColorId,
        isSelf: p.clientId === effectiveClientId,
        isHost: p.clientId === roomDoc?.hostClientId,
        clientId: p.clientId,
        approved: approvedClientIds.has(p.clientId),
      })),
    [sortedPlayers, effectiveClientId, roomDoc, approvedClientIds]
  );

  const amHost = players.some((p) => p.isSelf && p.isHost);

  // Podgląd jako gracz testowy: kogo oglądamy i czy to ktoś inny niż my.
  const viewAsPlayer = players.find((p) => p.isSelf) ?? null;
  const isImpersonating =
    actingClientId !== null &&
    actingClientId !== clientId &&
    players.some((p) => p.clientId === actingClientId);

  // Jeśli oglądany gracz testowy zniknął (wyleciał/wyszedł) — wróć do swojego widoku.
  useEffect(() => {
    if (actingClientId === null) {
      return;
    }
    if (players.length > 0 && !players.some((p) => p.clientId === actingClientId)) {
      const id = setTimeout(() => setActingClientId(null), 0);
      return () => clearTimeout(id);
    }
  }, [actingClientId, players]);

  const phase: Phase = roomDoc?.phase ?? "lobby";
  const settings: RoomSettings = useMemo(
    () =>
      roomDoc
        ? {
            endTurnApproval: roomDoc.endTurnApproval ?? "majority",
            nextTruthApproval: roomDoc.nextTruthApproval ?? "majority",
            nextDareApproval: roomDoc.nextDareApproval ?? "off",
            autoStart: roomDoc.autoStart ?? false,
          }
        : defaultSettings,
    [roomDoc]
  );
  const challengeType = (roomDoc?.challengeType ?? null) as ChallengeType | null;
  const challengeText = roomDoc?.challengeText ?? null;

  // Dobór treści pokoju (modeKey -> poziom 0..3), czytany z roomDoc.
  const contentSelection: ContentSelection = useMemo(
    () => parseSelection(roomDoc?.contentSelection),
    [roomDoc?.contentSelection]
  );

  // Auto-start: host losuje automatycznie po krótkim odliczaniu, gdy włączone i są ≥2 gracze.
  // Refy (synchronizowane w efekcie), żeby polling (reload co 2,5 s) nie resetował timera —
  // deps efektu to stabilne prymitywy.
  const roomDocRef = useRef(roomDoc);
  const playerDocsRef = useRef(playerDocs);
  useEffect(() => {
    roomDocRef.current = roomDoc;
    playerDocsRef.current = playerDocs;
  });
  const isHostDevice = !!roomDoc && roomDoc.hostClientId === clientId;
  useEffect(() => {
    if (!isHostDevice || !settings.autoStart || phase !== "lobby" || players.length < 2) {
      return;
    }
    const id = setTimeout(() => {
      const rd = roomDocRef.current;
      if (rd) {
        void roomApi.startSpin(rd, playerDocsRef.current).then(() => reload(rd.code));
      }
    }, AUTO_START_MS);
    return () => clearTimeout(id);
  }, [isHostDevice, settings.autoStart, phase, players.length, reload]);

  const approval: ApprovalState | null = useMemo(() => {
    if (!pendingApproval) {
      return null;
    }
    const total = sortedPlayers.length;
    const rejected = voteDocs.filter((v) => v.action === pendingApproval && !v.approved).length;
    const myVote = voteDocs.find(
      (v) => v.action === pendingApproval && v.clientId === effectiveClientId
    );
    const mode =
      pendingApproval === "endTurn"
        ? settings.endTurnApproval
        : pendingApproval === "nextTruth"
          ? settings.nextTruthApproval
          : settings.nextDareApproval;
    return {
      action: pendingApproval,
      approved: approvedClientIds.size,
      rejected,
      total,
      needed: roomApi.neededForThreshold(mode, total),
      myVote: myVote ? myVote.approved : null,
    };
  }, [
    pendingApproval,
    sortedPlayers.length,
    voteDocs,
    effectiveClientId,
    approvedClientIds,
    settings,
  ]);

  const luckyClientId = roomDoc?.luckyClientId ?? null;
  const luckyMatch = luckyClientId ? players.findIndex((p) => p.clientId === luckyClientId) : -1;
  const luckyIndex = luckyMatch >= 0 ? luckyMatch : null;
  const luckyPlayer = luckyIndex === null ? null : (players[luckyIndex] ?? null);
  const amLucky = luckyPlayer?.isSelf ?? false;

  // Test na jednym urządzeniu: gdy zaczyna się głosowanie, zapamiętaj widok, którym
  // sterujesz (np. szczęśliwiec klikający „Następne”). Po zakończeniu głosowania wróć do niego.
  const viewBeforeApprovalRef = useRef<string | null>(null);
  const prevPendingRef = useRef<typeof pendingApproval>(pendingApproval);
  useEffect(() => {
    const prev = prevPendingRef.current;
    prevPendingRef.current = pendingApproval;
    if (prev === null && pendingApproval !== null) {
      viewBeforeApprovalRef.current = actingClientId;
      return;
    }
    if (prev !== null && pendingApproval === null) {
      const restore = viewBeforeApprovalRef.current;
      const id = setTimeout(() => setActingClientId(restore), 0);
      return () => clearTimeout(id);
    }
  }, [pendingApproval, actingClientId]);

  // Animacja krążenia karty (czysto kliencka): podczas „spinning” migamy graczami.
  useEffect(() => {
    if (phase !== "spinning" || players.length === 0) {
      return;
    }
    const id = setInterval(() => setSpinTick((tick) => tick + 1), SPIN_TICK_MS);
    return () => clearInterval(id);
  }, [phase, players.length]);

  const activeIndex = useMemo(() => {
    if (phase === "spinning" && players.length > 0) {
      return spinTick % players.length;
    }
    if (phase === "chosen" || phase === "task") {
      return luckyIndex;
    }
    return null;
  }, [phase, players.length, spinTick, luckyIndex]);

  const activePlayer = activeIndex === null ? null : (players[activeIndex] ?? null);

  // Jeśli pokój zniknął (wszyscy wyszli) — wróć do ekranu startowego (poza ciałem efektu).
  const roomMissing = stage === "room" && roomCode.length > 0 && roomDoc === null;
  useEffect(() => {
    if (!roomMissing) {
      return;
    }
    const id = setTimeout(() => {
      setStage("entry");
      setRoomCode("");
    }, 0);
    return () => clearTimeout(id);
  }, [roomMissing]);

  const normalizedName = playerName.trim();
  const normalizedJoinCode = joinCode.replace(/\D/g, "");
  const canEnterRoom = normalizedName.length >= 2;
  const canSpin = phase === "lobby" && players.length >= 2;

  const approvalCount = useMemo(
    () =>
      [settings.endTurnApproval, settings.nextTruthApproval, settings.nextDareApproval].filter(
        (mode) => mode !== "off"
      ).length,
    [settings]
  );

  /** Auto-wypełnia onboarding domyślnym profilem z globalnych ustawień (jeśli ustawiony). */
  const seedProfileFromGlobals = useCallback(() => {
    if (globalSettings.name) setPlayerName(globalSettings.name);
    if (globalSettings.avatarId) setAvatarId(globalSettings.avatarId);
    if (globalSettings.colorId) setColorId(globalSettings.colorId);
  }, [globalSettings]);

  const createRoom = useCallback(() => {
    // Kod generujemy lokalnie — przejście do onboardingu jest natychmiastowe,
    // a pokój powstaje w backendzie dopiero przy wejściu do gry (completeProfile).
    setRoomCode(makeRoomCode());
    setRoomTab("create");
    seedProfileFromGlobals();
    setStage("profile");
  }, [seedProfileFromGlobals]);

  const joinRoom = useCallback(() => {
    if (normalizedJoinCode.length < 6) {
      return;
    }
    setRoomCode(normalizedJoinCode);
    setRoomTab("join");
    seedProfileFromGlobals();
    setStage("profile");
  }, [normalizedJoinCode, seedProfileFromGlobals]);

  const completeProfile = useCallback(async () => {
    if (!canEnterRoom || !clientId || !roomCode) {
      return;
    }
    await roomApi.enterRoom({
      code: roomCode,
      asHost: roomTab === "create",
      clientId,
      name: normalizedName,
      avatarId,
      colorId,
      // Przy zakładaniu pokoju startujemy z globalnego domyślnego doboru treści.
      contentSelection: serializeSelection(globalSettings.contentSelection),
    });
    setRoomDoc(undefined);
    setPlayerDocs([]);
    setVoteDocs([]);
    setStage("room");
  }, [
    avatarId,
    canEnterRoom,
    clientId,
    colorId,
    globalSettings,
    normalizedName,
    roomCode,
    roomTab,
  ]);

  const leaveRoom = useCallback(() => {
    // Zamknij dialog i wróć NATYCHMIAST (synchronicznie) — usunięcie gracza leci w tle.
    // Sesję zapamiętujemy, żeby można było dołączyć ponownie z ekranu głównego.
    setConfirmLeaveOpen(false);
    setPlayersOpen(false);
    setSettingsOpen(false);
    if (roomCode && clientId) {
      setLastSession({ code: roomCode, name: playerName, avatarId, colorId });
      void roomApi.leaveRoom(roomCode, clientId);
    }
    setActingClientId(null);
    setStage("entry");
    setRoomCode("");
    setJoinCode("");
    setPlayerName("");
    setRoomDoc(undefined);
    setPlayerDocs([]);
    setVoteDocs([]);
  }, [avatarId, clientId, colorId, playerName, roomCode]);

  /** Powrót do ekranu głównego BEZ wychodzenia (sesja zostaje aktywna) — strzałka „wstecz". */
  const requestLeave = useCallback(() => {
    setPlayersOpen(false);
    setSettingsOpen(false);
    setConfirmLeaveOpen(true);
  }, []);

  /** Ponowne dołączenie do ostatniej sesji (z ekranu głównego). */
  const rejoinSession = useCallback(async () => {
    if (!lastSession || !clientId) {
      return;
    }
    const session = lastSession;
    setPlayerName(session.name);
    setAvatarId(session.avatarId);
    setColorId(session.colorId);
    setRoomCode(session.code);
    await roomApi.enterRoom({
      code: session.code,
      asHost: true,
      clientId,
      name: session.name,
      avatarId: session.avatarId,
      colorId: session.colorId,
    });
    setRoomDoc(undefined);
    setPlayerDocs([]);
    setVoteDocs([]);
    setLastSession(null);
    setStage("room");
  }, [clientId, lastSession]);

  const dismissSession = useCallback(() => setLastSession(null), []);

  /** Podgląd jako wybrany gracz (null = wróć do własnego widoku). */
  const setActingAs = useCallback(
    (target: string | null) => {
      setActingClientId(target === clientId ? null : target);
    },
    [clientId]
  );

  const kickPlayer = useCallback(
    (targetClientId: string) => {
      if (roomDoc && effectiveClientId) {
        const code = roomDoc.code;
        void roomApi
          .kickPlayer(roomDoc, effectiveClientId, targetClientId)
          .then(() => reload(code));
      }
    },
    [effectiveClientId, reload, roomDoc]
  );

  const addDemoPlayer = useCallback(() => {
    if (!roomCode) {
      return;
    }
    const i = playerDocs.length;
    void roomApi
      .enterRoom({
        code: roomCode,
        asHost: false,
        clientId: botClientId(),
        name: `Gracz ${i + 1}`,
        avatarId: avatarOrder[i % avatarOrder.length],
        colorId: colorOrder[i % colorOrder.length],
      })
      .then(() => reload(roomCode));
  }, [playerDocs.length, reload, roomCode]);

  const spin = useCallback(() => {
    if (roomDoc) {
      const code = roomDoc.code;
      void roomApi.startSpin(roomDoc, playerDocs).then(() => reload(code));
    }
  }, [playerDocs, reload, roomDoc]);

  const pickChallenge = useCallback(
    (type: ChallengeType) => {
      if (roomDoc) {
        const code = roomDoc.code;
        void roomApi.pickChallenge(roomDoc, type).then(() => reload(code));
      }
    },
    [reload, roomDoc]
  );

  const rerollChallenge = useCallback(() => {
    if (roomDoc) {
      const code = roomDoc.code;
      void roomApi.rerollChallenge(roomDoc).then(() => reload(code));
    }
  }, [reload, roomDoc]);

  const rerollLucky = useCallback(() => {
    if (roomDoc) {
      const code = roomDoc.code;
      void roomApi.rerollLucky(roomDoc, playerDocs).then(() => reload(code));
    }
  }, [playerDocs, reload, roomDoc]);

  const nextChallenge = useCallback(() => {
    if (!roomDoc || !effectiveClientId || !challengeType) {
      return;
    }
    const code = roomDoc.code;
    const action = challengeType === "prawda" ? "nextTruth" : "nextDare";
    void roomApi.requestAction(roomDoc, effectiveClientId, action).then(() => reload(code));
  }, [challengeType, effectiveClientId, reload, roomDoc]);

  const passTurn = useCallback(() => {
    if (roomDoc && effectiveClientId) {
      const code = roomDoc.code;
      void roomApi.requestAction(roomDoc, effectiveClientId, "endTurn").then(() => reload(code));
    }
  }, [effectiveClientId, reload, roomDoc]);

  const confirmApproval = useCallback(() => {
    if (roomDoc && roomDoc.pendingAction && effectiveClientId) {
      const code = roomDoc.code;
      void roomApi
        .upsertVote(code, roomDoc.pendingAction, effectiveClientId, true)
        .then(() => reload(code));
    }
  }, [effectiveClientId, reload, roomDoc]);

  const rejectApproval = useCallback(() => {
    if (roomDoc && roomDoc.pendingAction && effectiveClientId) {
      const code = roomDoc.code;
      void roomApi
        .upsertVote(code, roomDoc.pendingAction, effectiveClientId, false)
        .then(() => reload(code));
    }
  }, [effectiveClientId, reload, roomDoc]);

  /** Zamknięcie dialogu głosowania = anulowanie akcji (czyści pendingAction i głosy dla wszystkich). */
  const cancelApproval = useCallback(() => {
    if (roomDoc && roomDoc.pendingAction) {
      const code = roomDoc.code;
      void roomApi.cancelAction(code).then(() => reload(code));
    }
  }, [reload, roomDoc]);

  const updateSettings = useCallback(
    (patch: Partial<RoomSettings>) => {
      if (roomDoc) {
        const code = roomDoc.code;
        const merged = {
          endTurnApproval: settings.endTurnApproval,
          nextTruthApproval: settings.nextTruthApproval,
          nextDareApproval: settings.nextDareApproval,
          autoStart: settings.autoStart,
          ...patch,
        };
        void roomApi.updateSettings(code, merged).then(() => reload(code));
      }
    },
    [reload, roomDoc, settings]
  );

  /** Ustawia poziom doboru dla głównej kategorii (0 = wyłączona). Zapisuje na pokoju. */
  const setContentLevel = useCallback(
    (modeKey: string, level: ContentLevel) => {
      if (!roomDoc) return;
      const code = roomDoc.code;
      const next: ContentSelection = parseSelection(roomDoc.contentSelection);
      if (level <= 0) {
        delete next[modeKey];
      } else {
        next[modeKey] = level;
      }
      void roomApi.updateContentSelection(code, serializeSelection(next)).then(() => reload(code));
    },
    [reload, roomDoc]
  );

  /** Aktualizuje globalne ustawienia (imię/avatar/kolor) i zapisuje na dysk. */
  const updateGlobalSettings = useCallback((patch: Partial<GlobalSettings>) => {
    setGlobalSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveGlobalSettings(next);
      return next;
    });
  }, []);

  /** Ustawia poziom domyślnego doboru treści dla głównej kategorii (globalnie). */
  const setGlobalContentLevel = useCallback((modeKey: string, level: ContentLevel) => {
    setGlobalSettings((prev) => {
      const nextSelection: ContentSelection = { ...prev.contentSelection };
      if (level <= 0) {
        delete nextSelection[modeKey];
      } else {
        nextSelection[modeKey] = level;
      }
      const next = { ...prev, contentSelection: nextSelection };
      void saveGlobalSettings(next);
      return next;
    });
  }, []);

  return {
    // stan
    stage,
    roomTab,
    roomCode,
    joinCode,
    playerName,
    avatarId,
    colorId,
    players,
    phase,
    activeIndex,
    activePlayer,
    luckyIndex,
    luckyPlayer,
    amHost,
    amLucky,
    challengeType,
    challengeText,
    settings,
    contentBundle,
    contentSelection,
    globalSettings,
    globalSettingsOpen,
    settingsOpen,
    pendingApproval,
    approval,
    approvalCount,
    canEnterRoom,
    canSpin,
    normalizedName,
    normalizedJoinCode,
    // podgląd jako gracz testowy
    playersOpen,
    actingClientId,
    isImpersonating,
    viewAsPlayer,
    // wyjście z pokoju + zapamiętana sesja
    confirmLeaveOpen,
    lastSession,
    // settery pól formularza
    setRoomTab,
    setJoinCode,
    setPlayerName,
    setAvatarId,
    setColorId,
    setSettingsOpen,
    setPlayersOpen,
    setConfirmLeaveOpen,
    setGlobalSettingsOpen,
    // akcje
    createRoom,
    joinRoom,
    leaveRoom,
    requestLeave,
    rejoinSession,
    dismissSession,
    completeProfile,
    addDemoPlayer,
    setActingAs,
    kickPlayer,
    spin,
    pickChallenge,
    rerollLucky,
    rerollChallenge,
    nextChallenge,
    passTurn,
    confirmApproval,
    rejectApproval,
    cancelApproval,
    updateSettings,
    setContentLevel,
    updateGlobalSettings,
    setGlobalContentLevel,
  };
}

export type GameApi = ReturnType<typeof useGame>;
