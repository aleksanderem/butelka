# Deploy do TestFlight — Butelka

Konfiguracja EAS jest gotowa. Poniżej kroki, które trzeba wykonać u siebie (wymagają logowania do Apple — tego nie da się zautomatyzować z poziomu asystenta).

## Co już jest zrobione

- `eas.json` — profile `development` / `preview` / `production` + `submit.production.ios`.
- Projekt EAS utworzony i podpięty: `@amiesak/butelka` (`extra.eas.projectId` w `app.json`, ID `59ab5ee8-a364-4d83-ad2c-470d202557a0`).
- `appVersionSource: "remote"` + `autoIncrement: true` — numer builda nadaje i podbija EAS.
- Bundle ID: `com.butelka.game`, wersja `1.0.0`, ikony obecne. `ios/` jest gitignorowany, więc EAS robi prebuild (CNG) z `app.json`.

## Wymagania po stronie Apple (jednorazowo)

1. Konto **Apple Developer Program** (płatne, 99 USD/rok) z dostępem do App Store Connect.
2. Numer zespołu (**Team ID**) — EAS wypisze go przy pierwszym buildzie; możesz go też podejrzeć w developer.apple.com → Membership.
3. Aplikacja w **App Store Connect** z bundlem `com.butelka.game`. EAS potrafi ją utworzyć automatycznie przy submit, jeśli bundle jest wolny i jesteś zalogowany do Apple.

Opcjonalnie, żeby nie wpisywać Apple ID za każdym razem:

```bash
export EXPO_APPLE_ID="twoj-apple-id@email.com"
export EXPO_APPLE_TEAM_ID="XXXXXXXXXX"
```

## Build + wysyłka na TestFlight

Najprościej — jedna komenda buduje w chmurze i wysyła na TestFlight:

```bash
cd ~/projects/butelka
npx testflight
```

Równoważnie, krok po kroku:

```bash
# 1. Build produkcyjny (chmura EAS). Pierwszy raz poprosi o logowanie do Apple
#    i sam wygeneruje certyfikat dystrybucji + provisioning profile.
npx eas-cli@latest build -p ios --profile production

# 2. Wyślij gotowy build do App Store Connect / TestFlight.
npx eas-cli@latest submit -p ios --profile production --latest
```

Po wgraniu: App Store Connect → TestFlight → dodaj testerów wewnętrznych (dostają build od razu, bez review). Testerzy zewnętrzni wymagają jednorazowego Beta App Review.

## Przydatne

```bash
eas build:list                 # status buildów
eas credentials -p ios         # zarządzanie certyfikatami/profilami
eas build:version:get          # aktualny numer builda
```

## Uwaga

`ios/` jest w `.gitignore` (CNG). Gdybyś chciał budować z natywnego katalogu zamiast prebuildu, usuń `/ios` z `.gitignore` i zacommituj katalog — wtedy EAS użyje istniejącej natywki.
