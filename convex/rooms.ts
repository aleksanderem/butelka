import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { pickPrompt } from "./prompts";
import { approvalActionValidator, challengeTypeValidator, settingsValidator } from "./schema";

const DEFAULT_SETTINGS = {
  requireEndTurnApproval: true,
  requireNextTruthApproval: true,
  requireNextDareApproval: false,
};

/** Ile trwa animacja krążenia karty, zanim serwer ujawni szczęśliwca. */
const SPIN_MS = 3200;

const profileArgs = {
  clientId: v.string(),
  name: v.string(),
  avatarId: v.string(),
  colorId: v.string(),
};

async function roomByCode(ctx: QueryCtx, code: string): Promise<Doc<"rooms"> | null> {
  return ctx.db
    .query("rooms")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();
}

async function listPlayers(ctx: QueryCtx, roomId: Id<"rooms">): Promise<Doc<"players">[]> {
  return ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();
}

function resetRoundPatch() {
  return {
    phase: "lobby" as const,
    luckyClientId: null,
    spinSeed: null,
    spinStartedAt: null,
    challengeType: null,
    challengeText: null,
    pendingAction: null,
  };
}

/**
 * Wejscie do pokoju: tworzy pokoj (gdy asHost i jeszcze nie istnieje) albo dolacza
 * do istniejacego. Kod generuje front, wiec „Utworz pokoj” nie czeka na backend.
 */
export const createOrJoinRoom = mutation({
  args: { code: v.string(), asHost: v.boolean(), ...profileArgs },
  handler: async (ctx, { code, asHost, clientId, name, avatarId, colorId }) => {
    let room = await roomByCode(ctx, code);
    if (!room) {
      if (!asHost) {
        throw new Error("Pokój o tym kodzie nie istnieje.");
      }
      const id = await ctx.db.insert("rooms", {
        code,
        phase: "lobby",
        hostClientId: clientId,
        luckyClientId: null,
        spinSeed: null,
        spinStartedAt: null,
        challengeType: null,
        challengeText: null,
        settings: DEFAULT_SETTINGS,
        pendingAction: null,
        createdAt: Date.now(),
      });
      room = (await ctx.db.get(id))!;
    }

    const existing = await ctx.db
      .query("players")
      .withIndex("by_room_client", (q) => q.eq("roomId", room._id).eq("clientId", clientId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { name, avatarId, colorId });
    } else {
      await ctx.db.insert("players", {
        roomId: room._id,
        clientId,
        name,
        avatarId,
        colorId,
        joinedAt: Date.now(),
      });
    }
    return { code: room.code };
  },
});

export const leaveRoom = mutation({
  args: { code: v.string(), clientId: v.string() },
  handler: async (ctx, { code, clientId }) => {
    const room = await roomByCode(ctx, code);
    if (!room) {
      return;
    }
    const player = await ctx.db
      .query("players")
      .withIndex("by_room_client", (q) => q.eq("roomId", room._id).eq("clientId", clientId))
      .unique();
    if (player) {
      await ctx.db.delete(player._id);
    }
    const remaining = await listPlayers(ctx, room._id);
    if (remaining.length === 0) {
      await ctx.db.delete(room._id);
    }
  },
});

export const spin = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const room = await roomByCode(ctx, code);
    if (!room || room.phase !== "lobby") {
      return;
    }
    const players = await listPlayers(ctx, room._id);
    if (players.length < 2) {
      return;
    }
    const target = players[Math.floor(Math.random() * players.length)];
    await ctx.db.patch(room._id, {
      phase: "spinning",
      luckyClientId: target.clientId,
      spinSeed: Math.floor(Math.random() * 1_000_000),
      spinStartedAt: Date.now(),
      challengeType: null,
      challengeText: null,
      pendingAction: null,
    });
    await ctx.scheduler.runAfter(SPIN_MS, internal.rooms.finalizeSpin, { roomId: room._id });
  },
});

export const finalizeSpin = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db.get(roomId);
    if (room && room.phase === "spinning") {
      await ctx.db.patch(roomId, { phase: "chosen" });
    }
  },
});

export const pickChallenge = mutation({
  args: { code: v.string(), type: challengeTypeValidator },
  handler: async (ctx, { code, type }) => {
    const room = await roomByCode(ctx, code);
    if (!room || room.phase !== "chosen") {
      return;
    }
    await ctx.db.patch(room._id, {
      challengeType: type,
      challengeText: pickPrompt(type),
      phase: "task",
    });
  },
});

export const rerollChallenge = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const room = await roomByCode(ctx, code);
    if (!room || room.phase !== "task" || !room.challengeType) {
      return;
    }
    await ctx.db.patch(room._id, {
      challengeText: pickPrompt(room.challengeType, room.challengeText),
    });
  },
});

export const rerollLucky = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const room = await roomByCode(ctx, code);
    if (!room) {
      return;
    }
    const players = await listPlayers(ctx, room._id);
    if (players.length < 2) {
      return;
    }
    await clearVotes(ctx, room._id);
    const target = players[Math.floor(Math.random() * players.length)];
    await ctx.db.patch(room._id, {
      phase: "spinning",
      luckyClientId: target.clientId,
      spinSeed: Math.floor(Math.random() * 1_000_000),
      spinStartedAt: Date.now(),
      challengeType: null,
      challengeText: null,
      pendingAction: null,
    });
    await ctx.scheduler.runAfter(SPIN_MS, internal.rooms.finalizeSpin, { roomId: room._id });
  },
});

function settingRequiresApproval(
  room: Doc<"rooms">,
  action: "endTurn" | "nextTruth" | "nextDare"
): boolean {
  if (action === "endTurn") return room.settings.requireEndTurnApproval;
  if (action === "nextTruth") return room.settings.requireNextTruthApproval;
  return room.settings.requireNextDareApproval;
}

async function applyAction(
  ctx: MutationCtx,
  room: Doc<"rooms">,
  action: "endTurn" | "nextTruth" | "nextDare"
) {
  await clearVotes(ctx, room._id);
  if (action === "endTurn") {
    await ctx.db.patch(room._id, resetRoundPatch());
    return;
  }
  const type = action === "nextTruth" ? "prawda" : "wyzwanie";
  await ctx.db.patch(room._id, {
    challengeType: type,
    challengeText: pickPrompt(type),
    phase: "task",
    pendingAction: null,
  });
}

async function clearVotes(ctx: MutationCtx, roomId: Id<"rooms">) {
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();
  await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));
}

export const requestAction = mutation({
  args: { code: v.string(), clientId: v.string(), action: approvalActionValidator },
  handler: async (ctx, { code, clientId, action }) => {
    const room = await roomByCode(ctx, code);
    if (!room) {
      return;
    }
    if (!settingRequiresApproval(room, action)) {
      await applyAction(ctx, room, action);
      return;
    }
    await clearVotes(ctx, room._id);
    await ctx.db.patch(room._id, { pendingAction: action });
    // Inicjator (szczęśliwiec) automatycznie głosuje za.
    await ctx.db.insert("votes", { roomId: room._id, action, clientId, approved: true });
    await resolveVotes(ctx, room._id);
  },
});

export const vote = mutation({
  args: { code: v.string(), clientId: v.string(), approved: v.boolean() },
  handler: async (ctx, { code, clientId, approved }) => {
    const room = await roomByCode(ctx, code);
    if (!room || !room.pendingAction) {
      return;
    }
    const action = room.pendingAction;
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .filter((q) => q.eq(q.field("clientId"), clientId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { approved, action });
    } else {
      await ctx.db.insert("votes", { roomId: room._id, action, clientId, approved });
    }
    await resolveVotes(ctx, room._id);
  },
});

/** Sprawdza, czy głosowanie osiągnęło rozstrzygnięcie i ewentualnie wykonuje akcję. */
async function resolveVotes(ctx: MutationCtx, roomId: Id<"rooms">) {
  const room = await ctx.db.get(roomId);
  if (!room || !room.pendingAction) {
    return;
  }
  const players = await listPlayers(ctx, roomId);
  const total = players.length;
  const needed = Math.floor(total / 2) + 1;
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .filter((q) => q.eq(q.field("action"), room.pendingAction!))
    .collect();
  const approved = votes.filter((vote) => vote.approved).length;
  const rejected = votes.filter((vote) => !vote.approved).length;

  if (approved >= needed) {
    await applyAction(ctx, room, room.pendingAction);
    return;
  }
  if (total - rejected < needed) {
    // Większość już niemożliwa — anuluj akcję.
    await clearVotes(ctx, roomId);
    await ctx.db.patch(roomId, { pendingAction: null });
  }
}

export const cancelAction = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const room = await roomByCode(ctx, code);
    if (!room) {
      return;
    }
    await clearVotes(ctx, room._id);
    await ctx.db.patch(room._id, { pendingAction: null });
  },
});

export const updateSettings = mutation({
  args: { code: v.string(), settings: settingsValidator },
  handler: async (ctx, { code, settings }) => {
    const room = await roomByCode(ctx, code);
    if (!room) {
      return;
    }
    await ctx.db.patch(room._id, { settings });
  },
});

export const gameState = query({
  args: { code: v.string(), clientId: v.string() },
  handler: async (ctx, { code, clientId }) => {
    const room = await roomByCode(ctx, code);
    if (!room) {
      return null;
    }
    const players = await listPlayers(ctx, room._id);
    players.sort((a, b) => a.joinedAt - b.joinedAt);

    const votes = room.pendingAction
      ? await ctx.db
          .query("votes")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .filter((q) => q.eq(q.field("action"), room.pendingAction!))
          .collect()
      : [];

    const total = players.length;
    const approvedClientIds = new Set(
      votes.filter((vote) => vote.approved).map((vote) => vote.clientId)
    );
    const myVote = votes.find((vote) => vote.clientId === clientId);

    return {
      code: room.code,
      phase: room.phase,
      settings: room.settings,
      challengeType: room.challengeType,
      challengeText: room.challengeText,
      pendingAction: room.pendingAction,
      luckyClientId: room.luckyClientId,
      spinSeed: room.spinSeed,
      spinStartedAt: room.spinStartedAt,
      hostClientId: room.hostClientId,
      players: players.map((player) => ({
        id: player._id,
        clientId: player.clientId,
        name: player.name,
        avatarId: player.avatarId,
        colorId: player.colorId,
        isSelf: player.clientId === clientId,
        approved: approvedClientIds.has(player.clientId),
      })),
      approval: room.pendingAction
        ? {
            action: room.pendingAction,
            approved: approvedClientIds.size,
            total,
            needed: Math.floor(total / 2) + 1,
            myVote: myVote ? myVote.approved : null,
          }
        : null,
    };
  },
});
