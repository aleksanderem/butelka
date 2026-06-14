// Kształty danych z content API (panel butelka-admin) — schemat V3. Patrz docs integration.md.
// Taksonomia: 6 trybów (modeGroups) → 58 kategorii (categories) → 5800 kart (cards).

export type ModeGroup = "teen" | "classic" | "party" | "group_hot" | "couple" | "couple_hot";
export type AgeGate = "13+" | "16+" | "18+" | "explicit_18+";
export type CardContext = "group" | "couple";
export type CardType = "dare" | "truth" | "choice" | "vote";
export type SexualLevel = "none" | "suggestive" | "sexual" | "explicit";
export type ContactLevel = "none" | "touch" | "intimate";
export type PublicPrivate = "public" | "either" | "private";

export interface ModeGroupRef {
  key: ModeGroup;
  namePl: string;
  order: number;
}

export interface Category {
  categoryId: string;
  namePl: string;
  modeGroup: ModeGroup;
  context: CardContext;
  ageGate: AgeGate;
  disclaimerTitlePl: string;
  disclaimerBodyPl: string;
  requiresAcceptance: boolean;
  acceptButtonPl: string;
  declineButtonPl: string;
  rememberAcceptance: boolean;
  order: number;
  enabled: boolean;
}

export interface Card {
  cardId: string;
  categoryId: string;
  modeGroup: ModeGroup;
  context: CardContext;
  ageGate: AgeGate;
  cardType: CardType;
  sexualLevel: SexualLevel;
  intensity: number; // 1..5
  contactLevel: ContactLevel;
  publicPrivate: PublicPrivate;
  textPl: string;
  altSoftPl: string; // łagodniejszy wariant (zwykle pusty — placeholder)
  altHardPl: string; // ostrzejszy wariant (placeholder)
  tags: string[];
  enabled: boolean;
}

export interface Setting {
  settingId: string;
  namePl: string;
  descriptionPl: string;
  recommendedDefault: string; // "on" | "off"
  availableValues: string; // np. "on/off"
  order: number;
  enabled: boolean;
}

export interface ContentManifest {
  version: number;
  publishedAt: number;
  counts: { categories: number; cards: number; settings: number };
  checksum: string;
}

export interface ContentBundle {
  version: number;
  publishedAt: number;
  counts: { categories: number; cards: number; settings: number };
  checksum: string;
  modeGroups: ModeGroupRef[];
  categories: Category[];
  settings: Setting[];
  cards: Card[];
}
