# Checklista zgłoszenia do App Review — Butelka

## A. Gotowe technicznie (w kodzie / konfiguracji)
- [x] Bundle `com.butelka.game`, wersja 1.0.0, `ascAppId` 6780188325 (rekord w App Store Connect istnieje)
- [x] Ikona, splash, orientacja portret, ciemny motyw
- [x] `ITSAppUsesNonExemptEncryption=false` (brak pytania o export compliance przy każdym buildzie)
- [x] Manifest prywatności generowany przez EAS prebuild — pokrywa wymagane API (UserDefaults `CA92.1`, FileTimestamp, BootTime), `NSPrivacyTracking=false`
- [x] Tryb testowy domyślnie OFF (przyciski testowe nie pokazują się userowi)
- [x] Brak `console.log` / kodu dev w `src`
- [x] Bramka wieku 18+ w aplikacji

## B. Do zrobienia przez Ciebie w App Store Connect (portal)
- [ ] Umowa Paid Apps NIE jest potrzebna (apka darmowa, bez IAP) — pomijamy bank/podatki
- [ ] Polityka prywatności: zhostuj treść z `store/PRIVACY-POLICY.md` i wklej URL
- [ ] URL pomocy (wymagany) — prosty landing / strona kontaktu
- [ ] Metadane: nazwa, podtytuł, opis, słowa kluczowe, tekst promocyjny — z `store/app-store-connect.md`
- [ ] Ocena wiekowa: wypełnij kwestionariusz wg sekcji 3 (`app-store-connect.md`)
- [ ] App Privacy: uzupełnij etykietę wg sekcji 4
- [ ] Notatki dla recenzenta: wklej sekcję 5
- [ ] Zrzuty ekranu (patrz niżej)
- [ ] Kategoria: Gry (Games) → np. Trivia / Casual

## C. Zrzuty ekranu (wymagane)
- iPhone 6.9" (np. 1320×2868) — WYMAGANE
- iPhone 6.5" (1284×2778) — zalecane
- iPad 13" — WYMAGANE **tylko jeśli zostawimy `supportsTablet: true`** (patrz decyzja D2)
- 3–10 zrzutów; pokaż: ekran główny, kategorie, losowanie/krążenie karty, prawda/wyzwanie, przebieg gry

## D. Decyzje, które wpływają na zgłoszenie
**D1 — najostrzejsze treści 18+ (tryby „Hot — grupowo" i „Tylko we 2 — Hot", `explicit`):**
Apple odrzuca treści jawnie seksualne/pornograficzne niezależnie od bramki wieku. Bezpieczniej na
v1 wyłączyć te dwa tryby (zostają Classic/Teen/Melanż/We 2), co zbija ryzyko odrzucenia i obniża
ocenę „treści seksualnych". Można je dodać później. Alternatywa: zostawić i ryzykować rundę odbić.

**D2 — `supportsTablet`:** obecnie `true` → App Store wymaga zrzutów iPada. Apka jest portretową grą
na telefon — rekomendacja: ustawić `false` (iPhone-only), żeby nie robić assetów iPada i uprościć
review.

**D3 — badge „PREMIUM" bez zakupów:** etykieta jest tylko oznaczeniem (treść darmowa, brak IAP).
Recenzent może zapytać „gdzie kupić premium". Opcje: zostawić (małe ryzyko pytania) albo na v1
zmienić napis na nie-komercyjny (np. „HOT”/„18+”), a „PREMIUM” wrócić z prawdziwym IAP.

## E. Krytyczne przed wysyłką
- [ ] Backend Appwrite ONLINE i stabilny w trakcie recenzji — inaczej „Utwórz pokój" nie działa i
      Apple odrzuci. (W chwili pisania serwer zwraca 502 — postawić przed zgłoszeniem.)
- [ ] Smoke test na realnym TestFlight buildzie: utwórz pokój, dodaj gracza, losowanie, prawda/wyzwanie.

## F. Build i wysyłka (uruchamiam tylko na Twoją wyraźną zgodę)
```
npx eas-cli build -p ios --profile production --auto-submit --non-interactive
```
Po wejściu builda do App Store Connect: uzupełnij metadane/zrzuty → „Add for Review" → Submit.
