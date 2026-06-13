import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { gradients, neon } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

/** Duża neonowa karta „Ty”, która krąży wśród graczy (ekran 3). */
export function GameCard({ label, spinning = false }: { label: string; spinning?: boolean }) {
  return (
    <View
      style={{
        shadowColor: neon.purpleBright,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: spinning ? 1 : 0.8,
        shadowRadius: spinning ? 34 : 26,
        elevation: 14,
      }}
    >
      <View
        style={{
          borderColor: "rgba(196,160,255,0.9)",
          borderRadius: 24,
          borderWidth: 2,
          height: 220,
          overflow: "hidden",
          width: 160,
        }}
      >
        <LinearGradient
          colors={gradients.card}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{ flex: 1 }}
        >
          <View className="flex-1 items-center justify-center">
            <LinearGradient
              colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
              end={{ x: 0.5, y: 0.7 }}
              locations={[0, 0.6]}
              pointerEvents="none"
              start={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: fonts.extrabold,
                fontSize: 52,
                letterSpacing: 0.5,
                textShadowColor: "rgba(0,0,0,0.25)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
              }}
            >
              {label}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
