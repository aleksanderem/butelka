import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { neon } from "@/theme/colors";

type Glow = "violet" | "pink" | "none";

type NeonCardProps = {
  children: ReactNode;
  className?: string;
  glow?: Glow;
  /** Mocniejszy efekt szkła: jaśniejsza obwódka, sheen u góry i odbicia światła na krawędziach. */
  glass?: boolean;
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

export function NeonCard({
  children,
  className,
  glow = "none",
  glass = false,
  style,
}: NeonCardProps) {
  return (
    <View
      className={`overflow-hidden rounded-3xl p-5 ${className ?? ""}`}
      style={[
        {
          backgroundColor: glass ? "rgba(20,15,32,0.55)" : neon.surface,
          borderColor: glass ? "rgba(255,255,255,0.18)" : borderColor[glow],
          borderWidth: 1,
        },
        glass
          ? {
              shadowColor: neon.purple,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 34,
              elevation: 12,
            }
          : glow === "none"
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
        colors={
          glass
            ? ["rgba(255,255,255,0.16)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0)"]
            : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0)"]
        }
        end={{ x: 0.5, y: 1 }}
        locations={glass ? [0, 0.42, 1] : [0, 0.5]}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {glass ? (
        <>
          {/* Górna krawędź łapiąca światło (jasny pasek tuż przy ramce). */}
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.6)", "transparent"]}
            end={{ x: 1, y: 0 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={{ position: "absolute", top: 0, left: 18, right: 18, height: 1.5 }}
          />
          {/* Delikatne odbicie na dolnej krawędzi. */}
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.18)", "transparent"]}
            end={{ x: 1, y: 0 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={{ position: "absolute", bottom: 0, left: 28, right: 28, height: 1 }}
          />
        </>
      ) : null}
      {children}
    </View>
  );
}
