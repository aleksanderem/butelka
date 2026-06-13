import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const phaseValidator = v.union(
  v.literal("lobby"),
  v.literal("spinning"),
  v.literal("chosen"),
  v.literal("task")
);

export const challengeTypeValidator = v.union(v.literal("prawda"), v.literal("wyzwanie"));

export const approvalActionValidator = v.union(
  v.literal("endTurn"),
  v.literal("nextTruth"),
  v.literal("nextDare")
);

export const settingsValidator = v.object({
  requireEndTurnApproval: v.boolean(),
  requireNextTruthApproval: v.boolean(),
  requireNextDareApproval: v.boolean(),
});

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    phase: phaseValidator,
    hostClientId: v.string(),
    luckyClientId: v.union(v.string(), v.null()),
    /** Ziarno do deterministycznej animacji krążenia karty u wszystkich klientów. */
    spinSeed: v.union(v.number(), v.null()),
    spinStartedAt: v.union(v.number(), v.null()),
    challengeType: v.union(challengeTypeValidator, v.null()),
    challengeText: v.union(v.string(), v.null()),
    settings: settingsValidator,
    /** Akcja czekająca na głosowanie większości (null = brak). */
    pendingAction: v.union(approvalActionValidator, v.null()),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  players: defineTable({
    roomId: v.id("rooms"),
    clientId: v.string(),
    name: v.string(),
    avatarId: v.string(),
    colorId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId", "joinedAt"])
    .index("by_room_client", ["roomId", "clientId"]),

  votes: defineTable({
    roomId: v.id("rooms"),
    /** Akcja, której dotyczy głos — chroni przed liczeniem głosów ze starej rundy. */
    action: approvalActionValidator,
    clientId: v.string(),
    approved: v.boolean(),
  }).index("by_room", ["roomId"]),
});
