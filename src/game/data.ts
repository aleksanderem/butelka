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

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** ID pokoju: 6 znaków alfanumerycznych (jak „AB12CD”). Generowane lokalnie,
 *  aby „Utwórz pokój” dzialalo natychmiast bez czekania na backend. */
export function makeRoomCode(): string {
  return Array.from(
    { length: 6 },
    () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
  ).join("");
}
