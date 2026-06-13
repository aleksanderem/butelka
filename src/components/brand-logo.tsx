import { Text, View } from "react-native";

import { neon } from "@/theme/colors";

type BrandLogoProps = {
  /** Bazowy rozmiar „PRAWDA” w px; reszta skaluje się proporcjonalnie. */
  size?: number;
  align?: "center" | "left";
};

export function BrandLogo({ size = 52, align = "center" }: BrandLogoProps) {
  const items = align === "center" ? "items-center" : "items-start";

  return (
    <View className={`${items} gap-0`}>
      <Text
        style={{
          color: neon.white,
          fontSize: size,
          fontWeight: "900",
          letterSpacing: 1,
          lineHeight: size * 1.02,
          textShadowColor: "rgba(139,92,246,0.85)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 18,
        }}
      >
        PRAWDA
      </Text>
      <View className="flex-row items-end gap-2">
        <Text
          style={{
            color: neon.textMuted,
            fontSize: size * 0.34,
            fontWeight: "800",
            letterSpacing: 1,
            marginBottom: size * 0.12,
            textTransform: "uppercase",
          }}
        >
          czy
        </Text>
        <Text
          style={{
            color: neon.magenta,
            fontSize: size * 0.84,
            fontStyle: "italic",
            fontWeight: "900",
            letterSpacing: 1,
            textShadowColor: "rgba(244,63,94,0.85)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 18,
          }}
        >
          WYZWANIE
        </Text>
      </View>
    </View>
  );
}
