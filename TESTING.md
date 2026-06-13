# Testowanie gry na wielu urządzeniach

Gra działa na cloudowym backendzie Convex (`exciting-sheep-101.convex.cloud`), więc
różne urządzenia łączą się do tego samego pokoju przez 6-znakowy kod — bez niczego
uruchomionego lokalnie poza serwerem deweloperskim Expo.

## Role w grze

- **Host** — gracz, który stworzył pokój (ma koronę 👑 przy avatarze). Tylko host
  uruchamia rundę przyciskiem „Losuj szczęśliwca".
- **Gracze** — dołączają kodem; w lobby widzą „Czekajcie, aż host rozpocznie rundę".
- **Szczęśliwiec** — gracz wskazany przez losowanie. Tylko on widzi wybór
  „Prawda / Wyzwanie". Pozostali widzą „… wybiera prawdę albo wyzwanie".
- Po wyborze **wszyscy** widzą segment (Prawda/Wyzwanie) i treść pytania/zadania.
  Sterowanie turą (Następne / Podaj dalej) ma tylko szczęśliwiec.

## Najszybszy test (symulator iOS + przeglądarka)

1. Symulator iOS z dev buildem = pierwsze urządzenie (host).
   ```bash
   npm run ios
   ```
2. Drugie/trzecie urządzenie = karty przeglądarki. Na webie wymuś inną tożsamość
   parametrem `?clientId=`:
   ```bash
   npm run web   # albo: npx expo start --web --port 8090
   ```
   Otwórz w dwóch kartach (najlepiej jedna normalna, jedna incognito):
   - `http://localhost:8090/?clientId=gracz-a`
   - `http://localhost:8090/?clientId=gracz-b`
3. Na symulatorze: „Utwórz pokój" → zapamiętaj kod. W kartach: „Dołącz do pokoju" → kod.
4. Sprawdź: host (symulator) widzi „Losuj"; gracze (karty) widzą „czekaj na hosta".
   Po losowaniu tylko szczęśliwiec widzi wybór Prawda/Wyzwanie.

> Na webie `?clientId=` nadpisuje tożsamość urządzenia — bez tego wszystkie karty
> tej samej przeglądarki mają ten sam `clientId` (współdzielony `localStorage`).

## Test na kilku prawdziwych telefonach

Gra używa natywnych bibliotek (Lottie), więc **Expo Go nie wystarczy** — potrzebny
dev build lub build EAS:

- **Kilka symulatorów iOS naraz**: otwórz dodatkowe symulatory w Simulator → File →
  New Simulator, a apkę zainstaluj na każdym: `npx expo run:ios --device "<nazwa>"`.
- **Fizyczne telefony**: zbuduj przez EAS — `npx eas build --profile development
  --platform ios` (iOS) / `--platform android` (Android) — i zainstaluj na telefonach.
  Każdy telefon ma własną tożsamość, więc po prostu dołączają do pokoju kodem.

## Reset danych testowych

Stare pokoje/graczy wyczyścisz w panelu Convex:
[dashboard.convex.dev/t/aleksander-3191c/butelka](https://dashboard.convex.dev/t/aleksander-3191c/butelka)
→ Data → tabele `rooms` / `players` / `votes`.
