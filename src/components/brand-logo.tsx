import { Image } from "react-native";

import { getLang } from "@/game/language";

// Logo wg języka: PL „PRAWDA czy WYZWANIE", EN „TRUTH or DARE" (oba z dekoracjami, transparent).
const LOGO_PL = require("../../logo.png");
const LOGO_EN = require("../../logo-en.png");
const RATIO_PL = 913 / 446;
const RATIO_EN = 1000 / 565;

export function BrandLogo({ width = 300 }: { width?: number }) {
  const en = getLang() === "en";
  const ratio = en ? RATIO_EN : RATIO_PL;
  return (
    <Image
      resizeMode="contain"
      source={en ? LOGO_EN : LOGO_PL}
      style={{ height: width / ratio, width }}
    />
  );
}
