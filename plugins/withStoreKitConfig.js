const { withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const STOREKIT_FILE = "Butelka.storekit";
const SCHEME = "Butelka.xcscheme";

// 1) Skopiuj Butelka.storekit z roota repo do ios/ (expo prebuild regeneruje ios/).
const withCopyStoreKit = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, STOREKIT_FILE);
      const dest = path.join(cfg.modRequest.platformProjectRoot, STOREKIT_FILE);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
      return cfg;
    },
  ]);

// 2) Dopisz referencję StoreKit do <LaunchAction> w schemacie (przetrwa prebuild).
//    Ścieżka liczona od katalogu schematu: ios/Butelka.xcodeproj/xcshareddata/xcschemes/ -> ios/.
const withSchemeStoreKit = (config) =>
  withDangerousMod(config, [
    "ios",
    (cfg) => {
      const schemePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "Butelka.xcodeproj/xcshareddata/xcschemes",
        SCHEME
      );
      if (!fs.existsSync(schemePath)) {
        return cfg;
      }
      let xml = fs.readFileSync(schemePath, "utf8");
      if (xml.includes("StoreKitConfigurationFileReference")) {
        return cfg;
      }
      // Ścieżka względna do SourceRoot/.xcodeproj (potwierdzone: Xcode pisze "../<plik>",
      // co wskazuje plik o jeden poziom wyżej niż katalog projektu). Wstawiamy jako ostatnie
      // dziecko <LaunchAction>, dokładnie tak jak robi to Xcode UI.
      const ref =
        `      <StoreKitConfigurationFileReference\n` +
        `         identifier = "../${STOREKIT_FILE}">\n` +
        `      </StoreKitConfigurationFileReference>\n      `;
      xml = xml.replace("</LaunchAction>", `${ref}</LaunchAction>`);
      fs.writeFileSync(schemePath, xml);
      return cfg;
    },
  ]);

module.exports = (config) => withSchemeStoreKit(withCopyStoreKit(config));
