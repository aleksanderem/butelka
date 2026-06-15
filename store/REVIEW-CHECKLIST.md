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
- [x] Polityka prywatności ZHOSTOWANA: `https://butelka-legal.aleksander-kolabogroup.workers.dev/privacy`
- [x] URL pomocy ZHOSTOWANY: `https://butelka-legal.aleksander-kolabogroup.workers.dev/`
      (Cloudflare Workers Static Assets, źródło w repo `web/`, deploy: `cd web && npx wrangler deploy`)
- [ ] Metadane: nazwa, podtytuł, opis, słowa kluczowe, tekst promocyjny — z `store/app-store-connect.md`
- [ ] Ocena wiekowa: wypełnij kwestionariusz wg sekcji 3 (`app-store-connect.md`)
- [ ] App Privacy: uzupełnij etykietę wg sekcji 4
- [ ] Notatki dla recenzenta: wklej sekcję 5
- [ ] Zrzuty ekranu (patrz niżej)
- [ ] Kategoria: Gry (Games) → np. Trivia / Casual

## C. Zrzuty ekranu (wymagane)
- iPhone 6.9" (np. 1320×2868) — WYMAGANE
- iPhone 6.5" (1284×2778) — zalecane
- iPad — NIE wymagane (ustawiliśmy `supportsTablet: false`, iPhone-only)
- 3–10 zrzutów; pokaż: ekran główny, kategorie, losowanie/krążenie karty, prawda/wyzwanie, przebieg gry

## D. Decyzje (PODJĘTE na v1)
**D1 — najostrzejsze treści 18+ (explicit): ZOSTAJĄ.** Wysyłamy pełny zestaw, świadomie z ryzykiem
odrzucenia (1.1.4/1.1.6). Mitygacja w notatkach dla recenzenta i opisie (sugestywna gra dla
dorosłych, zgoda i granice, bramka 18+, nie pornografia). Plan B przy odbiciu: wyłączyć
group_hot/couple_hot i wysłać ponownie.

**D2 — `supportsTablet`: USTAWIONE `false`** (iPhone-only). Zrzuty iPada nie są wymagane.

**D3 — badge: ZŁAGODZONY.** „PREMIUM" → „HOT" (różowy płomień), pokazywany tylko na realnie
gorących trybach (Melanż, Hot — grupowo, Tylko we 2 — Hot); „Tylko we 2" stracił badge. Logowanie
popytu działa bez zmian (logujemy wszystkie otwarcia kategorii). „PREMIUM" wróci z prawdziwym IAP.

## E. Krytyczne przed wysyłką
- [ ] Backend Appwrite ONLINE i stabilny w trakcie recenzji — inaczej „Utwórz pokój" nie działa i
      Apple odrzuci. (W chwili pisania serwer zwraca 502 — postawić przed zgłoszeniem.)
- [ ] Smoke test na realnym TestFlight buildzie: utwórz pokój, dodaj gracza, losowanie, prawda/wyzwanie.

## F. Build i wysyłka (uruchamiam tylko na Twoją wyraźną zgodę)
```
npx eas-cli build -p ios --profile production --auto-submit --non-interactive
```
Po wejściu builda do App Store Connect: uzupełnij metadane/zrzuty → „Add for Review" → Submit.
