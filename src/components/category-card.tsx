import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CATEGORY_IMAGES } from "@/game/category-images";
import { ageBadge, type MainCategory } from "@/game/main-categories";
import { neon } from "@/theme/colors";

/** Kwadratowa karta głównej kategorii: obraz higgsfield + nazwa + podgląd podkategorii. */
export function CategoryCard({
  category,
  size,
  subNames,
  onPress,
}: {
  category: MainCategory;
  size: number;
  subNames: string[];
  onPress: () => void;
}) {
  const image: ImageSourcePropType | undefined = CATEGORY_IMAGES[category.key];
  const shown = subNames.slice(0, 3);
  const extra = subNames.length - shown.length;

  return (
    <Pressable
      accessibilityLabel={`Kategoria ${category.namePl}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: neon.surface,
        borderRadius: 24,
        height: size,
        overflow: "hidden",
        transform: [{ scale: pressed ? 0.98 : 1 }],
        width: size,
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
        colors={["transparent", "rgba(5,3,12,0.15)", "rgba(5,3,12,0.95)"]}
        locations={[0, 0.45, 1]}
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

      <View className="absolute inset-x-0 bottom-0 gap-2 p-3">
        <View className="flex-row items-center gap-1">
          <Text className="flex-1 text-lg font-extrabold text-white" numberOfLines={1}>
            {category.namePl}
          </Text>
          <Ionicons color="rgba(255,255,255,0.75)" name="chevron-forward" size={16} />
        </View>

        {shown.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {shown.map((name) => (
              <View
                className="rounded-full px-2 py-0.5"
                key={name}
                style={{
                  backgroundColor: "rgba(255,255,255,0.14)",
                  borderColor: "rgba(255,255,255,0.18)",
                  borderWidth: 1,
                }}
              >
                <Text className="text-[10px] font-semibold text-white/90" numberOfLines={1}>
                  {name}
                </Text>
              </View>
            ))}
            {extra > 0 ? (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: "rgba(5,3,12,0.45)" }}
              >
                <Text className="text-[10px] font-bold" style={{ color: category.accent }}>
                  +{extra}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text className="text-[11px] leading-4 text-white/70" numberOfLines={1}>
            {category.tagline}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
