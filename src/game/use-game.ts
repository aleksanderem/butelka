import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../../convex/_generated/api";
import { avatarPresets, colorOrder, defaultSettings } from "@/game/data";
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
  const [avatarId, setAvatarId] = useState<AvatarId>(avatarPresets[0].id);
  const [colorId, setColorId] = useState<PlayerColorId>(colorOrder[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [spinTick, setSpinTick] = useState(0);

  // Mutacje backendu.
  const createRoomMut = useMutation(api.rooms.createRoom);
  const joinRoomMut = useMutation(api.rooms.joinRoom);
  const leaveRoomMut = useMutation(api.rooms.leaveRoom);
  const spinMut = useMutation(api.rooms.spin);
  const pickChallengeMut = useMutation(api.rooms.pickChallenge);
  const rerollChallengeMut = useMutation(api.rooms.rerollChallenge);
  const rerollLuckyMut = useMutation(api.rooms.rerollLucky);
  const requestActionMut = useMutation(api.rooms.requestAction);
  const voteMut = useMutation(api.rooms.vote);
  const updateSettingsMut = useMutation(api.rooms.updateSettings);

  // Reaktywny stan pokoju.
  const inRoom = stage === "room" && roomCode.length > 0 && clientId !== null;
  const state = useQuery(
    api.rooms.gameState,
    inRoom ? { code: roomCode, clientId: clientId! } : "skip"
  );

  const players: Player[] = useMemo(
    () =>
      (state?.players ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        avatarId: p.avatarId as AvatarId,
        colorId: p.colorId as PlayerColorId,
        isSelf: p.isSelf,
        clientId: p.clientId,
        approved: p.approved,
      })),
    [state]
  );

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

  const createRoom = useCallback(async () => {
    if (!clientId) {
      return;
    }
    const { code } = await createRoomMut({ clientId });
    setRoomCode(code);
    setRoomTab("create");
    setStage("profile");
  }, [clientId, createRoomMut]);

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
    await joinRoomMut({ code: roomCode, clientId, name: normalizedName, avatarId, colorId });
    setStage("room");
  }, [avatarId, canEnterRoom, clientId, colorId, joinRoomMut, normalizedName, roomCode]);

  const leaveRoom = useCallback(async () => {
    if (roomCode && clientId) {
      await leaveRoomMut({ code: roomCode, clientId });
    }
    setStage("entry");
    setRoomCode("");
    setJoinCode("");
    setPlayerName("");
  }, [clientId, leaveRoomMut, roomCode]);

  const addDemoPlayer = useCallback(() => {
    if (!roomCode) {
      return;
    }
    const i = players.length;
    const preset = avatarPresets[i % avatarPresets.length];
    void joinRoomMut({
      code: roomCode,
      clientId: botClientId(),
      name: `Gracz ${i + 1}`,
      avatarId: preset.id,
      colorId: colorOrder[i % colorOrder.length],
    });
  }, [joinRoomMut, players.length, roomCode]);

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
    if (!roomCode || !clientId || !challengeType) {
      return;
    }
    void requestActionMut({
      code: roomCode,
      clientId,
      action: challengeType === "prawda" ? "nextTruth" : "nextDare",
    });
  }, [challengeType, clientId, requestActionMut, roomCode]);

  const passTurn = useCallback(() => {
    if (roomCode && clientId) {
      void requestActionMut({ code: roomCode, clientId, action: "endTurn" });
    }
  }, [clientId, requestActionMut, roomCode]);

  const confirmApproval = useCallback(() => {
    if (roomCode && clientId) {
      void voteMut({ code: roomCode, clientId, approved: true });
    }
  }, [clientId, roomCode, voteMut]);

  const rejectApproval = useCallback(() => {
    if (roomCode && clientId) {
      void voteMut({ code: roomCode, clientId, approved: false });
    }
  }, [clientId, roomCode, voteMut]);

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
    // settery pól formularza
    setRoomTab,
    setJoinCode,
    setPlayerName,
    setAvatarId,
    setColorId,
    setSettingsOpen,
    // akcje
    createRoom,
    joinRoom,
    leaveRoom,
    completeProfile,
    addDemoPlayer,
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
