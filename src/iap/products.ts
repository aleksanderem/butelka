import type { ModeGroup } from "@/game/content-types";

/** Kategorie premium (płatne). Pokrywa się z `premium: true` w main-categories.ts. */
export type PremiumCategory = "party" | "group_hot" | "couple_hot";

/** Non-consumable product ID „PRO" — odblokowuje wszystkie kategorie premium. */
export const PRO_PRODUCT_ID = "com.butelka.game.pro";

/** Pojedyncze odblokowania: kategoria premium -> product ID. */
export const CATEGORY_PRODUCT_ID: Readonly<Record<PremiumCategory, string>> = {
  party: "com.butelka.game.party",
  group_hot: "com.butelka.game.group_hot",
  couple_hot: "com.butelka.game.couple_hot",
};

export const PREMIUM_CATEGORIES: readonly PremiumCategory[] = ["party", "group_hot", "couple_hot"];

/** Wszystkie ID do zapytania StoreKitu o produkty. */
export const ALL_PRODUCT_IDS: readonly string[] = [
  PRO_PRODUCT_ID,
  ...PREMIUM_CATEGORIES.map((c) => CATEGORY_PRODUCT_ID[c]),
];

export function isPremiumCategory(key: ModeGroup): key is PremiumCategory {
  return (PREMIUM_CATEGORIES as readonly string[]).includes(key);
}
