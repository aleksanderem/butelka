import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CATEGORY_IMAGES } from "@/game/category-images";
import { ageBadge, mainName, mainTagline, type MainCategory } from "@/game/main-categories";
import { neon } from "@/theme/colors";

/** Kwadratowa karta głównej kategorii: obraz higgsfield + nazwa + podgląd podkategorii.
 *  Wyodrębniona od reszty kolorowym glow akcentu i obwódką. */
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
  const shown = subNames.slice(0, 5);
  const extra = subNames.length - shown.length;

  return (
    <View
      style={{
        backgroundColor: neon.surface,
        borderRadius: 26,
        elevation: 14,
        shadowColor: category.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 26,
      }}
    >
      <Pressable
        accessibilityLabel={`Kategoria ${mainName(category)}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          borderColor: `${category.accent}73`,
          borderRadius: 26,
          borderWidth: 1.5,
          height: size,
          overflow: "hidden",
          transform: [{ scale: pressed ? 0.985 : 1 }],
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

        {/* Przyciemnienie u dołu pod tekst (większa strefa pod nazwę + chipy). */}
        <LinearGradient
          colors={["transparent", "rgba(5,3,12,0.2)", "rgba(5,3,12,0.96)"]}
          locations={[0, 0.4, 0.82]}
          style={StyleSheet.absoluteFill}
        />

        <View
          className="absolute right-3 top-3 rounded-full px-2.5 py-1"
          style={{ backgroundColor: "rgba(5,3,12,0.55)" }}
        >
          <Text className="text-[11px] font-bold" style={{ color: category.accent }}>
            {ageBadge(category.ageGate)}
          </Text>
        </View>

        {category.premium ? (
          <View
            className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full px-2.5 py-1"
            style={{
              backgroundColor: "rgba(244,63,94,0.18)",
              borderColor: `${neon.magenta}80`,
              borderWidth: 1,
            }}
          >
            <Ionicons color={neon.magenta} name="flame" size={11} />
            <Text className="text-[11px] font-extrabold" style={{ color: neon.magenta }}>
              HOT
            </Text>
          </View>
        ) : null}

        <View className="absolute inset-x-0 bottom-0 gap-2.5 p-4">
          <View className="flex-row items-center gap-1">
            <Text className="flex-1 text-xl font-extrabold text-white" numberOfLines={1}>
              {mainName(category)}
            </Text>
            <Ionicons color="rgba(255,255,255,0.8)" name="chevron-forward" size={18} />
          </View>

          {shown.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5">
              {shown.map((name) => (
                <View
                  className="rounded-full px-2.5 py-1"
                  key={name}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderColor: "rgba(255,255,255,0.2)",
                    borderWidth: 1,
                  }}
                >
                  <Text className="text-[11px] font-semibold text-white" numberOfLines={1}>
                    {name}
                  </Text>
                </View>
              ))}
              {extra > 0 ? (
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: `${category.accent}33`,
                    borderColor: `${category.accent}80`,
                    borderWidth: 1,
                  }}
                >
                  <Text className="text-[11px] font-bold" style={{ color: "#FFFFFF" }}>
                    +{extra}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text className="text-xs leading-4 text-white/75" numberOfLines={1}>
              {mainTagline(category)}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
