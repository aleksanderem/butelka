// Przebieg gry = log zakończonych tur na pokoju. Trzymany jako JSON w atrybucie `rooms.history`,
// dzięki czemu jest współdzielony między urządzeniami (polling jak reszta stanu pokoju).

import type { ChallengeType } from "@/game/types";

/** Jeden wpis przebiegu gry: zakończona tura szczęśliwca. */
export interface RoundHistoryEntry {
  /** Imię szczęśliwca w chwili zakończenia tury. */
  name: string;
  avatarId: string;
  colorId: string;
  /** Co wybrał: prawda / wyzwanie. */
  type: ChallengeType;
  /** Skrócony tekst wykonanego zadania (może być pusty). */
  text: string;
  /** Czas zakończenia (ms). */
  at: number;
}

/** Maks. wpisów trzymanych na pokoju (ogranicza rozmiar atrybutu). */
export const HISTORY_MAX = 15;

const TEXT_MAX = 90;

export function parseHistory(json: string | undefined | null): RoundHistoryEntry[] {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
      .map((e) => ({
        name: typeof e.name === "string" ? e.name : "",
        avatarId: typeof e.avatarId === "string" ? e.avatarId : "",
        colorId: typeof e.colorId === "string" ? e.colorId : "",
        type: e.type === "wyzwanie" ? "wyzwanie" : "prawda",
        text: typeof e.text === "string" ? e.text : "",
        at: typeof e.at === "number" ? e.at : 0,
      }));
  } catch {
    return [];
  }
}

export function serializeHistory(entries: RoundHistoryEntry[]): string {
  return JSON.stringify(entries.slice(-HISTORY_MAX));
}

/** Dokleja wpis do historii (przycina tekst, ogranicza liczbę wpisów do HISTORY_MAX). */
export function appendHistory(json: string | undefined | null, entry: RoundHistoryEntry): string {
  const trimmed: RoundHistoryEntry = {
    ...entry,
    text: entry.text.length > TEXT_MAX ? `${entry.text.slice(0, TEXT_MAX - 1)}…` : entry.text,
  };
  return serializeHistory([...parseHistory(json), trimmed]);
}
