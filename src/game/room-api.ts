// Niskopoziomowe operacje na pokoju w Appwrite (odpowiednik dawnych mutacji Convex,
// teraz po stronie klienta). use-game.ts dokłada React, reaktywność (Realtime) i to,
// że rozstrzygnięcia (spin finalize, liczenie głosów) wykonuje wyłącznie host.

import { Query } from "@/lib/appwrite-sdk";
import { COL_PLAYERS, COL_ROOMS, COL_VOTES, DB_ID, databases } from "@/lib/appwrite";
import { pickPrompt } from "@/game/prompts";
import type { ApprovalAction, ChallengeType, Phase } from "@/game/types";

/** Ile trwa animacja krążenia karty, zanim host ujawni szczęśliwca. */
export const SPIN_MS = 3200;

const QUERY_LIMIT = 100;

export interface RoomDoc {
  $id: string;
  code: string;
  phase: Phase;
  hostClientId: string;
  luckyClientId: string | null;
  spinSeed: number | null;
  spinStartedAt: number | null;
  challengeType: ChallengeType | null;
  challengeText: string | null;
  requireEndTurnApproval: boolean;
  requireNextTruthApproval: boolean;
  requireNextDareApproval: boolean;
  pendingAction: ApprovalAction | null;
  createdAt: number;
}

export interface PlayerDoc {
  $id: string;
  roomCode: string;
  clientId: string;
  name: string;
  avatarId: string;
  colorId: string;
  joinedAt: number;
}

export interface VoteDoc {
  $id: string;
  roomCode: string;
  action: ApprovalAction;
  clientId: string;
  approved: boolean;
}

export interface RoomState {
  room: RoomDoc;
  players: PlayerDoc[];
  votes: VoteDoc[];
}

export interface EnterRoomParams {
  code: string;
  asHost: boolean;
  clientId: string;
  name: string;
  avatarId: string;
  colorId: string;
}

type RoomPatch = Partial<Omit<RoomDoc, "$id">>;

function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: number }).code;
  }
  return undefined;
}

function playerId(code: string, clientId: string): string {
  return `${code}_${clientId}`;
}

function voteId(code: string, clientId: string): string {
  return `${code}_${clientId}`;
}

export function resetRoundPatch(): RoomPatch {
  return {
    phase: "lobby",
    luckyClientId: null,
    spinSeed: null,
    spinStartedAt: null,
    challengeType: null,
    challengeText: null,
    pendingAction: null,
  };
}

export async function updateRoom(code: string, patch: RoomPatch): Promise<void> {
  await databases.updateDocument(DB_ID, COL_ROOMS, code, patch);
}

/** Wczytuje pełny stan pokoju. Zwraca null, gdy pokój nie istnieje (404). Inne błędy rzuca. */
export async function loadRoomState(code: string): Promise<RoomState | null> {
  let room: RoomDoc;
  try {
    room = (await databases.getDocument(DB_ID, COL_ROOMS, code)) as unknown as RoomDoc;
  } catch (error) {
    if (statusOf(error) === 404) {
      return null;
    }
    throw error;
  }
  const [players, votes] = await Promise.all([
    databases.listDocuments(DB_ID, COL_PLAYERS, [
      Query.equal("roomCode", code),
      Query.limit(QUERY_LIMIT),
    ]),
    databases.listDocuments(DB_ID, COL_VOTES, [
      Query.equal("roomCode", code),
      Query.limit(QUERY_LIMIT),
    ]),
  ]);
  return {
    room,
    players: players.documents as unknown as PlayerDoc[],
    votes: votes.documents as unknown as VoteDoc[],
  };
}

/** Wejście do pokoju: tworzy (gdy asHost i nie istnieje) albo dołącza; upsertuje gracza. */
export async function enterRoom({
  code,
  asHost,
  clientId,
  name,
  avatarId,
  colorId,
}: EnterRoomParams): Promise<void> {
  let exists = true;
  try {
    await databases.getDocument(DB_ID, COL_ROOMS, code);
  } catch (error) {
    if (statusOf(error) === 404) {
      exists = false;
    } else {
      throw error;
    }
  }

  if (!exists) {
    if (!asHost) {
      throw new Error("Pokój o tym kodzie nie istnieje.");
    }
    await databases.createDocument(DB_ID, COL_ROOMS, code, {
      code,
      phase: "lobby",
      hostClientId: clientId,
      luckyClientId: null,
      spinSeed: null,
      spinStartedAt: null,
      challengeType: null,
      challengeText: null,
      requireEndTurnApproval: true,
      requireNextTruthApproval: true,
      requireNextDareApproval: false,
      pendingAction: null,
      createdAt: Date.now(),
    });
  }

  const id = playerId(code, clientId);
  try {
    await databases.createDocument(DB_ID, COL_PLAYERS, id, {
      roomCode: code,
      clientId,
      name,
      avatarId,
      colorId,
      joinedAt: Date.now(),
    });
  } catch (error) {
    if (statusOf(error) === 409) {
      await databases.updateDocument(DB_ID, COL_PLAYERS, id, { name, avatarId, colorId });
    } else {
      throw error;
    }
  }
}

async function deletePlayerIfRoomEmpty(code: string): Promise<void> {
  const remaining = await databases.listDocuments(DB_ID, COL_PLAYERS, [
    Query.equal("roomCode", code),
    Query.limit(1),
  ]);
  if (remaining.total === 0) {
    await databases.deleteDocument(DB_ID, COL_ROOMS, code).catch(() => {});
  }
}

export async function leaveRoom(code: string, clientId: string): Promise<void> {
  await databases.deleteDocument(DB_ID, COL_PLAYERS, playerId(code, clientId)).catch(() => {});
  await deletePlayerIfRoomEmpty(code);
}

export async function kickPlayer(
  room: RoomDoc,
  requesterClientId: string,
  targetClientId: string
): Promise<void> {
  if (room.hostClientId !== requesterClientId) {
    return; // tylko host wyrzuca
  }
  if (targetClientId === room.hostClientId) {
    return; // host nie wyrzuca samego siebie
  }
  await databases
    .deleteDocument(DB_ID, COL_PLAYERS, playerId(room.code, targetClientId))
    .catch(() => {});
  if (room.luckyClientId === targetClientId) {
    await clearVotes(room.code);
    await updateRoom(room.code, resetRoundPatch());
  }
  await deletePlayerIfRoomEmpty(room.code);
}

export async function clearVotes(code: string): Promise<void> {
  const list = await databases.listDocuments(DB_ID, COL_VOTES, [
    Query.equal("roomCode", code),
    Query.limit(QUERY_LIMIT),
  ]);
  await Promise.all(
    list.documents.map((doc) => databases.deleteDocument(DB_ID, COL_VOTES, doc.$id).catch(() => {}))
  );
}

export async function upsertVote(
  code: string,
  action: ApprovalAction,
  clientId: string,
  approved: boolean
): Promise<void> {
  const id = voteId(code, clientId);
  try {
    await databases.createDocument(DB_ID, COL_VOTES, id, {
      roomCode: code,
      action,
      clientId,
      approved,
    });
  } catch (error) {
    if (statusOf(error) === 409) {
      await databases.updateDocument(DB_ID, COL_VOTES, id, { action, approved });
    } else {
      throw error;
    }
  }
}

function spinPatch(targetClientId: string): RoomPatch {
  return {
    phase: "spinning",
    luckyClientId: targetClientId,
    spinSeed: Math.floor(Math.random() * 1_000_000),
    spinStartedAt: Date.now(),
    challengeType: null,
    challengeText: null,
    pendingAction: null,
  };
}

export async function startSpin(room: RoomDoc, players: PlayerDoc[]): Promise<void> {
  if (room.phase !== "lobby" || players.length < 2) {
    return;
  }
  const target = players[Math.floor(Math.random() * players.length)];
  await updateRoom(room.code, spinPatch(target.clientId));
}

export async function rerollLucky(room: RoomDoc, players: PlayerDoc[]): Promise<void> {
  if (players.length < 2) {
    return;
  }
  await clearVotes(room.code);
  const target = players[Math.floor(Math.random() * players.length)];
  await updateRoom(room.code, spinPatch(target.clientId));
}

/** Host: po SPIN_MS ujawnia szczęśliwca (spinning -> chosen), o ile to wciąż ta sama tura. */
export async function finalizeSpin(code: string, seed: number | null): Promise<void> {
  let fresh: RoomDoc;
  try {
    fresh = (await databases.getDocument(DB_ID, COL_ROOMS, code)) as unknown as RoomDoc;
  } catch {
    return;
  }
  if (fresh.phase === "spinning" && fresh.spinSeed === seed) {
    await updateRoom(code, { phase: "chosen" });
  }
}

export async function pickChallenge(room: RoomDoc, type: ChallengeType): Promise<void> {
  if (room.phase !== "chosen") {
    return;
  }
  await updateRoom(room.code, {
    challengeType: type,
    challengeText: pickPrompt(type),
    phase: "task",
  });
}

export async function rerollChallenge(room: RoomDoc): Promise<void> {
  if (room.phase !== "task" || !room.challengeType) {
    return;
  }
  await updateRoom(room.code, {
    challengeText: pickPrompt(room.challengeType, room.challengeText),
  });
}

function settingRequiresApproval(room: RoomDoc, action: ApprovalAction): boolean {
  if (action === "endTurn") return room.requireEndTurnApproval;
  if (action === "nextTruth") return room.requireNextTruthApproval;
  return room.requireNextDareApproval;
}

/** Wykonuje akcję (koniec tury / następna prawda / następne wyzwanie) i czyści głosy. */
export async function applyAction(code: string, action: ApprovalAction): Promise<void> {
  await clearVotes(code);
  if (action === "endTurn") {
    await updateRoom(code, resetRoundPatch());
    return;
  }
  const type: ChallengeType = action === "nextTruth" ? "prawda" : "wyzwanie";
  await updateRoom(code, {
    challengeType: type,
    challengeText: pickPrompt(type),
    phase: "task",
    pendingAction: null,
  });
}

/**
 * Inicjator prosi o akcję. Gdy ustawienie nie wymaga zgody — wykonuje od razu.
 * Gdy wymaga — ustawia pendingAction, czyści głosy i sam głosuje „za” (resztę rozstrzyga host).
 */
export async function requestAction(
  room: RoomDoc,
  clientId: string,
  action: ApprovalAction
): Promise<void> {
  if (!settingRequiresApproval(room, action)) {
    await applyAction(room.code, action);
    return;
  }
  await clearVotes(room.code);
  await updateRoom(room.code, { pendingAction: action });
  await upsertVote(room.code, action, clientId, true);
}

export async function cancelAction(code: string): Promise<void> {
  await clearVotes(code);
  await updateRoom(code, { pendingAction: null });
}

/**
 * Host rozstrzyga głosowanie: gdy „za” osiągnie większość — wykonuje akcję;
 * gdy większość już niemożliwa — anuluje. Idempotentne dzięki sprawdzeniu pendingAction.
 */
export async function resolveVotes(
  room: RoomDoc,
  players: PlayerDoc[],
  votes: VoteDoc[]
): Promise<void> {
  const action = room.pendingAction;
  if (!action) {
    return;
  }
  const relevant = votes.filter((vote) => vote.action === action);
  const total = players.length;
  const needed = Math.floor(total / 2) + 1;
  const approved = relevant.filter((vote) => vote.approved).length;
  const rejected = relevant.filter((vote) => !vote.approved).length;

  if (approved >= needed) {
    // Świeży odczyt chroni przed podwójnym wykonaniem przy nakładających się eventach.
    const fresh = (await databases.getDocument(DB_ID, COL_ROOMS, room.code)) as unknown as RoomDoc;
    if (fresh.pendingAction === action) {
      await applyAction(room.code, action);
    }
    return;
  }
  if (total - rejected < needed) {
    await cancelAction(room.code);
  }
}

export async function updateSettings(
  code: string,
  settings: {
    requireEndTurnApproval: boolean;
    requireNextTruthApproval: boolean;
    requireNextDareApproval: boolean;
  }
): Promise<void> {
  await updateRoom(code, settings);
}
