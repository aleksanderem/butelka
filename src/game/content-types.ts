// Kształty danych z content API (panel butelka-admin). Patrz docs integration.md.
// Taksonomia 2-poziomowa: 7 trybów (modes = „główne kategorie") → 58 kategorii (granulacja) → karty.

export type AgeGate = "all" | "18+" | "13-17";
export type CardContext = "group" | "couple" | "private" | "couple/group" | "group/private";
export type CardType = "truth" | "challenge" | "choice";
export type ContactLevel = "none" | "requires_consent";

export interface Mode {
  modeKey: string;
  namePl: string;
  descriptionPl: string;
  ageGate: AgeGate;
  order: number;
  enabled: boolean;
}

export interface Category {
  categoryKey: string;
  modeKey: string;
  namePl: string;
  descriptionPl: string;
  ageGate: AgeGate;
  context: CardContext;
  order: number;
  enabled: boolean;
}

export interface Setting {
  settingKey: string;
  namePl: string;
  kind: "toggle" | "enum";
  values: string[];
  defaultValue: string;
  descriptionPl: string;
  order: number;
  enabled: boolean;
}

export interface Card {
  cardId: string;
  categoryKey: string;
  modeKey: string;
  ageGate: AgeGate;
  context: CardContext;
  type: CardType;
  intensity: number; // 1..5
  contactLevel: ContactLevel;
  consentRequired: boolean;
  textPl: string;
  safeVariantPl: string;
  safetyNotePl: string;
  tags: string[];
  enabled: boolean;
}

export interface ContentManifest {
  version: number;
  publishedAt: number;
  counts: { modes: number; categories: number; cards: number };
  checksum: string;
}

export interface ContentBundle {
  version: number;
  publishedAt: number;
  counts: { modes: number; categories: number; cards: number };
  checksum: string;
  modes: Mode[];
  categories: Category[];
  settings: Setting[];
  cards: Card[];
}
