import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  avatarPresets,
  colorOrder,
  defaultSettings,
  demoPlayers,
  makeRoomCode,
  pickPrompt,
} from "@/game/data";
import type {
  ApprovalAction,
  AvatarId,
  ChallengeType,
  Phase,
  Player,
  RoomSettings,
  RoomTab,
} from "@/game/types";

export type Stage = "entry" | "profile" | "room";

const SPIN_INTERVAL_MS = 420;

function makeId(): string {
  return `p_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Cały stan i logika gry „Butelka” w jednym hooku. To jedyna warstwa, którą
 * podmienimy przy wpinaniu multiplayera — ekrany konsumują tylko ten interfejs.
 */
export function useGame() {
  const [stage, setStage] = useState<Stage>("entry");
  const [roomTab, setRoomTab] = useState<RoomTab>("create");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [playerName, setPlayerName] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>(avatarPresets[0].id);
  const [colorId, setColorId] = useState(colorOrder[0]);

  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [luckyIndex, setLuckyIndex] = useState<number | null>(null);
  const [challengeType, setChallengeType] = useState<ChallengeType | null>(null);
  const [challengeText, setChallengeText] = useState<string | null>(null);

  const [settings, setSettings] = useState<RoomSettings>(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<ApprovalAction | null>(null);

  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  const normalizedName = playerName.trim();
  const normalizedJoinCode = joinCode.trim().toUpperCase();
  const canEnterRoom = normalizedName.length >= 2;
  const canSpin = phase === "lobby" && players.length >= 2;

  const luckyPlayer = luckyIndex === null ? null : (players[luckyIndex] ?? null);
  const activePlayer = activeIndex === null ? null : (players[activeIndex] ?? null);

  const approvalCount = useMemo(
    () =>
      [
        settings.requireEndTurnApproval,
        settings.requireNextTruthApproval,
        settings.requireNextDareApproval,
      ].filter(Boolean).length,
    [settings]
  );

  const resetRound = useCallback(() => {
    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
    setPhase("lobby");
    setActiveIndex(null);
    setLuckyIndex(null);
    setChallengeType(null);
    setChallengeText(null);
  }, []);

  const createRoom = useCallback(() => {
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

  const leaveRoom = useCallback(() => {
    resetRound();
    setStage("entry");
    setRoomCode("");
    setJoinCode("");
    setPlayers([]);
    setPlayerName("");
  }, [resetRound]);

  const completeProfile = useCallback(() => {
    if (!canEnterRoom) {
      return;
    }
    const self: Player = {
      id: makeId(),
      name: normalizedName,
      avatarId,
      colorId,
      isSelf: true,
    };
    const others: Player[] = demoPlayers.map((p) => ({ ...p, id: makeId() }));
    setPlayers([self, ...others]);
    setStage("room");
  }, [avatarId, canEnterRoom, colorId, normalizedName]);

  const addDemoPlayer = useCallback(() => {
    setPlayers((current) => {
      const preset = avatarPresets[current.length % avatarPresets.length];
      return [
        ...current,
        {
          id: makeId(),
          name: `Gracz ${current.length + 1}`,
          avatarId: preset.id,
          colorId: colorOrder[current.length % colorOrder.length],
        },
      ];
    });
  }, []);

  const spin = useCallback(() => {
    setPlayers((current) => {
      if (current.length < 2) {
        return current;
      }
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }

      const targetIndex = Math.floor(Math.random() * current.length);
      const rounds = current.length * 2 + targetIndex + 1;
      let step = 0;

      setPhase("spinning");
      setLuckyIndex(null);
      setChallengeType(null);
      setChallengeText(null);
      setActiveIndex(0);

      const tick = () => {
        step += 1;
        setActiveIndex(step % current.length);
        if (step >= rounds) {
          setActiveIndex(targetIndex);
          setLuckyIndex(targetIndex);
          setPhase("chosen");
          return;
        }
        spinTimerRef.current = setTimeout(tick, SPIN_INTERVAL_MS);
      };
      spinTimerRef.current = setTimeout(tick, SPIN_INTERVAL_MS);
      return current;
    });
  }, []);

  const pickChallenge = useCallback((type: ChallengeType) => {
    setChallengeType(type);
    setChallengeText(pickPrompt(type));
    setPhase("task");
  }, []);

  const rerollLucky = useCallback(() => {
    resetRound();
    // pozwól stanowi się wyczyścić, potem losuj od nowa
    setTimeout(spin, 0);
  }, [resetRound, spin]);

  const rerollChallenge = useCallback(() => {
    setChallengeText((current) => {
      if (!challengeType) {
        return current;
      }
      return pickPrompt(challengeType, current ?? undefined);
    });
  }, [challengeType]);

  const performNextChallenge = useCallback((type: ChallengeType) => {
    setChallengeType(type);
    setChallengeText(pickPrompt(type));
    setPhase("task");
  }, []);

  const requestApprovalOrRun = useCallback(
    (action: ApprovalAction, run: () => void) => {
      const requires =
        (action === "endTurn" && settings.requireEndTurnApproval) ||
        (action === "nextTruth" && settings.requireNextTruthApproval) ||
        (action === "nextDare" && settings.requireNextDareApproval);
      if (requires) {
        setPendingApproval(action);
        return;
      }
      run();
    },
    [settings]
  );

  const nextChallenge = useCallback(() => {
    if (!challengeType) {
      return;
    }
    requestApprovalOrRun(challengeType === "prawda" ? "nextTruth" : "nextDare", () =>
      performNextChallenge(challengeType)
    );
  }, [challengeType, performNextChallenge, requestApprovalOrRun]);

  const passTurn = useCallback(() => {
    requestApprovalOrRun("endTurn", resetRound);
  }, [requestApprovalOrRun, resetRound]);

  const confirmApproval = useCallback(() => {
    const action = pendingApproval;
    setPendingApproval(null);
    if (action === "endTurn") {
      resetRound();
    } else if (action === "nextTruth") {
      performNextChallenge("prawda");
    } else if (action === "nextDare") {
      performNextChallenge("wyzwanie");
    }
  }, [pendingApproval, performNextChallenge, resetRound]);

  const rejectApproval = useCallback(() => {
    setPendingApproval(null);
  }, []);

  const updateSettings = useCallback((patch: Partial<RoomSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
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
    challengeType,
    challengeText,
    settings,
    settingsOpen,
    pendingApproval,
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
