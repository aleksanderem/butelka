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
  /** Czy ten gracz jest hostem (twórcą pokoju). */
  isHost?: boolean;
  /** Identyfikator urządzenia gracza (multiplayer). */
  clientId?: string;
  /** Czy gracz zaakceptował aktualnie głosowaną akcję. */
  approved?: boolean;
}

export interface ApprovalState {
  action: ApprovalAction;
  approved: number;
  rejected: number;
  total: number;
  needed: number;
  myVote: boolean | null;
}

/** Próg zgody na akcję: brak głosowania, połowa, większość albo wszyscy gracze. */
export type ApprovalThreshold = "off" | "half" | "majority" | "all";

export interface RoomSettings {
  /** Próg zgody na zakończenie tury (kolejka gracza). */
  endTurnApproval: ApprovalThreshold;
  /** Próg zgody na zmianę pytania (następna prawda). */
  nextTruthApproval: ApprovalThreshold;
  /** Próg zgody na zmianę wyzwania (następne wyzwanie). */
  nextDareApproval: ApprovalThreshold;
  /** Czy runda startuje automatycznie (bez losowania przez hosta). */
  autoStart: boolean;
}

/** Stan głosowania w modalu akceptacji (ekran 7). */
export interface ApprovalVote {
  playerId: string;
  approved: boolean;
}
