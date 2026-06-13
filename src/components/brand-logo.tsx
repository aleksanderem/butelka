import { Image } from "react-native";

const LOGO_RATIO = 913 / 446;

/** Logo „PRAWDA czy WYZWANIE” (plik logo.png z dekoracjami w komplecie). */
export function BrandLogo({ width = 300 }: { width?: number }) {
  return (
    <Image
      resizeMode="contain"
      source={require("../../logo.png")}
      style={{ height: width / LOGO_RATIO, width }}
    />
  );
}
