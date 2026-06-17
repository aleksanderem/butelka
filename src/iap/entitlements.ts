import type { ModeGroup } from "@/game/content-types";
import {
  CATEGORY_PRODUCT_ID,
  PREMIUM_CATEGORIES,
  PRO_PRODUCT_ID,
  isPremiumCategory,
  type PremiumCategory,
} from "@/iap/products";

export interface Entitlements {
  hasPro: boolean;
  ownedCategories: ReadonlySet<PremiumCategory>;
}

/** Z listy posiadanych product ID (z StoreKitu) wylicza, co jest odblokowane. */
export function deriveEntitlements(ownedProductIds: readonly string[]): Entitlements {
  const owned = new Set(ownedProductIds);
  const hasPro = owned.has(PRO_PRODUCT_ID);
  const ownedCategories = new Set<PremiumCategory>();
  for (const cat of PREMIUM_CATEGORIES) {
    if (hasPro || owned.has(CATEGORY_PRODUCT_ID[cat])) {
      ownedCategories.add(cat);
    }
  }
  return { hasPro, ownedCategories };
}

/** Czy dana kategoria jest grywalna (nie-premium zawsze; premium wymaga zakupu). */
export function isCategoryUnlocked(category: ModeGroup, entitlements: Entitlements): boolean {
  if (!isPremiumCategory(category)) {
    return true;
  }
  return entitlements.ownedCategories.has(category);
}
