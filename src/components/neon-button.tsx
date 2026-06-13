import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { gradients, neon } from "@/theme/colors";

export type NeonVariant = "violet" | "pink" | "ghost";

type NeonButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: NeonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const glowByVariant: Record<Exclude<NeonVariant, "ghost">, string> = {
  violet: neon.purple,
  pink: neon.magenta,
};

export function NeonButton({
  label,
  onPress,
  variant = "violet",
  icon,
  iconRight,
  disabled = false,
  className,
  style,
  accessibilityLabel,
}: NeonButtonProps) {
  const isGhost = variant === "ghost";
  const tint = isGhost ? neon.white : "#FFFFFF";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      className={className}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: 16,
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        !isGhost && !disabled
          ? {
              shadowColor: glowByVariant[variant],
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.55,
              shadowRadius: 18,
              elevation: 10,
            }
          : null,
        style,
      ]}
    >
      <ButtonSurface isGhost={isGhost} variant={variant}>
        <View className="h-14 flex-row items-center justify-center gap-2 px-5">
          {icon ? <Ionicons color={tint} name={icon} size={20} /> : null}
          <Text
            style={{ color: tint }}
            className="text-base font-extrabold uppercase tracking-wide"
          >
            {label}
          </Text>
          {iconRight ? <Ionicons color={tint} name={iconRight} size={20} /> : null}
        </View>
      </ButtonSurface>
    </Pressable>
  );
}

function ButtonSurface({
  children,
  isGhost,
  variant,
}: {
  children: ReactNode;
  isGhost: boolean;
  variant: NeonVariant;
}) {
  if (isGhost) {
    return (
      <View
        style={{
          borderColor: "rgba(168,85,247,0.45)",
          borderRadius: 16,
          borderWidth: 1.5,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    );
  }

  const colors = variant === "pink" ? gradients.pink : gradients.violet;

  return (
    <View style={{ borderRadius: 16, overflow: "hidden" }}>
      <LinearGradient colors={colors} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }}>
        <LinearGradient
          colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0)"]}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.55]}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </LinearGradient>
    </View>
  );
}
