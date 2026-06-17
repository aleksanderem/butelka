# Google Play — komplet do wklejenia (Butelka)

App: `com.butelka.game` · wersja 1.1.0 · gra darmowa + IAP (Play Billing)
Konto: Play Console (masz). Track startowy: `internal`.

## 1. Store listing (PL — język główny)

- Nazwa aplikacji (≤30): `Butelka: Prawda czy Wyzwanie`  (28 zn.)
- Krótki opis (≤80): `Prawda czy wyzwanie na domówkę — stwórz pokój, podaj kod i grajcie razem.`
- Pełny opis (≤4000):

```
Butelka to prawda albo wyzwanie na Twoją domówkę, melanż czy wieczór ze znajomymi — w jednej, neonowej aplikacji.

JAK TO DZIAŁA
• Stwórz pokój i podaj znajomym 6-cyfrowy kod.
• Grajcie razem na jednym telefonie albo każdy na swoim.
• Karta „Ty” krąży wśród graczy, los wskazuje szczęśliwca, a on wybiera: prawda czy wyzwanie.
• Tura przechodzi dalej — i tak aż do rana.

KATEGORIE NA KAŻDĄ EKIPĘ
• Classic — dla każdego, zero spiny, idealne na rozgrzewkę.
• Teen — bezpieczna wersja dla młodszych, bez alkoholu i podtekstów.
• Melanż / Impreza — imprezowy chaos dla dorosłych.
• Tylko we 2 — bliskość i rozmowy dla par.
• Tryby hot dla dorosłych — odważniej, z naciskiem na zgodę i granice.

DLACZEGO POLUBISZ
• Bez zakładania konta — wpisujesz imię i grasz.
• Tysiące kart, regulacja intensywności i filtry treści.
• Bramka wieku dla treści 18+.
• Dopracowany, szybki interfejs i przyjemne wibracje.

Zbierz ekipę i odpal Butelkę. Reszta zrobi się sama.
```

- Kategoria: Gry → Casual (alt. Card/Trivia). Tagi: prawda, wyzwanie, impreza, domówka, gra towarzyska, dla par, party.
- E-mail kontaktowy: aleksander@kolaboit.pl
- Polityka prywatności: https://butelka-legal.aleksander-kolabogroup.workers.dev/privacy

## 2. Grafiki (wymogi Play)

- Ikona: 512×512 PNG (mam `assets/images/icon.png` — przeskaluję do 512).
- Feature graphic: 1024×500 PNG — WYMAGANE, Android-specyficzne, nie istnieje → dorobię (neonowy baner z logo/tytułem).
- Zrzuty telefonu: min 2, maks 8. Uwaga: proporcja Play maks 2:1; zrzuty iOS 1284×2778 (2.16:1) są ciut za wysokie → przytnę do ≤2:1 (np. 1284×2568). Zestaw przygotuję z istniejących.
- (Opcjonalnie) zrzuty tabletu 7"/10" — nieobowiązkowe (telefon-only).

## 3. Data Safety (kwestionariusz — odpowiednik App Privacy)

- Czy aplikacja zbiera/udostępnia dane? Zbiera: TAK. Udostępnia (3rd party): NIE.
- Szyfrowanie w tranzycie: TAK (HTTPS).
- Usuwanie danych na żądanie: brak kont; dane anonimowe/efemeryczne — opcja „brak mechanizmu konta" + kontakt e-mail.
- Zbierane typy:
  - Identyfikatory urządzenia (anonimowy clientId): cel — Działanie aplikacji + Analityka; NIE do trackingu/reklam; nie udostępniane.
  - Treści użytkownika (wpisywana nazwa gracza, dane rozgrywki): cel — Działanie aplikacji.
  - Działania w aplikacji (otwarcia kategorii): cel — Analityka.
- Reklamy: NIE. Tracking między apkami: NIE.

## 4. Ocena treści (kwestionariusz IARC)

Odpowiadać zgodnie z prawdą — wynik docelowo 18+ (PEGI 18 / Mature):
- Treści seksualne / sugestywne: TAK (tryby hot, za bramką 18+).
- Wulgaryzmy: łagodne/okazjonalne.
- Alkohol/tytoń/narkotyki: odniesienia (motyw imprezy).
- Hazard: NIE. Przemoc: NIE.
- Interakcje użytkowników / treści generowane przez użytkownika: nazwa gracza wpisywana lokalnie (bez czatu publicznego).
> Uwaga: Google bywa ostrzejszy niż Apple wobec treści seksualnych — ryzyko odrzucenia trybów explicit realne (decyzja: wysyłamy pełny zestaw).

## 5. Pricing & distribution

- Darmowa. Kraje: zaznacz docelowe (PL + reszta wg uznania).
- Zawiera IAP: TAK (Play Billing — produkty tworzone osobno, patrz niżej).
- Reklamy: NIE.

## 6. IAP na Androidzie (Play Billing)

Produkty trzeba utworzyć w Play Console → Monetize → Products → In-app products PO wgraniu pierwszego AAB (te same ID co iOS):
- `com.butelka.game.pro` (PRO) · `com.butelka.game.party` · `com.butelka.game.group_hot` · `com.butelka.game.couple_hot`
- Kod (`src/iap`) jest już cross-platform (gałąź `google` w `requestPurchase`). Do czasu utworzenia produktów paywall na Androidzie się nie domknie.

## 7. Build + submit (EAS)

- Build AAB: `eas build -p android --profile production` (pierwszy = EAS cloud, generuje keystore/Play App Signing).
- Submit (po utworzeniu apki w konsoli + service-account JSON jako `google-service-account.json`):
  `eas submit -p android --latest`  (track `internal` z `eas.json`).
- Kolejne buildy mogą iść lokalnie (brak buga z certem — to był iOS/macOS 26).

## Checklist pierwszego wydania

- [ ] Utwórz apkę w Play Console (`com.butelka.game`)
- [ ] Service account (Google Cloud) + link w Play Console → API access → `google-service-account.json`
- [ ] Listing (sekcja 1) + grafiki (sekcja 2)
- [ ] Data Safety (sekcja 3) + ocena treści (sekcja 4) + pricing (sekcja 5)
- [ ] Wgraj AAB na track `internal`, przetestuj
- [ ] Utwórz produkty IAP (sekcja 6), przetestuj zakupy
- [ ] Promuj na produkcję
