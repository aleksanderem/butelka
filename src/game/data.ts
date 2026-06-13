import type { AvatarId, RoomSettings } from "@/game/types";
import type { PlayerColorId } from "@/theme/colors";

export interface AvatarPreset {
  id: AvatarId;
  /** Emoji-twarz jako placeholder pod docelowe ilustracje z mockupu. */
  face: string;
}

/** 8 avatarów z ekranu onboardingu. Emoji są placeholderem pod właściwe ilustracje. */
export const avatarPresets: AvatarPreset[] = [
  { id: "kuba", face: "🧑" },
  { id: "ola", face: "👩" },
  { id: "bartek", face: "🧔" },
  { id: "zuzia", face: "👧" },
  { id: "michal", face: "🧑‍🦱" },
  { id: "kasia", face: "👩‍🦰" },
  { id: "filip", face: "👱" },
  { id: "nina", face: "👩‍🦳" },
];

/** Kolory akcentu w kolejności jak na mockupie (pierwszy = domyślny). */
export const colorOrder: PlayerColorId[] = [
  "violet",
  "purple",
  "blue",
  "teal",
  "amber",
  "orange",
  "red",
];

export const defaultSettings: RoomSettings = {
  requireEndTurnApproval: true,
  requireNextTruthApproval: true,
  requireNextDareApproval: false,
};
