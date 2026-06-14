// Model doboru treści do gry (zapisywany na pokoju jako JSON, pole contentSelection):
//  - levels:             modeGroup -> poziom 0..3 (slider intensywności; 0 = tryb wyłączony)
//  - disabledCategories: konkretne podkategorie WYŁĄCZONE w obrębie aktywnych trybów (modal podkategorii)
//  - filters:            filtry treści on/off (zawężają pulę kart)
// Picker czyta to + singleton paczki. Bramka wieku i akceptacje kategorii są per-urządzenie
// (global-settings), nie tutaj.

import { getCachedContent } from "@/game/content-client";
import { pickPrompt } from "@/game/prompts";
import type { Card, CardType, ContentBundle } from "@/game/content-types";
import type { ChallengeType } from "@/game/types";

/** Poziom intensywności dla jednego trybu. */
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

/** Filtry treści (settings z API; stosowane lokalnie na puli kart). */
export type ContentFilterId =
  | "no_touch_filter"
  | "no_explicit_filter"
  | "private_only_filter"
  | "no_drama_filter"
  | "couple_only"
  | "group_only";

export const CONTENT_FILTERS: { id: ContentFilterId; namePl: string }[] = [
  { id: "no_touch_filter", namePl: "Bez dotyku" },
  { id: "no_explicit_filter", namePl: "Bez treści explicit" },
  { id: "private_only_filter", namePl: "Tylko prywatne" },
  { id: "no_drama_filter", namePl: "Bez ex/dram" },
  { id: "couple_only", namePl: "Tylko we dwoje" },
  { id: "group_only", namePl: "Tylko grupowe" },
];

export interface ContentSelection {
  levels: Record<string, ContentLevel>;
  disabledCategories: string[];
  filters: Partial<Record<ContentFilterId, boolean>>;
}

/** Poprawne klucze trybów V3 — żeby odrzucić stare dobory z kluczami V1 (np. „couples"). */
const VALID_MODE_GROUPS: ReadonlySet<string> = new Set([
  "teen",
  "classic",
  "party",
  "group_hot",
  "couple_hot",
  "couple",
]);

/** Tryby wymagające bramki wieku 18+ (ageGate 18+/explicit). */
export const ADULT_MODE_GROUPS: ReadonlySet<string> = new Set([
  "party",
  "couple",
  "group_hot",
  "couple_hot",
]);

const FILTER_IDS: ReadonlySet<string> = new Set(
  CONTENT_FILTERS.map((f) => f.id) as readonly string[]
);

/** Domyślny dobór nowego pokoju: Classic w pełni, nic wyłączonego, bez filtrów. */
export const DEFAULT_SELECTION: ContentSelection = {
  levels: { classic: 3 },
  disabledCategories: [],
  filters: {},
};

function cloneDefault(): ContentSelection {
  return { levels: { ...DEFAULT_SELECTION.levels }, disabledCategories: [], filters: {} };
}

function clampLevel(value: unknown): ContentLevel {
  const n = typeof value === "number" ? Math.round(value) : 0;
  if (n <= 0) return 0;
  if (n >= 3) return 3;
  return n as ContentLevel;
}

function parseLevels(raw: unknown): Record<string, ContentLevel> {
  const out: Record<string, ContentLevel> = {};
  if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (!VALID_MODE_GROUPS.has(key)) continue; // odrzuć stare/nieznane klucze
      const level = clampLevel(value);
      if (level > 0) out[key] = level;
    }
  }
  return out;
}

function parseStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}

function parseFilters(raw: unknown): Partial<Record<ContentFilterId, boolean>> {
  const out: Partial<Record<ContentFilterId, boolean>> = {};
  if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (FILTER_IDS.has(key) && value === true) out[key as ContentFilterId] = true;
    }
  }
  return out;
}

/** Parsuje pole contentSelection pokoju; obsługuje nowy kształt i stary płaski {modeGroup: level}. */
export function parseSelection(json: string | undefined | null): ContentSelection {
  if (!json) return cloneDefault();
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    const isNewShape = raw && typeof raw === "object" && "levels" in raw;
    const levels = parseLevels(isNewShape ? raw.levels : raw);
    const selection: ContentSelection = {
      levels: Object.keys(levels).length ? levels : { ...DEFAULT_SELECTION.levels },
      disabledCategories: isNewShape ? parseStringArray(raw.disabledCategories) : [],
      filters: isNewShape ? parseFilters(raw.filters) : {},
    };
    return selection;
  } catch {
    return cloneDefault();
  }
}

export function serializeSelection(selection: ContentSelection): string {
  return JSON.stringify(selection);
}

/** Klucze trybów włączonych w doborze (poziom > 0). */
export function enabledModeKeys(selection: ContentSelection): string[] {
  return Object.entries(selection.levels)
    .filter(([, level]) => level > 0)
    .map(([key]) => key);
}

/** Czy podkategoria jest aktywna (domyślnie tak — wyłączone trzymamy w disabledCategories). */
export function isCategoryEnabled(selection: ContentSelection, categoryId: string): boolean {
  return !selection.disabledCategories.includes(categoryId);
}

// --- Immutable update helpers (używane w use-game.ts dla pokoju i globalnych ustawień) ---

export function withLevel(
  selection: ContentSelection,
  modeGroup: string,
  level: ContentLevel
): ContentSelection {
  const levels = { ...selection.levels };
  if (level <= 0) delete levels[modeGroup];
  else levels[modeGroup] = level;
  return { ...selection, levels };
}

export function withCategoryEnabled(
  selection: ContentSelection,
  categoryId: string,
  enabled: boolean
): ContentSelection {
  const set = new Set(selection.disabledCategories);
  if (enabled) set.delete(categoryId);
  else set.add(categoryId);
  return { ...selection, disabledCategories: [...set] };
}

export function withFilter(
  selection: ContentSelection,
  filterId: ContentFilterId,
  on: boolean
): ContentSelection {
  const filters = { ...selection.filters };
  if (on) filters[filterId] = true;
  else delete filters[filterId];
  return { ...selection, filters };
}

const TYPE_MAP: Record<ChallengeType, CardType[]> = {
  prawda: ["truth"],
  wyzwanie: ["dare", "choice"],
};

/** Czy karta przechodzi przez filtry treści. */
function passesFilters(card: Card, filters: ContentSelection["filters"]): boolean {
  if (filters.no_touch_filter && card.contactLevel !== "none") return false;
  if (filters.no_explicit_filter && card.sexualLevel === "explicit") return false;
  if (filters.private_only_filter && card.publicPrivate === "public") return false;
  if (filters.couple_only && card.context !== "couple") return false;
  if (filters.group_only && card.context !== "group") return false;
  if (filters.no_drama_filter && card.categoryId.includes("drama")) return false;
  return true;
}

/** Buduje pulę kart danego typu zgodnie z doborem (tryby + intensity + podkategorie + filtry). */
export function cardPool(
  bundle: ContentBundle,
  selection: ContentSelection,
  type: ChallengeType
): Card[] {
  const wantTypes = TYPE_MAP[type];
  const disabled = new Set(selection.disabledCategories);
  return bundle.cards.filter((card) => {
    const level = selection.levels[card.modeGroup] ?? 0;
    if (level === 0) return false;
    if (card.intensity > intensityCapForLevel(level as ContentLevel)) return false;
    if (!wantTypes.includes(card.cardType)) return false;
    if (disabled.has(card.categoryId)) return false;
    return passesFilters(card, selection.filters);
  });
}

/**
 * Losuje treść karty zgodnie z doborem pokoju i typem.
 * Fallback do wbudowanych promptów, gdy brak paczki w pamięci lub pula pusta (offline / dziwny dobór).
 */
export function pickCardText(
  selectionJson: string | undefined | null,
  type: ChallengeType,
  exclude?: string | null
): string {
  const bundle = getCachedContent();
  if (!bundle) return pickPrompt(type, exclude);

  const pool = cardPool(bundle, parseSelection(selectionJson), type);
  if (pool.length === 0) return pickPrompt(type, exclude);

  const fresh = exclude ? pool.filter((card) => card.textPl !== exclude) : pool;
  const source = fresh.length > 0 ? fresh : pool;
  return source[Math.floor(Math.random() * source.length)].textPl;
}
