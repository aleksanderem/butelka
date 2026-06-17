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
  // Domyślnie BEZ głosowania — akcje (koniec tury / zmiana karty) wykonują się od razu.
  // Głosowanie to opcja w ustawieniach pokoju (próg > „off").
  endTurnApproval: "off",
  nextTruthApproval: "off",
  nextDareApproval: "off",
  autoStart: false,
  truthSeconds: 0,
  dareSeconds: 0,
};

/** ID pokoju: 6 cyfr (jak kod OTP). Generowane lokalnie, aby „Utwórz pokój”
 *  dzialalo natychmiast bez czekania na backend. */
export function makeRoomCode(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
}
