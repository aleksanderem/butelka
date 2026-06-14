import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CATEGORY_IMAGES } from "@/game/category-images";
import { ageBadge, type MainCategory } from "@/game/main-categories";
import { neon } from "@/theme/colors";

/** Pionowa karta głównej kategorii na stronie głównej (obraz higgsfield + nazwa + tagline). */
export function CategoryCard({
  category,
  width,
  height,
  onPress,
}: {
  category: MainCategory;
  width: number;
  height: number;
  onPress: () => void;
}) {
  const image: ImageSourcePropType | undefined = CATEGORY_IMAGES[category.key];

  return (
    <Pressable
      accessibilityLabel={`Kategoria ${category.namePl}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        width,
        height,
        borderRadius: 22,
        overflow: "hidden",
        transform: [{ scale: pressed ? 0.98 : 1 }],
        backgroundColor: neon.surface,
      })}
    >
      {image ? (
        <Image resizeMode="cover" source={image} style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient
          colors={category.gradient}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Przyciemnienie u dołu pod tekst. */}
      <LinearGradient
        colors={["transparent", "rgba(5,3,12,0.05)", "rgba(5,3,12,0.92)"]}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5"
        style={{ backgroundColor: "rgba(5,3,12,0.5)" }}
      >
        <Text className="text-[10px] font-bold" style={{ color: category.accent }}>
          {ageBadge(category.ageGate)}
        </Text>
      </View>

      <View className="absolute inset-x-0 bottom-0 gap-0.5 p-3">
        <Text className="text-base font-extrabold text-white" numberOfLines={1}>
          {category.namePl}
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="flex-1 text-[11px] leading-4 text-white/75" numberOfLines={2}>
            {category.tagline}
          </Text>
          <Ionicons color="rgba(255,255,255,0.7)" name="chevron-forward" size={14} />
        </View>
      </View>
    </Pressable>
  );
}
