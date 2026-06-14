// Model wyboru treści do gry: per główna kategoria (tryb) jeden poziom 0..3 (jak slidery w głosowaniach).
// 0 = wyłączone, 1 = łagodne, 2 = mocniejsze, 3 = pełne. Poziom mapuje się na limit `intensity` kart.
// Zapis na pokoju jako JSON string (pole contentSelection). Picker czyta to + singleton paczki.

import { getCachedContent } from "@/game/content-client";
import { pickPrompt } from "@/game/prompts";
import type { CardType } from "@/game/content-types";
import type { ChallengeType } from "@/game/types";

/** Poziom doboru dla jednej głównej kategorii. */
export type ContentLevel = 0 | 1 | 2 | 3;

export const CONTENT_LEVELS = 4; // slider 0..3

export const LEVEL_LABELS: Record<ContentLevel, string> = {
  0: "Wył.",
  1: "Łagodne",
  2: "Mocniejsze",
  3: "Pełne",
};

/** Górny limit `intensity` kart dla danego poziomu (poziom 0 = brak kart). */
export function intensityCapForLevel(level: ContentLevel): number {
  switch (level) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3:
      return 5;
    default:
      return 0;
  }
}

export type ContentSelection = Record<string, ContentLevel>;

/** Domyślny dobór nowego pokoju: Classic w pełni. */
export const DEFAULT_SELECTION: ContentSelection = { classic: 3 };

function clampLevel(value: unknown): ContentLevel {
  const n = typeof value === "number" ? Math.round(value) : 0;
  if (n <= 0) return 0;
  if (n >= 3) return 3;
  return n as ContentLevel;
}

/** Parsuje pole contentSelection pokoju; przy braku/błędzie zwraca domyślny dobór. */
export function parseSelection(json: string | undefined | null): ContentSelection {
  if (!json) return { ...DEFAULT_SELECTION };
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    const out: ContentSelection = {};
    for (const [key, value] of Object.entries(raw)) {
      const level = clampLevel(value);
      if (level > 0) out[key] = level;
    }
    return Object.keys(out).length ? out : { ...DEFAULT_SELECTION };
  } catch {
    return { ...DEFAULT_SELECTION };
  }
}

export function serializeSelection(selection: ContentSelection): string {
  return JSON.stringify(selection);
}

/** Klucze trybów włączonych w doborze (poziom > 0). */
export function enabledModeKeys(selection: ContentSelection): string[] {
  return Object.entries(selection)
    .filter(([, level]) => level > 0)
    .map(([key]) => key);
}

const TYPE_MAP: Record<ChallengeType, CardType[]> = {
  prawda: ["truth"],
  wyzwanie: ["challenge", "choice"],
};

/**
 * Losuje treść karty zgodnie z doborem pokoju (tryby + limit intensity) i typem.
 * Fallback do wbudowanych promptów, gdy brak paczki w pamięci lub pula pusta (offline / dziwny dobór).
 */
export function pickCardText(
  selectionJson: string | undefined | null,
  type: ChallengeType,
  exclude?: string | null
): string {
  const bundle = getCachedContent();
  if (!bundle) return pickPrompt(type, exclude);

  const selection = parseSelection(selectionJson);
  const wantTypes = TYPE_MAP[type];
  const pool = bundle.cards.filter((card) => {
    const level = selection[card.modeKey] ?? 0;
    if (level === 0) return false;
    if (!wantTypes.includes(card.type)) return false;
    return card.intensity <= intensityCapForLevel(level);
  });

  if (pool.length === 0) return pickPrompt(type, exclude);

  const fresh = exclude ? pool.filter((card) => card.textPl !== exclude) : pool;
  const source = fresh.length > 0 ? fresh : pool;
  return source[Math.floor(Math.random() * source.length)].textPl;
}
