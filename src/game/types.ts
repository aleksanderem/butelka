import type { PlayerColorId } from "@/theme/colors";

export type Phase = "lobby" | "spinning" | "chosen" | "task";
export type ChallengeType = "prawda" | "wyzwanie";
export type RoomTab = "join" | "create";
export type ApprovalAction = "endTurn" | "nextTruth" | "nextDare";

/** Identyfikator animowanej maskotki (avatary Lottie z assets/avatars). */
export type AvatarId =
  | "star"
  | "heart"
  | "planet"
  | "money"
  | "gear"
  | "cloud"
  | "wallet"
  | "shield"
  | "mail"
  | "message"
  | "phone"
  | "search"
  | "paper"
  | "pencil"
  | "folder";

export interface Player {
  id: string;
  name: string;
  avatarId: AvatarId;
  colorId: PlayerColorId;
  /** Czy to lokalny gracz na tym urządzeniu („Ty”). */
  isSelf?: boolean;
  /** Identyfikator urządzenia gracza (multiplayer). */
  clientId?: string;
  /** Czy gracz zaakceptował aktualnie głosowaną akcję. */
  approved?: boolean;
}

export interface ApprovalState {
  action: ApprovalAction;
  approved: number;
  total: number;
  needed: number;
  myVote: boolean | null;
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
