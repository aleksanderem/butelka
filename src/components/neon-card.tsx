import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { neon } from "@/theme/colors";

type Glow = "violet" | "pink" | "none";

type NeonCardProps = {
  children: ReactNode;
  className?: string;
  glow?: Glow;
  style?: StyleProp<ViewStyle>;
};

const glowColor: Record<Exclude<Glow, "none">, string> = {
  violet: neon.purple,
  pink: neon.magenta,
};

const borderColor: Record<Glow, string> = {
  violet: "rgba(139,92,246,0.45)",
  pink: "rgba(244,63,94,0.4)",
  none: "rgba(168,150,200,0.14)",
};

export function NeonCard({ children, className, glow = "none", style }: NeonCardProps) {
  return (
    <View
      className={`overflow-hidden rounded-3xl p-5 ${className ?? ""}`}
      style={[
        {
          backgroundColor: neon.surface,
          borderColor: borderColor[glow],
          borderWidth: 1,
        },
        glow === "none"
          ? {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.4,
              shadowRadius: 28,
            }
          : {
              shadowColor: glowColor[glow],
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 26,
              elevation: 8,
            },
        style,
      ]}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.5]}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
