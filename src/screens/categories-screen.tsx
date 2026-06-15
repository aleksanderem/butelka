import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

import { CategoryCard } from "@/components/category-card";
import { MAIN_CATEGORIES, type MainCategory } from "@/game/main-categories";
import type { GameApi } from "@/game/use-game";
import { CategoryDetailScreen } from "@/screens/category-detail-screen";
import { neon } from "@/theme/colors";

const H_PADDING = 20;
const GAP = 12;

/** Zakładka „Kategorie": grid 2-kolumnowy; dotknięcie -> osobny pełnoekranowy widok szczegółów. */
export function CategoriesScreen({ game }: { game: GameApi }) {
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState<MainCategory | null>(null);

  if (detail) {
    return <CategoryDetailScreen category={detail} game={game} onBack={() => setDetail(null)} />;
  }

  const cardSize = Math.round(width - H_PADDING * 2);
  const bundle = game.contentBundle;
  // Obcinamy prefiks trybu z nazwy podkategorii ("Teen — Kreatywne absurdy" -> "Kreatywne absurdy"),
  // bo karta i tak pokazuje nazwę kategorii — chip ma być krótki.
  const subNamesFor = (key: MainCategory["key"]): string[] =>
    bundle
      ? bundle.categories
          .filter((c) => c.modeGroup === key && c.enabled)
          .map((c) => c.namePl.split("—").pop()?.trim() ?? c.namePl)
      : [];

  return (
    <View className="flex-1 px-5 pt-4">
      <View className="flex-row items-center gap-3 pb-3">
        <Pressable
          accessibilityLabel="Wróć"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => game.setCategoriesOpen(false)}
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons color={neon.white} name="arrow-back" size={22} />
        </Pressable>
        <View>
          <Text className="text-xl font-extrabold text-foreground">Kategorie</Text>
          <Text className="text-xs text-muted">Dotknij, by podejrzeć karty</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: GAP }}>
          {MAIN_CATEGORIES.map((category) => (
            <CategoryCard
              category={category}
              key={category.key}
              onPress={() => setDetail(category)}
              size={cardSize}
              subNames={subNamesFor(category.key)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
