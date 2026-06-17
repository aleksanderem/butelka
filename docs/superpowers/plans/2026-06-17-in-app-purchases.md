# Zakupy w aplikacji (IAP) — plan implementacji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Odblokowywać 3 kategorie premium (`party`, `group_hot`, `couple_hot`) zakupami non-consumable — hybryda „PRO" (wszystko) + per-kategoria — przez expo-iap / StoreKit 2, z bramką u hosta i paywallem.

**Architecture:** Czysta logika własności (`entitlements.ts`) testowana jednostkowo. `useIAP` wołany RAZ w `IapProvider`, który wystawia entitlementy + `purchase`/`restore` całej apce. Źródło prawdy: StoreKit `getAvailablePurchases()` (non-consumable). Bez backendu. Paywall i kłódki premium w edytorze treści (host). Testy zakupów w symulatorze przez plik `.storekit` wstrzykiwany do schematu Xcode config-pluginem (bo `expo prebuild` regeneruje `ios/`).

**Tech Stack:** Expo SDK 56, RN 0.85, TypeScript, `expo-iap` (StoreKit 2), vitest (nowy, tylko do czystej logiki), heroui-native, lokalny pipeline buildów (`scripts/ios-local.sh`).

Spec: `docs/superpowers/specs/2026-06-17-in-app-purchases-design.md`.

---

## Struktura plików

- Create `src/iap/products.ts` — stałe ID produktów + mapowanie produkt↔`ModeGroup`.
- Create `src/iap/entitlements.ts` — czysta logika własności.
- Create `src/iap/entitlements.test.ts` — testy jednostkowe (vitest).
- Create `src/iap/use-iap.tsx` — `IapProvider` + hook `useIap()` (kontekst).
- Create `src/components/paywall.tsx` — modal paywalla.
- Create `Butelka.storekit` — lokalna konfiguracja StoreKit do testów w symulatorze.
- Create `plugins/withStoreKitConfig.js` — config plugin wstrzykujący `.storekit` do schematu.
- Create `vitest.config.ts` — runner dla czystej logiki (alias `@`).
- Modify `app.json` — pluginy `expo-iap` + `./plugins/withStoreKitConfig`.
- Modify `package.json` — skrypt `test` + devDep vitest.
- Modify `src/app/_layout.tsx` — owinięcie w `IapProvider`.
- Modify `src/components/content-level-editor.tsx` — kłódka premium + otwarcie paywalla.
- Modify `src/screens/settings-screen.tsx` (ContentTab) — przekazanie entitlementów/paywalla do edytora; wejście „Premium/Przywróć zakupy".

---

## Faza 1 — Czysta logika własności (TDD)

### Task 1: Runner testów (vitest)

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: Zainstaluj vitest**

Run: `npm i -D vitest`
Expected: dodane do devDependencies.

- [ ] **Step 2: Konfiguracja vitest z aliasem `@`**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Dodaj skrypt `test`**

W `package.json` `scripts` dodaj: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "test: vitest dla czystej logiki (alias @, src/**/*.test.ts)"
```

### Task 2: Stałe produktów i mapowanie

**Files:**
- Create: `src/iap/products.ts`

- [ ] **Step 1: Zdefiniuj ID produktów i mapowanie do `ModeGroup`**

Create `src/iap/products.ts`:
```ts
import type { ModeGroup } from "@/game/content-types";

/** Non-consumable product IDs (muszą zgadzać się z App Store Connect i Butelka.storekit). */
export const PRO_PRODUCT_ID = "com.butelka.game.pro";

/** Pojedyncze odblokowania: kategoria premium -> product ID. */
export const CATEGORY_PRODUCT_ID: Readonly<Record<PremiumCategory, string>> = {
  party: "com.butelka.game.party",
  group_hot: "com.butelka.game.group_hot",
  couple_hot: "com.butelka.game.couple_hot",
};

/** Kategorie premium (płatne). Pokrywa się z `premium: true` w main-categories.ts. */
export type PremiumCategory = "party" | "group_hot" | "couple_hot";

export const PREMIUM_CATEGORIES: readonly PremiumCategory[] = ["party", "group_hot", "couple_hot"];

/** Wszystkie ID do zapytania StoreKitu o produkty. */
export const ALL_PRODUCT_IDS: readonly string[] = [
  PRO_PRODUCT_ID,
  ...PREMIUM_CATEGORIES.map((c) => CATEGORY_PRODUCT_ID[c]),
];

export function isPremiumCategory(key: ModeGroup): key is PremiumCategory {
  return (PREMIUM_CATEGORIES as readonly string[]).includes(key);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/iap/products.ts
git commit -m "feat(iap): stale ID produktow + mapowanie kategoria premium"
```

### Task 3: Logika własności (entitlements)

**Files:**
- Create: `src/iap/entitlements.ts`
- Test: `src/iap/entitlements.test.ts`

- [ ] **Step 1: Napisz failing test**

Create `src/iap/entitlements.test.ts`:
```ts
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
    expect(isCategoryUnlocked("group_hot", deriveEntitlements(["com.butelka.game.party"]))).toBe(false);
  });
});
```

- [ ] **Step 2: Uruchom test — powinien failować**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/iap/entitlements'`.

- [ ] **Step 3: Implementacja**

Create `src/iap/entitlements.ts`:
```ts
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
```

- [ ] **Step 4: Uruchom testy — mają przejść**

Run: `npm test`
Expected: PASS (8 asercji w 6 testach).

- [ ] **Step 5: Commit**

```bash
git add src/iap/entitlements.ts src/iap/entitlements.test.ts
git commit -m "feat(iap): logika wlasnosci (PRO/per-kategoria) + testy"
```

---

## Faza 2 — Integracja expo-iap

### Task 4: Instalacja expo-iap + config plugin

**Files:**
- Modify: `app.json` (sekcja `expo.plugins`)
- Modify: `package.json` (dependency)

- [ ] **Step 1: Zainstaluj expo-iap**

Run: `npx expo install expo-iap`
Expected: dodane do `dependencies`.

- [ ] **Step 2: Dodaj plugin do app.json**

W `app.json`, w tablicy `expo.plugins`, dodaj `"expo-iap"` (bez opcji — nie używamy IAPKit/weryfikacji serwerowej).
Przykład (zachowaj istniejące pluginy):
```json
"plugins": [
  "expo-iap"
]
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS (instalacja dorzuca typy expo-iap).

- [ ] **Step 4: Commit**

```bash
git add app.json package.json package-lock.json
git commit -m "feat(iap): expo-iap + config plugin w app.json"
```

### Task 5: IapProvider + hook useIap

**Files:**
- Create: `src/iap/use-iap.tsx`

- [ ] **Step 1: Implementacja providera**

`useIAP` z expo-iap wołamy TYLKO tutaj (zarządza globalnymi listenerami). Provider wystawia entitlementy, ceny produktów, `purchase`, `restore`. Non-consumable: po sukcesie finalizujemy transakcję (bez walidacji serwerowej — StoreKit 2 weryfikuje on-device) i odświeżamy `getAvailablePurchases()`.

Create `src/iap/use-iap.tsx`:
```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useIAP } from "expo-iap";

import { ALL_PRODUCT_IDS } from "@/iap/products";
import { deriveEntitlements, type Entitlements } from "@/iap/entitlements";

interface IapApi {
  ready: boolean;
  entitlements: Entitlements;
  /** product ID -> sformatowana cena lokalna ze StoreKitu (np. "19,99 zł"). */
  priceFor: (productId: string) => string | null;
  purchase: (productId: string) => void;
  restore: () => void;
}

const IapContext = createContext<IapApi | null>(null);

export function IapProvider({ children }: { children: ReactNode }) {
  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    getAvailablePurchases,
    requestPurchase,
    finishTransaction,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      // Brak walidacji serwerowej (StoreKit 2 weryfikuje on-device). Finalizujemy i odświeżamy.
      await finishTransaction({ purchase, isConsumable: false });
      await getAvailablePurchases();
    },
    onPurchaseError: () => {
      // Anulowanie / błąd: nic nie odblokowujemy; UI pozostaje zablokowane.
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [...ALL_PRODUCT_IDS], type: "in-app" });
      void getAvailablePurchases();
    }
  }, [connected, fetchProducts, getAvailablePurchases]);

  const entitlements = useMemo(
    () => deriveEntitlements(availablePurchases.map((p) => p.productId)),
    [availablePurchases]
  );

  const priceFor = useCallback(
    (productId: string) => products.find((p) => p.id === productId)?.displayPrice ?? null,
    [products]
  );

  const purchase = useCallback(
    (productId: string) => {
      void requestPurchase({ request: { apple: { sku: productId } }, type: "in-app" });
    },
    [requestPurchase]
  );

  const restore = useCallback(() => {
    void restorePurchases().then(() => getAvailablePurchases());
  }, [restorePurchases, getAvailablePurchases]);

  const value = useMemo<IapApi>(
    () => ({ ready: connected, entitlements, priceFor, purchase, restore }),
    [connected, entitlements, priceFor, purchase, restore]
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}

export function useIap(): IapApi {
  const ctx = useContext(IapContext);
  if (!ctx) {
    throw new Error("useIap musi być wewnątrz <IapProvider>");
  }
  return ctx;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. Jeśli `requestPurchase` zgłosi wymóg pola `google`, zostaw tylko `apple` (iOS-only) — typ expo-iap dopuszcza platform-specyficzny request; w razie błędu typu dodaj `google: { skus: [productId] }` do `request`.

- [ ] **Step 3: Commit**

```bash
git add src/iap/use-iap.tsx
git commit -m "feat(iap): IapProvider + useIap (entitlementy, ceny, purchase, restore)"
```

### Task 6: Owinięcie roota w IapProvider

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Dodaj provider wokół drzewa**

W `src/app/_layout.tsx` dodaj import:
```tsx
import { IapProvider } from "@/iap/use-iap";
```
i owiń istniejące drzewo (wewnątrz `GestureHandlerRootView`/`HeroUINativeProvider`, najbliżej `Stack`/treści) w `<IapProvider> ... </IapProvider>`. Przykład (dopasuj do istniejącego JSX):
```tsx
<IapProvider>
  <Stack screenOptions={{ headerShown: false }} />
</IapProvider>
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat(iap): IapProvider w roocie aplikacji"
```

---

## Faza 3 — Testy zakupów w symulatorze (StoreKit config)

### Task 7: Plik Butelka.storekit

**Files:**
- Create: `Butelka.storekit`

- [ ] **Step 1: Utwórz konfigurację StoreKit z 4 produktami**

Create `Butelka.storekit` (4 non-consumable; ceny PLN; `_locale` pl_PL). Pola `productID` MUSZĄ zgadzać się z `src/iap/products.ts`. Wartości `_id`/`referenceName` dowolne, unikalne:
```json
{
  "identifier": "B17E1A00-0000-4000-8000-000000000001",
  "nonRenewingSubscriptions": [],
  "products": [
    {
      "displayPrice": "19.99",
      "familyShareable": false,
      "internalID": "B17E1A00-0000-4000-8000-0000000000A1",
      "localizations": [
        { "description": "Wszystkie kategorie premium", "displayName": "PRO — wszystko", "locale": "pl_PL" }
      ],
      "productID": "com.butelka.game.pro",
      "referenceName": "PRO",
      "type": "NonConsumable"
    },
    {
      "displayPrice": "8.99",
      "familyShareable": false,
      "internalID": "B17E1A00-0000-4000-8000-0000000000A2",
      "localizations": [
        { "description": "Melanż / Impreza", "displayName": "Melanż / Impreza", "locale": "pl_PL" }
      ],
      "productID": "com.butelka.game.party",
      "referenceName": "party",
      "type": "NonConsumable"
    },
    {
      "displayPrice": "8.99",
      "familyShareable": false,
      "internalID": "B17E1A00-0000-4000-8000-0000000000A3",
      "localizations": [
        { "description": "Hot — grupowo", "displayName": "Hot — grupowo", "locale": "pl_PL" }
      ],
      "productID": "com.butelka.game.group_hot",
      "referenceName": "group_hot",
      "type": "NonConsumable"
    },
    {
      "displayPrice": "8.99",
      "familyShareable": false,
      "internalID": "B17E1A00-0000-4000-8000-0000000000A4",
      "localizations": [
        { "description": "Tylko we 2 — Hot", "displayName": "Tylko we 2 — Hot", "locale": "pl_PL" }
      ],
      "productID": "com.butelka.game.couple_hot",
      "referenceName": "couple_hot",
      "type": "NonConsumable"
    }
  ],
  "settings": { "_locale": "pl_PL", "_storefront": "POL" },
  "subscriptionGroups": [],
  "version": { "major": 4, "minor": 0 }
}
```

- [ ] **Step 2: Commit**

```bash
git add Butelka.storekit
git commit -m "test(iap): plik StoreKit (4 produkty) do testow w symulatorze"
```

### Task 8: Config plugin wstrzykujący .storekit do schematu

**Files:**
- Create: `plugins/withStoreKitConfig.js`
- Modify: `app.json`

`expo prebuild` regeneruje `ios/`, więc referencję do `.storekit` w schemacie Xcode trzeba odtwarzać pluginem. Plugin kopiuje `Butelka.storekit` do `ios/` i dopisuje `StoreKitConfigurationFileReference` do `Run` action w `ios/Butelka.xcodeproj/xcshareddata/xcschemes/Butelka.xcscheme`.

- [ ] **Step 1: Implementacja pluginu**

Create `plugins/withStoreKitConfig.js`:
```js
const { withXcodeProject, withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const STOREKIT_FILE = "Butelka.storekit";
const SCHEME = "Butelka.xcscheme";

// 1) Skopiuj Butelka.storekit z roota repo do ios/
const withCopyStoreKit = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, STOREKIT_FILE);
      const dest = path.join(cfg.modRequest.platformProjectRoot, STOREKIT_FILE);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);

// 2) Dopisz referencję StoreKit do BuildableProductRunnable/LaunchAction w schemacie
const withSchemeStoreKit = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const schemePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "Butelka.xcodeproj/xcshareddata/xcschemes",
        SCHEME
      );
      if (!fs.existsSync(schemePath)) return cfg;
      let xml = fs.readFileSync(schemePath, "utf8");
      if (xml.includes("StoreKitConfigurationFileReference")) return cfg;
      const ref =
        `      <StoreKitConfigurationFileReference\n` +
        `         identifier = "../../../${STOREKIT_FILE}">\n` +
        `      </StoreKitConfigurationFileReference>\n`;
      // wstaw zaraz po otwarciu <LaunchAction ...>
      xml = xml.replace(/(<LaunchAction[^>]*>\n)/, `$1${ref}`);
      fs.writeFileSync(schemePath, xml);
      return cfg;
    },
  ]);

module.exports = (config) => withSchemeStoreKit(withCopyStoreKit(config));
// withXcodeProject importowany na wypadek przyszłej potrzeby rejestracji pliku w projekcie.
void withXcodeProject;
```

- [ ] **Step 2: Zarejestruj plugin w app.json**

W `expo.plugins` dodaj `"./plugins/withStoreKitConfig"` (po `"expo-iap"`).

- [ ] **Step 3: Prebuild i weryfikacja wstrzyknięcia**

Run: `npx expo prebuild --platform ios --clean`
Następnie sprawdź, że schemat ma referencję:
Run: `grep -c StoreKitConfigurationFileReference ios/Butelka.xcodeproj/xcshareddata/xcschemes/Butelka.xcscheme`
Expected: `1` oraz `ios/Butelka.storekit` istnieje.

- [ ] **Step 4: Commit**

```bash
git add plugins/withStoreKitConfig.js app.json
git commit -m "test(iap): config plugin wstrzykujacy .storekit do schematu (przetrwa prebuild)"
```

---

## Faza 4 — Paywall + bramkowanie

### Task 9: Komponent Paywall

**Files:**
- Create: `src/components/paywall.tsx`

- [ ] **Step 1: Implementacja modala**

Neonowy modal: kontekst (kategoria, na której odpalono), CTA pojedyncza + wyróżnione PRO (ceny z `useIap().priceFor`), „Przywróć zakupy", linki prawne. Po odblokowaniu kategorii (entitlement się zmienia) zamyka się sam.

Create `src/components/paywall.tsx`:
```tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Linking, Modal, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { isCategoryUnlocked } from "@/iap/entitlements";
import { CATEGORY_PRODUCT_ID, PRO_PRODUCT_ID, type PremiumCategory } from "@/iap/products";
import { useIap } from "@/iap/use-iap";
import { mainCategoryByKey } from "@/game/main-categories";
import { neon } from "@/theme/colors";

const PRIVACY_URL = "https://butelka-legal.aleksander-kolabogroup.workers.dev/privacy";

export function Paywall({ category, onClose }: { category: PremiumCategory; onClose: () => void }) {
  const { entitlements, priceFor, purchase, restore } = useIap();
  const cat = mainCategoryByKey(category);
  const singlePrice = priceFor(CATEGORY_PRODUCT_ID[category]);
  const proPrice = priceFor(PRO_PRODUCT_ID);

  // Gdy kategoria zostanie odblokowana (zakup/restore) — zamknij paywall.
  useEffect(() => {
    if (isCategoryUnlocked(category, entitlements)) {
      onClose();
    }
  }, [category, entitlements, onClose]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(4,2,10,0.82)" }}>
        <View
          className="gap-4 rounded-t-3xl p-5"
          style={{ backgroundColor: neon.surface, borderColor: "rgba(192,132,252,0.4)", borderTopWidth: 1 }}
        >
          <View className="items-center gap-1.5">
            <Ionicons color={neon.purpleBright} name="sparkles" size={28} />
            <Text className="text-xl font-extrabold text-foreground">Odblokuj {cat?.namePl}</Text>
            <Text className="text-center text-sm leading-5 text-muted">{cat?.descriptionPl}</Text>
          </View>

          <NeonButton
            label={proPrice ? `PRO — wszystko za ${proPrice}` : "PRO — wszystko"}
            onPress={() => purchase(PRO_PRODUCT_ID)}
            variant="violet"
          />
          <NeonButton
            label={singlePrice ? `Tylko ${cat?.namePl} — ${singlePrice}` : `Odblokuj ${cat?.namePl}`}
            onPress={() => purchase(CATEGORY_PRODUCT_ID[category])}
            variant="pink"
          />
          <NeonButton label="Przywróć zakupy" onPress={restore} variant="ghost" />

          <View className="flex-row items-center justify-center gap-4">
            <Text className="text-xs text-muted" onPress={onClose}>
              Może później
            </Text>
            <Text
              className="text-xs text-muted"
              onPress={() => void Linking.openURL(PRIVACY_URL)}
              style={{ textDecorationLine: "underline" }}
            >
              Prywatność
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/paywall.tsx
git commit -m "feat(iap): paywall (PRO + pojedyncza, ceny ze StoreKitu, restore)"
```

### Task 10: Bramkowanie w edytorze treści

**Files:**
- Modify: `src/components/content-level-editor.tsx`

Dodajemy do `ContentEditorApi` informację o własności i callback paywalla, a w `ContentLevelRow` stan „premium-lock" (gdy kategoria premium, wiek potwierdzony, ale brak własności → kłódka + cena → paywall).

- [ ] **Step 1: Rozszerz `ContentEditorApi` i przekaż do wiersza**

W `src/components/content-level-editor.tsx`:
- do interfejsu `ContentEditorApi` dodaj:
```tsx
  /** Czy kategoria premium jest zablokowana zakupem (true = pokaż kłódkę/cenę). */
  isPremiumLocked: (key: string) => boolean;
  /** Cena pojedynczej kategorii ze StoreKitu (np. "8,99 zł") lub null. */
  premiumPrice: (key: string) => string | null;
  /** Otwórz paywall dla danej kategorii premium. */
  onOpenPaywall: (key: string) => void;
```
- w `MAIN_CATEGORIES.map(...)` policz `const premiumLocked = api.isPremiumLocked(cat.key);` i przekaż do `ContentLevelRow` nowe propsy: `premiumLocked`, `premiumPrice={api.premiumPrice(cat.key)}`, `onOpenPaywall={() => api.onOpenPaywall(cat.key)}`.

- [ ] **Step 2: Obsłuż premium-lock w `ContentLevelRow`**

W sygnaturze `ContentLevelRow` dodaj propsy:
```tsx
  premiumLocked: boolean;
  premiumPrice: string | null;
  onOpenPaywall: () => void;
```
W ciele, ZARAZ po bloku `locked ? (age gate) : (...)`, zmień warunek tak, by premium-lock miał priorytet nad sliderem (ale po bramce wieku). Zastąp `{locked ? (<age gate/>) : (<slider/>)}` strukturą:
```tsx
{locked ? (
  /* istniejący age-gate Pressable bez zmian */
) : premiumLocked ? (
  <Pressable
    accessibilityRole="button"
    className="flex-row items-center justify-center gap-2 rounded-2xl py-3"
    onPress={onOpenPaywall}
    style={{ borderColor: "rgba(192,132,252,0.5)", borderWidth: 1.5 }}
  >
    <Ionicons color={neon.purpleBright} name="lock-closed" size={15} />
    <Text className="text-sm font-bold" style={{ color: neon.purpleBright }}>
      {premiumPrice ? `Odblokuj — ${premiumPrice}` : "Odblokuj"}
    </Text>
  </Pressable>
) : (
  /* istniejący blok ze sliderem + podkategoriami bez zmian */
)}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: FAIL — `settings-screen.tsx` (ContentTab) nie przekazuje nowych pól `ContentEditorApi`. Naprawiamy w Task 11.

- [ ] **Step 4: Commit (po Task 11, razem — patrz niżej)**

Nie commituj osobno; commit łączny po Task 11 (żeby typecheck był zielony).

### Task 11: Podłączenie entitlementów i paywalla w Ustawieniach

**Files:**
- Modify: `src/screens/settings-screen.tsx`

- [ ] **Step 1: W `ContentTab` policz własność i wystaw paywall**

W `src/screens/settings-screen.tsx`, w komponencie `ContentTab` (renderuje `ContentLevelEditor`):
- importy:
```tsx
import { useState } from "react";
import { Paywall } from "@/components/paywall";
import { useIap } from "@/iap/use-iap";
import { CATEGORY_PRODUCT_ID, isPremiumCategory, type PremiumCategory } from "@/iap/products";
import { isCategoryUnlocked } from "@/iap/entitlements";
```
- w `ContentTab`:
```tsx
const { entitlements, priceFor } = useIap();
const [paywallCat, setPaywallCat] = useState<PremiumCategory | null>(null);
```
- przekaż do `<ContentLevelEditor ... />` nowe propsy:
```tsx
isPremiumLocked={(key) =>
  isPremiumCategory(key as never) && !isCategoryUnlocked(key as never, entitlements)
}
premiumPrice={(key) =>
  isPremiumCategory(key as never) ? priceFor(CATEGORY_PRODUCT_ID[key as PremiumCategory]) : null
}
onOpenPaywall={(key) => {
  if (isPremiumCategory(key as never)) setPaywallCat(key as PremiumCategory);
}}
```
- na końcu JSX `ContentTab` dodaj:
```tsx
{paywallCat ? <Paywall category={paywallCat} onClose={() => setPaywallCat(null)} /> : null}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit (łącznie z Task 10)**

```bash
git add src/components/content-level-editor.tsx src/screens/settings-screen.tsx
git commit -m "feat(iap): bramkowanie premium w edytorze tresci + paywall z Ustawien"
```

### Task 12: Weryfikacja w symulatorze (StoreKit)

**Files:** brak (weryfikacja manualna)

> WERYFIKACJA (2026-06-17): bramkowanie i paywall ZWERYFIKOWANE w symulatorze (premium kategorie
> pokazują „Odblokuj", nie-premium normalne kontrolki; paywall otwiera się z PRO/pojedynczą/restore).
> WAŻNE USTALENIE: lokalny StoreKit testing (.storekit) aktywuje się TYLKO przy starcie z Xcode
> (otwórz `ios/Butelka.xcworkspace`, wybierz schemat Butelka, Cmd+R). Przy `expo run:ios`
> (`simctl launch`) konfiguracja StoreKit NIE jest aktywna → `fetchProducts` zwraca pusto, ceny są
> puste, a arkusz zakupu się nie pojawia. Dlatego ceny/zakup/restore testuj uruchamiając z Xcode.

- [ ] **Step 1: Zbuduj i uruchom w symulatorze**

Do testu bramkowania/paywalla: `npx expo run:ios` wystarczy.
Do testu CEN + ZAKUPU + RESTORE: otwórz `ios/Butelka.xcworkspace` w Xcode i Cmd+R (schemat Butelka) —
wtedy `.storekit` z Task 8 aktywuje lokalny StoreKit testing.

- [ ] **Step 2: Scenariusze (potwierdź każdy)**
- Otwórz Ustawienia → Treści. Kategorie premium (Melanż, Hot — grupowo, Tylko we 2 — Hot) po potwierdzeniu 18+ pokazują „Odblokuj — 8,99 zł" zamiast suwaka.
- Tap „Odblokuj" → paywall z ceną PRO 19,99 i pojedynczą 8,99.
- Kup pojedynczą (Melanż) w arkuszu StoreKit → paywall znika, suwak Melanżu aktywny; pozostałe dwie nadal zablokowane.
- Kup PRO → wszystkie trzy odblokowane.
- „Przywróć zakupy" po skasowaniu transakcji w debug menu StoreKit przywraca własność.
- Anulowanie zakupu → kategoria zostaje zablokowana, brak błędu/crasha.

- [ ] **Step 3: Commit (jeśli były poprawki)**

```bash
git add -A && git commit -m "fix(iap): poprawki po weryfikacji w symulatorze"
```

---

## Faza 5 — Produkty w App Store Connect

### Task 13: Utworzenie 4 produktów IAP

**Files:** brak (App Store Connect / ASC API)

- [ ] **Step 1: Utwórz produkty (portal lub ASC API)**

W App Store Connect → Aplikacja Butelka → Monetyzacja → In-App Purchases, utwórz 4 produkty typu Non-Consumable o DOKŁADNIE tych Product ID (nieodwracalne):
- `com.butelka.game.pro` — „PRO — wszystkie kategorie premium", cena ~19,99 zł
- `com.butelka.game.party` — „Melanż / Impreza", ~8,99 zł
- `com.butelka.game.group_hot` — „Hot — grupowo", ~8,99 zł
- `com.butelka.game.couple_hot` — „Tylko we 2 — Hot", ~8,99 zł

Dla każdego: nazwa wyświetlana, opis, zrzut do recenzji, cena. Stan „Ready to Submit" (produkty zatwierdzane razem z buildem przy pierwszej recenzji).

- [ ] **Step 2: Build + wysyłka**

Bump `expo.ios.buildNumber` w `app.json` (powyżej max na ASC), potem:
Run: `bash scripts/ios-local.sh && bash scripts/ios-submit.sh`

- [ ] **Step 3: Weryfikacja na realnym urządzeniu (sandbox)**

Na fizycznym urządzeniu z TestFlight: konto sandbox kupuje PRO i pojedynczą, restore działa. (Symulator pokrywa logikę; sandbox potwierdza realny StoreKit przed produkcją.)

---

## Uwaga o testach (świadome odstępstwo od spec)

Spec zakładał testy data-flow komponentów (kłódka/paywall). Projekt NIE ma infrastruktury do testów RN (brak jest/testing-library; vitest dodajemy tylko do czystej logiki w środowisku node). Dlatego: logika własności (`entitlements.ts`) jest pokryta testami jednostkowymi (Task 3), a bramkowanie i paywall weryfikujemy w symulatorze (Task 12) — zgodnie z dotychczasową kulturą projektu (weryfikacja w symulatorze). Dołożenie pełnej infry RN-testów byłoby osobnym, większym zadaniem poza zakresem tej funkcji.

## Self-review

- Pokrycie spec: produkty (Task 2,7,13), entitlementy (Task 3), expo-iap (Task 4,5,6), StoreKit testing (Task 7,8,12), paywall+bramkowanie (Task 9,10,11), restore (Task 5,9), App Store (Task 13). ✓
- Brak placeholderów: wszystkie kroki z realnym kodem/komendą. ✓
- Spójność typów: `PremiumCategory`, `deriveEntitlements`, `isCategoryUnlocked`, `useIap()`, `priceFor`, `CATEGORY_PRODUCT_ID`, `PRO_PRODUCT_ID` używane spójnie między taskami. ✓
```
