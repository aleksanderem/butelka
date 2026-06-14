import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CATEGORY_IMAGES } from "@/game/category-images";
import type { ContentBundle } from "@/game/content-types";
import { ageBadge, type MainCategory } from "@/game/main-categories";
import { neon } from "@/theme/colors";

/** Pełnoekranowy arkusz szczegółów głównej kategorii: obraz na całość + frosted-glass panel z treścią. */
export function CategoryDetailSheet({
  category,
  bundle,
  onClose,
}: {
  category: MainCategory | null;
  bundle: ContentBundle | null;
  onClose: () => void;
}) {
  if (!category) {
    return null;
  }

  const image: ImageSourcePropType | undefined = CATEGORY_IMAGES[category.key];
  const subs = bundle ? bundle.categories.filter((c) => c.modeKey === category.key) : [];
  const cardCount = bundle ? bundle.cards.filter((c) => c.modeKey === category.key).length : null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 60, backgroundColor: "rgba(4,2,10,0.6)" }]}>
      <Pressable accessibilityLabel="Zamknij" onPress={onClose} style={StyleSheet.absoluteFill} />

      <View
        className="mt-auto overflow-hidden rounded-t-3xl"
        style={{ maxHeight: "88%", backgroundColor: neon.bg }}
      >
        {/* Obraz na całe tło arkusza. */}
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

        {/* Nagłówek: czysty obraz z tytułem na dole (scrim pod tekstem). */}
        <View style={{ height: 190 }}>
          <LinearGradient
            colors={["rgba(5,3,12,0.45)", "transparent"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70 }}
          />
          <LinearGradient
            colors={["transparent", "rgba(5,3,12,0.75)"]}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90 }}
          />
          <Pressable
            accessibilityLabel="Zamknij"
            accessibilityRole="button"
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full"
            hitSlop={8}
            onPress={onClose}
            style={{ backgroundColor: "rgba(5,3,12,0.55)" }}
          >
            <Ionicons color={neon.white} name="close" size={20} />
          </Pressable>
          <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-2 p-4">
            <Text className="text-2xl font-extrabold text-white">{category.namePl}</Text>
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: "rgba(5,3,12,0.6)" }}
            >
              <Text className="text-[11px] font-bold" style={{ color: category.accent }}>
                {ageBadge(category.ageGate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Panel treści — frosted glass (rozmycie obrazu pod spodem) + scrim dla czytelności. */}
        <View className="overflow-hidden rounded-t-3xl">
          <BlurView
            intensity={60}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(9,6,17,0.8)" }]}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", borderRadius: 24 },
            ]}
          />

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 18 }}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 380 }}
          >
            <Text className="text-sm leading-6 text-foreground">{category.descriptionPl}</Text>

            <View className="gap-2.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-foreground">
                  Podkategorie ({subs.length})
                </Text>
                {cardCount !== null ? (
                  <Text className="text-xs font-semibold" style={{ color: category.accent }}>
                    {cardCount} kart
                  </Text>
                ) : null}
              </View>
              {subs.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {subs.map((sub) => (
                    <View
                      className="rounded-full px-3 py-1.5"
                      key={sub.categoryKey}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.08)",
                        borderColor: "rgba(255,255,255,0.08)",
                        borderWidth: 1,
                      }}
                    >
                      <Text className="text-xs text-foreground">{sub.namePl}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-muted">Ładuję podkategorie…</Text>
              )}
            </View>

            <View
              className="flex-row items-center gap-2 rounded-2xl px-3.5 py-3"
              style={{ backgroundColor: "rgba(139,92,246,0.16)" }}
            >
              <Ionicons color={neon.purpleBright} name="bulb-outline" size={18} />
              <Text className="flex-1 text-xs leading-5 text-foreground">
                Które kategorie są aktywne w grze ustawisz w pokoju → Ustawienia → Treści.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
