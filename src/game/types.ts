import type { PlayerColorId } from "@/theme/colors";

export type Phase = "lobby" | "spinning" | "chosen" | "task";
export type ChallengeType = "prawda" | "wyzwanie";
export type RoomTab = "join" | "create";
export type ApprovalAction = "endTurn" | "nextTruth" | "nextDare";

/** Identyfikator presetu avatara (8 twarzy z mockupu onboardingu). */
export type AvatarId =
  | "kuba"
  | "ola"
  | "bartek"
  | "zuzia"
  | "michal"
  | "kasia"
  | "filip"
  | "nina";

export interface Player {
  id: string;
  name: string;
  avatarId: AvatarId;
  colorId: PlayerColorId;
  /** Czy to lokalny gracz na tym urządzeniu („Ty”). */
  isSelf?: boolean;
}

export interface RoomSettings {
  requireEndTurnApproval: boolean;
  requireNextTruthApproval: boolean;
  requireNextDareApproval: boolean;
}

/** Stan głosowania w modalu akceptacji (ekran 7). */
export interface ApprovalVote {
  playerId: string;
  approved: boolean;
}
