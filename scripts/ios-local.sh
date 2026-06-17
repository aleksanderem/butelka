#!/usr/bin/env bash
# Lokalny build iOS butelki -> podpisany .ipa, bez kolejki EAS.
# (`eas build --local` jest zepsuty na macOS 26 przy imporcie certyfikatu, dlatego
#  używamy surowego xcodebuild; podpis dystrybucyjny przy eksporcie kluczem ASC .p8.)
#
# Wyjście: ./build-local-ios.ipa  (dystrybucja App Store -> wgraj: bash scripts/ios-submit.sh)
set -euo pipefail
cd "$(dirname "$0")/.."

export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8      # CocoaPods wywala się przy innym locale
export PATH="/opt/homebrew/bin:$PATH"            # brew: cocoapods/fastlane/itd.

ASC_KEY="$HOME/.appstoreconnect/private_keys/AuthKey_552HR92J68.p8"
ASC_KEY_ID="552HR92J68"
ASC_ISSUER_ID="bb339c95-6558-4dd4-ac28-aab0076dc370"
TEAM="RWQZ658MDZ"
WORKSPACE="ios/Butelka.xcworkspace"
SCHEME="Butelka"

# Numer builda z app.json (expo.ios.buildNumber). Musi być wyższy niż max na ASC.
BUILD_NO=$(node -e 'const b=require("./app.json").expo.ios?.buildNumber; if(!b){process.exit(2)} console.log(b)') || {
  echo "❌ Ustaw expo.ios.buildNumber w app.json (liczba wyższa niż max na App Store Connect)."; exit 1; }
MAX=$(node scripts/asc-max-build.mjs 2>/dev/null || echo "?")
echo "▶ buildNumber app.json = $BUILD_NO   (max na ASC: $MAX — nowy musi być wyższy)"
if [[ "$MAX" =~ ^[0-9]+$ && "$BUILD_NO" =~ ^[0-9]+$ && "$BUILD_NO" -le "$MAX" ]]; then
  echo "❌ buildNumber ($BUILD_NO) nie jest wyższy niż max na ASC ($MAX). Podbij expo.ios.buildNumber w app.json."; exit 1
fi

echo "▶ 1/4 expo prebuild (generuje ios/, pod install)"
npx expo prebuild --platform ios --clean

echo "▶ 2/4 wymuszam CFBundleVersion=$BUILD_NO w Info.plist (niezależnie od appVersionSource)"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NO" "ios/Butelka/Info.plist"

echo "▶ 3/4 xcodebuild archive (manual signing — profil App Store + lokalny cert dystrybucyjny)"
rm -rf build/Butelka.xcarchive
xcodebuild archive \
  -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Release \
  -archivePath "$(pwd)/build/Butelka.xcarchive" \
  -destination "generic/platform=iOS" \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM="$TEAM" \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  PROVISIONING_PROFILE_SPECIFIER="com.butelka.game AppStore"

echo "▶ 4/4 xcodebuild -exportArchive (podpis dystrybucyjny via klucz ASC)"
rm -rf build/ipa
xcodebuild -exportArchive \
  -archivePath "$(pwd)/build/Butelka.xcarchive" \
  -exportPath "$(pwd)/build/ipa" \
  -exportOptionsPlist "$(pwd)/credentials/ExportOptions.plist" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$ASC_KEY" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"

cp build/ipa/Butelka.ipa "$(pwd)/build-local-ios.ipa"
echo "✅ build-local-ios.ipa gotowe (build $BUILD_NO)"
echo "   Wgraj do TestFlight:  bash scripts/ios-submit.sh"
