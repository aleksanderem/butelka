import type { RoomSettings } from "@/game/types";
import type { PlayerColorId } from "@/theme/colors";

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
