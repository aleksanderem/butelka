# iOS release runbook (EAS → TestFlight) — Butelka

Co jest już przygotowane w repo:

- `app.json`: nazwa `Butelka`, `ios.bundleIdentifier` = `com.butelka.game`, ikona
  (`assets/images/icon.png`, 1024×1024 bez alfy), `ITSAppUsesNonExemptEncryption: false`
  (apka używa tylko standardowego HTTPS do Appwrite — patrz krok 3), `extra.eas.projectId`
  uzupełnione, `owner: amiesak`, `appVersionSource: remote` (numer builda nadaje EAS).
- `eas.json`: profile `development` / `preview` / `production` + `submit.production.ios`.
- Projekt EAS utworzony i podpięty: `@amiesak/butelka`
  (https://expo.dev/accounts/amiesak/projects/butelka).
- `expo-doctor`: 16/18 (2 ostrzeżenia nieblokujące — patrz „Znane ostrzeżenia").

> ⚠️ Bundle id `com.butelka.game` staje się trwały po zarejestrowaniu aplikacji w
> App Store Connect. Jeśli chcesz inny — zmień teraz w `app.json`
> (`ios.bundleIdentifier` i `android.package`) PRZED pierwszym buildem.

## 0. Wymagania wstępne

- Aktywne członkostwo **Apple Developer Program** (99 USD/rok). Musi pokazywać
  „Active" w developer.apple.com przed krokiem 2.
- Konto Expo (jest: `amiesak`) — `eas whoami` powinno je pokazać.
- EAS CLI: `npm i -g eas-cli` (albo prefiksuj komendy `npx eas-cli@latest`).

## 1. (Pominięte — już zrobione) Login + projekt EAS

`eas login` + `eas init` zostały już wykonane; projekt podpięty, `projectId` w `app.json`.
Backend butelki jest już produkcyjny (self-hosted Appwrite + content API na Cloudflare
Workers), więc nie ma kroku „przełącz na prod backend".

## 2. Build iOS (chmura EAS)

```bash
cd ~/projects/butelka
eas build -p ios --profile production
```

Pierwsze uruchomienie poprosi o **logowanie do Apple** (Apple ID + hasło + 2FA) i
pozwoli EAS wygenerować oraz przechować certyfikat dystrybucji i provisioning
profile. To krok, którego nie da się zautomatyzować — trzeba go odklikać samemu.
Wynik to `.ipa` zbudowany w chmurze.

(Szybki build na urządzenie zamiast TestFlight: `--profile preview`. Dev client na
symulator: `--profile development`.)

## 3. Deklaracja szyfrowania

`ITSAppUsesNonExemptEncryption: false` w `app.json` mówi „tylko zwolnione
szyfrowanie (HTTPS)". Jest poprawne, bo butelka rozmawia z Appwrite/content API po
HTTPS i nie ma własnego E2E. Dzięki temu App Store Connect nie pyta o eksport
przy każdym buildzie. Gdybyś kiedyś dodał własne szyfrowanie treści — zmień to i
uzupełnij export compliance.

## 4. Wysyłka do App Store Connect → TestFlight

```bash
eas submit -p ios --profile production --latest
```

Potrafi utworzyć wpis aplikacji w App Store Connect (lub wybrać istniejący) i
wgrać build. Po przetworzeniu (~5–15 min) pojawi się w **TestFlight**.

Skrót obu kroków naraz:

```bash
npx testflight
```

- **Testerzy wewnętrzni** (Ty + do 100 osób z zespołu App Store Connect): instalacja
  przez aplikację TestFlight, **bez review Apple**. To realna ścieżka dystrybucji tej gry.
- **Testerzy zewnętrzni / publiczny App Store**: wymagają Beta App Review (~24 h za
  pierwszym razem, potem natychmiast).

## Znane ostrzeżenia (expo-doctor, nieblokujące)

Oba istnieją od wcześniej, a natywny dev build kompiluje się z tymi wersjami — więc
EAS też się zbuduje. Nie ruszamy działających zależności tuż przed releasem:

- Duplikat `expo-file-system` (56 na górze + 18 zagnieżdżony pod `react-native-appwrite`).
  Autolinking bierze jeden (56). Nie powoduje błędów w buildzie dev.
- `@react-native-async-storage/async-storage` 3.1.1 vs zalecane przez SDK 56 → 2.2.0.
  Celowo 3.1.1 (zgodne z RN 0.85.3). Downgrade byłby ryzykowniejszy niż zostawienie.

Gdyby produkcyjny build EAS faktycznie się o nie wywalił — dopiero wtedy wracamy
do `npx expo install --check`.

## Przydatne

```bash
eas build:list                 # status buildów
eas credentials -p ios         # zarządzanie certyfikatami/profilami
eas build:version:get          # aktualny numer builda
```

## Android (konfiguracja też gotowa)

Ten sam `eas.json`. `eas build -p android --profile production` → `.aab`, potem
`eas submit -p android` na track **Internal testing**, albo zainstaluj `.apk`/`.aab`
bezpośrednio (Android pozwala na sideload). Uwaga: ikona adaptacyjna Androida
(`adaptiveIcon.foregroundImage`) wciąż jest stara — pod build Androida trzeba dać
wariant z bezpiecznym marginesem (Android maskuje foreground do koła/squircle).
