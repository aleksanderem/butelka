import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../../convex/_generated/api";
import { avatarOrder } from "@/game/avatars";
import { colorOrder, defaultSettings, makeRoomCode } from "@/game/data";
import type {
  ApprovalState,
  AvatarId,
  ChallengeType,
  Phase,
  Player,
  RoomSettings,
  RoomTab,
} from "@/game/types";
import { useClientId } from "@/lib/client-id";
import type { PlayerColorId } from "@/theme/colors";

export type Stage = "entry" | "profile" | "room";

const SPIN_TICK_MS = 110;

function botClientId(): string {
  return `bot_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Cały stan i logika gry „Butelka”. Profil i nawigacja są lokalne, a stan pokoju
 * pochodzi z reaktywnego query Convex — ekrany konsumują niezmieniony interfejs GameApi.
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

  // Mutacje backendu.
  const enterRoomMut = useMutation(api.rooms.createOrJoinRoom);
  const leaveRoomMut = useMutation(api.rooms.leaveRoom);
  const kickPlayerMut = useMutation(api.rooms.kickPlayer);
  const spinMut = useMutation(api.rooms.spin);
  const pickChallengeMut = useMutation(api.rooms.pickChallenge);
  const rerollChallengeMut = useMutation(api.rooms.rerollChallenge);
  const rerollLuckyMut = useMutation(api.rooms.rerollLucky);
  const requestActionMut = useMutation(api.rooms.requestAction);
  const voteMut = useMutation(api.rooms.vote);
  const updateSettingsMut = useMutation(api.rooms.updateSettings);

  // Tożsamość, którą backend traktuje jako „Ty” (umożliwia podgląd jako gracz testowy).
  const effectiveClientId = actingClientId ?? clientId;

  // Reaktywny stan pokoju.
  const inRoom = stage === "room" && roomCode.length > 0 && effectiveClientId !== null;
  const state = useQuery(
    api.rooms.gameState,
    inRoom ? { code: roomCode, clientId: effectiveClientId! } : "skip"
  );

  const players: Player[] = useMemo(
    () =>
      (state?.players ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        avatarId: p.avatarId as AvatarId,
        colorId: p.colorId as PlayerColorId,
        isSelf: p.isSelf,
        isHost: p.isHost,
        clientId: p.clientId,
        approved: p.approved,
      })),
    [state]
  );

  const amHost = players.some((p) => p.isSelf && p.isHost);

  // Podgląd jako gracz testowy: kogo aktualnie oglądamy i czy to ktoś inny niż my.
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

  const phase: Phase = state?.phase ?? "lobby";
  const settings: RoomSettings = state?.settings ?? defaultSettings;
  const challengeType = (state?.challengeType ?? null) as ChallengeType | null;
  const challengeText = state?.challengeText ?? null;
  const pendingApproval = state?.pendingAction ?? null;
  const approval: ApprovalState | null = state?.approval ?? null;

  const luckyClientId = state?.luckyClientId ?? null;
  const luckyMatch = luckyClientId ? players.findIndex((p) => p.clientId === luckyClientId) : -1;
  const luckyIndex = luckyMatch >= 0 ? luckyMatch : null;
  const luckyPlayer = luckyIndex === null ? null : (players[luckyIndex] ?? null);
  const amLucky = luckyPlayer?.isSelf ?? false;

  // Animacja krążenia karty (czysto kliencka): podczas „spinning” migamy graczami.
  // setState żyje wyłącznie w callbacku interwału, nie w ciele efektu.
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
  useEffect(() => {
    if (!(inRoom && state === null)) {
      return;
    }
    const id = setTimeout(() => {
      setStage("entry");
      setRoomCode("");
    }, 0);
    return () => clearTimeout(id);
  }, [inRoom, state]);

  const normalizedName = playerName.trim();
  const normalizedJoinCode = joinCode.trim().toUpperCase();
  const canEnterRoom = normalizedName.length >= 2;
  const canSpin = phase === "lobby" && players.length >= 2;

  const approvalCount = useMemo(
    () =>
      [
        settings.requireEndTurnApproval,
        settings.requireNextTruthApproval,
        settings.requireNextDareApproval,
      ].filter(Boolean).length,
    [settings]
  );

  const createRoom = useCallback(() => {
    // Kod generujemy lokalnie — przejscie do onboardingu jest natychmiastowe,
    // a pokoj powstaje w backendzie dopiero przy wejsciu do gry (completeProfile).
    setRoomCode(makeRoomCode());
    setRoomTab("create");
    setStage("profile");
  }, []);

  const joinRoom = useCallback(() => {
    if (normalizedJoinCode.length < 4) {
      return;
    }
    setRoomCode(normalizedJoinCode);
    setRoomTab("join");
    setStage("profile");
  }, [normalizedJoinCode]);

  const completeProfile = useCallback(async () => {
    if (!canEnterRoom || !clientId || !roomCode) {
      return;
    }
    await enterRoomMut({
      code: roomCode,
      asHost: roomTab === "create",
      clientId,
      name: normalizedName,
      avatarId,
      colorId,
    });
    setStage("room");
  }, [avatarId, canEnterRoom, clientId, colorId, enterRoomMut, normalizedName, roomCode, roomTab]);

  const leaveRoom = useCallback(async () => {
    // Wychodzimy zawsze jako realne urządzenie, nie jako podglądany gracz testowy.
    if (roomCode && clientId) {
      await leaveRoomMut({ code: roomCode, clientId });
    }
    setActingClientId(null);
    setPlayersOpen(false);
    setSettingsOpen(false);
    setStage("entry");
    setRoomCode("");
    setJoinCode("");
    setPlayerName("");
  }, [clientId, leaveRoomMut, roomCode]);

  /** Podgląd jako wybrany gracz (null = wróć do własnego widoku). */
  const setActingAs = useCallback(
    (target: string | null) => {
      setActingClientId(target === clientId ? null : target);
    },
    [clientId]
  );

  const kickPlayer = useCallback(
    (targetClientId: string) => {
      if (roomCode && effectiveClientId) {
        void kickPlayerMut({ code: roomCode, hostClientId: effectiveClientId, targetClientId });
      }
    },
    [effectiveClientId, kickPlayerMut, roomCode]
  );

  const addDemoPlayer = useCallback(() => {
    if (!roomCode) {
      return;
    }
    const i = players.length;
    void enterRoomMut({
      code: roomCode,
      asHost: false,
      clientId: botClientId(),
      name: `Gracz ${i + 1}`,
      avatarId: avatarOrder[i % avatarOrder.length],
      colorId: colorOrder[i % colorOrder.length],
    });
  }, [enterRoomMut, players.length, roomCode]);

  const spin = useCallback(() => {
    if (roomCode) {
      void spinMut({ code: roomCode });
    }
  }, [roomCode, spinMut]);

  const pickChallenge = useCallback(
    (type: ChallengeType) => {
      if (roomCode) {
        void pickChallengeMut({ code: roomCode, type });
      }
    },
    [pickChallengeMut, roomCode]
  );

  const rerollChallenge = useCallback(() => {
    if (roomCode) {
      void rerollChallengeMut({ code: roomCode });
    }
  }, [rerollChallengeMut, roomCode]);

  const rerollLucky = useCallback(() => {
    if (roomCode) {
      void rerollLuckyMut({ code: roomCode });
    }
  }, [rerollLuckyMut, roomCode]);

  const nextChallenge = useCallback(() => {
    if (!roomCode || !effectiveClientId || !challengeType) {
      return;
    }
    void requestActionMut({
      code: roomCode,
      clientId: effectiveClientId,
      action: challengeType === "prawda" ? "nextTruth" : "nextDare",
    });
  }, [challengeType, effectiveClientId, requestActionMut, roomCode]);

  const passTurn = useCallback(() => {
    if (roomCode && effectiveClientId) {
      void requestActionMut({ code: roomCode, clientId: effectiveClientId, action: "endTurn" });
    }
  }, [effectiveClientId, requestActionMut, roomCode]);

  const confirmApproval = useCallback(() => {
    if (roomCode && effectiveClientId) {
      void voteMut({ code: roomCode, clientId: effectiveClientId, approved: true });
    }
  }, [effectiveClientId, roomCode, voteMut]);

  const rejectApproval = useCallback(() => {
    if (roomCode && effectiveClientId) {
      void voteMut({ code: roomCode, clientId: effectiveClientId, approved: false });
    }
  }, [effectiveClientId, roomCode, voteMut]);

  const updateSettings = useCallback(
    (patch: Partial<RoomSettings>) => {
      if (roomCode) {
        void updateSettingsMut({ code: roomCode, settings: { ...settings, ...patch } });
      }
    },
    [roomCode, settings, updateSettingsMut]
  );

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
    // settery pól formularza
    setRoomTab,
    setJoinCode,
    setPlayerName,
    setAvatarId,
    setColorId,
    setSettingsOpen,
    setPlayersOpen,
    // akcje
    createRoom,
    joinRoom,
    leaveRoom,
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
    updateSettings,
  };
}

export type GameApi = ReturnType<typeof useGame>;
