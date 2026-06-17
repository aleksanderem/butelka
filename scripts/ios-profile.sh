#!/usr/bin/env bash
# Tworzy/odświeża profil provisioning App Store dla com.butelka.game pod LOKALNY
# certyfikat dystrybucyjny i instaluje go (~/Library/MobileDevice/Provisioning Profiles/).
# Potrzebne raz na maszynie (lub gdy profil wygaśnie). ios-local.sh wymaga profilu o nazwie
# "com.butelka.game AppStore".
#
# Wymaga: lokalnego certu "Apple Distribution: ... (RWQZ658MDZ)" w keychain + fastlane (brew).
set -euo pipefail
cd "$(dirname "$0")/.."

export PATH="/opt/homebrew/bin:$PATH"
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

KEY_ID="552HR92J68"
ISSUER_ID="bb339c95-6558-4dd4-ac28-aab0076dc370"
P8="$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8"
[ -f "$P8" ] || { echo "❌ Brak $P8"; exit 1; }

# Klucz ASC w formacie JSON dla fastlane (zawiera klucz prywatny → tylko /tmp, kasowany na końcu).
TMP_KEY="$(mktemp -t asc-fastlane).json"
trap 'rm -f "$TMP_KEY"' EXIT
node -e '
const fs=require("node:fs");
const key=fs.readFileSync(process.argv[1],"utf8");
fs.writeFileSync(process.argv[2],JSON.stringify({key_id:process.argv[3],issuer_id:process.argv[4],key,in_house:false,duration:1200}));
fs.chmodSync(process.argv[2],0o600);' "$P8" "$TMP_KEY" "$KEY_ID" "$ISSUER_ID"

echo "▶ fastlane sigh — profil App Store dla com.butelka.game (pod lokalny cert)"
fastlane sigh \
  --api_key_path "$TMP_KEY" \
  --app_identifier com.butelka.game \
  --platform ios \
  --output_path "$(pwd)/build"

# Xcode 26 nie zawsze instaluje profil tam, gdzie szuka go xcodebuild — kopiujemy ręcznie
# (nazwa pliku = UUID profilu; xcodebuild i tak dopasowuje po nazwie/UUID z treści).
SRC="$(pwd)/build/AppStore_com.butelka.game.mobileprovision"
PROF_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
mkdir -p "$PROF_DIR"
UUID=$(security cms -D -i "$SRC" 2>/dev/null | plutil -extract UUID raw -)
cp "$SRC" "$PROF_DIR/$UUID.mobileprovision"
echo "✅ Profil 'com.butelka.game AppStore' zainstalowany ($UUID). ios-local.sh jest gotowy."
