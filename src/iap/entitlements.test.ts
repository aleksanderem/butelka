import { describe, expect, it } from "vitest";

import { deriveEntitlements, isCategoryUnlocked } from "@/iap/entitlements";

describe("deriveEntitlements", () => {
  it("brak zakupow => nic nie odblokowane", () => {
    const e = deriveEntitlements([]);
    expect(e.hasPro).toBe(false);
    expect(e.ownedCategories.size).toBe(0);
  });

  it("PRO odblokowuje wszystkie 3 kategorie", () => {
    const e = deriveEntitlements(["com.butelka.game.pro"]);
    expect(e.hasPro).toBe(true);
    expect([...e.ownedCategories].sort()).toEqual(["couple_hot", "group_hot", "party"]);
  });

  it("pojedynczy produkt odblokowuje tylko swoja kategorie", () => {
    const e = deriveEntitlements(["com.butelka.game.party"]);
    expect(e.hasPro).toBe(false);
    expect([...e.ownedCategories]).toEqual(["party"]);
  });

  it("nieznane ID jest ignorowane", () => {
    const e = deriveEntitlements(["com.butelka.game.unknown"]);
    expect(e.hasPro).toBe(false);
    expect(e.ownedCategories.size).toBe(0);
  });
});

describe("isCategoryUnlocked", () => {
  it("kategoria nie-premium jest zawsze odblokowana", () => {
    expect(isCategoryUnlocked("classic", deriveEntitlements([]))).toBe(true);
    expect(isCategoryUnlocked("teen", deriveEntitlements([]))).toBe(true);
    expect(isCategoryUnlocked("couple", deriveEntitlements([]))).toBe(true);
  });

  it("premium zablokowana bez zakupu, odblokowana z PRO lub wlasnym produktem", () => {
    expect(isCategoryUnlocked("party", deriveEntitlements([]))).toBe(false);
    expect(isCategoryUnlocked("party", deriveEntitlements(["com.butelka.game.pro"]))).toBe(true);
    expect(isCategoryUnlocked("party", deriveEntitlements(["com.butelka.game.party"]))).toBe(true);
    expect(isCategoryUnlocked("group_hot", deriveEntitlements(["com.butelka.game.party"]))).toBe(
      false
    );
  });
});
