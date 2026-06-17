# Zakupy w aplikacji (IAP) — projekt

Data: 2026-06-17
Status: zatwierdzony (brainstorm), do przeglądu przed planem implementacji
Aplikacja: Butelka (Expo SDK 56, RN 0.85, iOS-only), bundle `com.butelka.game`, ascAppId `6780188325`

## Cel

Wprowadzić zakupy w aplikacji odblokowujące 3 kategorie treści oznaczone dziś
`premium: true` w `src/game/main-categories.ts` (Melanż/Impreza `party`,
Hot — grupowo `group_hot`, Tylko we 2 — Hot `couple_hot`). Dziś są darmowe i tylko
oznaczone (mierzymy zainteresowanie). Teraz stają się płatne.

## Model sprzedaży (zatwierdzony)

Hybryda: duży „PRO" odblokowujący wszystko ORAZ pojedyncze odblokowania per kategoria.
Wszystkie produkty są **non-consumable** (kupione raz, na zawsze).

| Product ID | Co odblokowuje | Cena startowa (PLN) |
|---|---|---|
| `com.butelka.game.pro` | wszystkie 3 premium | 19,99 |
| `com.butelka.game.party` | Melanż / Impreza | 8,99 |
| `com.butelka.game.group_hot` | Hot — grupowo | 8,99 |
| `com.butelka.game.couple_hot` | Tylko we 2 — Hot | 8,99 |

Ceny finalnie żyją w App Store Connect i są pobierane lokalnie ze StoreKitu
(`displayPrice`). W kodzie wyłącznie ID produktów — nigdy hardkodowane kwoty.

## Technologia (zatwierdzona)

`expo-iap` + StoreKit 2. Bez third-party (RevenueCat odrzucony), bez dodatkowego cutu.
Wymaga dev-buildu — mamy lokalny pipeline (`scripts/ios-local.sh`).

## Własność / entitlement

- Źródło prawdy: StoreKit 2 `currentEntitlements` (transakcje zweryfikowane przez Apple,
  on-device). Przeżywa reinstal (wiązane z Apple ID) → restore i „co posiadam" za darmo.
- Kategoria jest odblokowana, gdy posiadasz PRO **lub** jej własny produkt.
- **Bez backendu**: Appwrite NIE przechowuje zakupów. (Rozważany mirror do player-doc —
  niepotrzebny; dokłada złożoności i powierzchnię ataku bez korzyści.)
- Opcjonalny lokalny cache ostatniego stanu (SecureStore/AsyncStorage) tylko dla szybkiego
  UI na zimnym starcie — NIGDY jako autorytet; przy starcie i tak re-weryfikujemy ze StoreKitu.

## Bramkowanie (kluczowe dla trybu wielu telefonów)

Treść pokoju konfiguruje **host** (twórca pokoju) w edytorze treści
(`src/components/content-level-editor.tsx`, używany w Ustawienia → Treści; plus plakietki
kłódki na ekranach przeglądania „Kategorie"). Premium ustawia zawsze host.

- Gracze, którzy **dołączają** do pokoju, grają tym, co host włączył — nic nie kupują.
- Paywall odpala się, gdy host próbuje **włączyć** niezakupioną kategorię premium
  (po przejściu bramki wieku 18+). Tryb 1-telefon: identycznie (host = jedyny).

Niezakupiona kategoria premium w edytorze: pokazana z kłódką + ceną, suwak poziomu
zablokowany; tap → paywall sfokusowany na tej kategorii z upsellem PRO.

## Architektura / moduły (małe, izolowane)

- `src/iap/products.ts` — stałe ID produktów + mapowanie produkt↔`ModeGroup`
  (`party`/`group_hot`/`couple_hot`) + lista wszystkich ID do zapytania o produkty.
- `src/iap/entitlements.ts` — czysta logika (bez I/O): `deriveEntitlements(ownedIds): { hasPro, ownedCategories: Set<ModeGroup> }`,
  `isCategoryUnlocked(category, entitlements): boolean`. W pełni testowalne jednostkowo.
- `src/iap/use-iap.ts` + `IapProvider` — opakowanie `expo-iap`: inicjalizacja połączenia,
  pobranie produktów (z lokalną ceną), odczyt `currentEntitlements` → wyliczone entitlementy,
  `purchase(productId)`, `restore()`, stany `loading`/`error`. Udostępniane całej apce kontekstem;
  root owinięty w `IapProvider`.
- `src/components/paywall.tsx` — neonowy modal w stylu apki:
  - nagłówek z kategorią, na której odpalono paywall,
  - „Odblokuj [Kategoria] — {displayPrice}" (pojedyncza),
  - wyróżnione „PRO — wszystko za {displayPrice}" (best value),
  - „Przywróć zakupy" (Apple wymaga przy non-consumable),
  - linki do regulaminu/prywatności (mamy hostowane URL-e).
- Wejście „Premium / Odblokuj" w Ustawieniach (drugi punkt wejścia do paywalla).

## Konfiguracja natywna

- `app.json`: config plugin `expo-iap` + capability In-App Purchase (StoreKit).
- Dev/produkcja przez lokalny pipeline (`scripts/ios-local.sh`); produkcja nadal działa też przez EAS.

## Testowanie w symulatorze (jedyne środowisko testowe)

StoreKit sandbox wymaga realnego urządzenia. Aby testować w symulatorze:
- Plik `Butelka.storekit` z 4 produktami i cenami PLN.
- Config plugin (`withStoreKitConfig`), który przy `expo prebuild` wstrzykuje referencję
  pliku `.storekit` do schematu Xcode (Run action) — bo prebuild regeneruje `ios/` i ręczna
  zmiana schematu by przepadła. Dzięki temu `expo run:ios` (symulator) używa lokalnego StoreKit
  testing: kupno PRO/pojedynczej, restore, anulowanie — bez konta sandbox.

## Obsługa błędów / przypadki brzegowe

- Anulowanie przez użytkownika → no-op (zamknięcie arkusza, bez błędu).
- Błąd sieci / StoreKit niedostępny → komunikat + możliwość ponowienia; kategorie zostają zablokowane.
- „Ask to Buy" / transakcja pending → komunikat „czeka na zatwierdzenie"; odblokowanie po finalizacji.
- Już posiadane → traktujemy jak odblokowane (idempotentnie), bez podwójnej płatności.
- Każda udana transakcja musi być sfinalizowana (`finishTransaction`), inaczej StoreKit ją powtarza.

## Strategia testów (zgodnie z regułami projektu)

- Jednostkowe: `entitlements.ts` (PRO odblokowuje wszystko; pojedyncza odblokowuje jedną;
  brak → zablokowane; PRO+pojedyncza → spójne).
- Data-flow/integracyjne: edytor treści pokazuje kłódkę na nieposiadanym premium i otwiera
  paywall; posiadane → suwak aktywny i kategorię da się włączyć (mock hooka IAP).
- Paywall: warianty (pojedyncza vs PRO), stan po zakupie, „Przywróć zakupy" wywołuje `restore()`.
- Manualne w symulatorze (StoreKit config): kup PRO → wszystkie 3 odblokowane; kup pojedynczą →
  tylko ta; restore po „reinstalu"; anulowanie.

## Poza zakresem (YAGNI)

- Subskrypcje, consumables, waluta w grze.
- Android (apka iOS-only) — moduły piszemy tak, by dało się dołożyć później, ale nie teraz.
- Mirror entitlementów do Appwrite / serwerowa walidacja paragonów.

## Ryzyka / uwagi review

- Kategorie były DARMOWE w wydanym #9 — zamiana na płatne jest dozwolona, ale formalnie odbiera
  wcześniej darmową treść; przy świeżej apce ryzyko minimalne. Ocena wiekowa bez zmian (ta sama treść,
  już zaakceptowana 18+).
- „Przywróć zakupy" jest obowiązkowe (Guideline 3.1.1) — w paywallu i/lub Ustawieniach.
- Product ID w App Store Connect są nieodwracalne po utworzeniu — trzymamy się powyższych nazw.

## Zarys implementacji (do rozwinięcia w planie)

1. Rdzeń IAP: `products.ts`, `entitlements.ts` (+ testy jednostkowe), `use-iap.ts`/`IapProvider`,
   plugin `expo-iap` w `app.json`, dev build.
2. StoreKit testing: `Butelka.storekit` + `withStoreKitConfig`; weryfikacja w symulatorze.
3. Paywall + integracja bramkowania w edytorze treści i Ustawieniach (+ testy data-flow).
4. App Store Connect: utworzenie 4 produktów, ceny, opisy, „gotowe do sprzedaży".
