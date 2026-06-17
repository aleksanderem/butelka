#!/usr/bin/env bash
# Wgranie .ipa prosto do App Store Connect / TestFlight przez Apple altool — bez Expo/EAS.
# Auth: klucz App Store Connect (.p8). Numer builda musi być wyższy niż cokolwiek na ASC.
#
# Użycie:  bash scripts/ios-submit.sh [ścieżka-do-ipa]   (domyślnie build-local-ios.ipa)
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/opt/homebrew/bin:$PATH"
KEY_ID="552HR92J68"
ISSUER_ID="bb339c95-6558-4dd4-ac28-aab0076dc370"
IPA="${1:-build-local-ios.ipa}"

# altool szuka klucza po id w ~/.appstoreconnect/private_keys/ (już tam jest).
[ -f "$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8" ] || {
  echo "❌ Brak ~/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8"; exit 1; }
[ -f "$IPA" ] || { echo "❌ Brak pliku $IPA — najpierw: bash scripts/ios-local.sh"; exit 1; }

echo "▶ Wgrywam $IPA → App Store Connect (altool, bez Expo)"
xcrun altool --upload-app -f "$IPA" --type ios \
  --apiKey "$KEY_ID" --apiIssuer "$ISSUER_ID"
echo "✅ Wgrane. Apple przetwarza ~5–10 min, potem pojawi się w TestFlight:"
echo "   https://appstoreconnect.apple.com/apps/6780188325/testflight/ios"
