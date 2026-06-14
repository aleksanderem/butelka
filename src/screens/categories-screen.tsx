import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

import { CategoryCard } from "@/components/category-card";
import { MAIN_CATEGORIES, type MainCategory } from "@/game/main-categories";
import type { GameApi } from "@/game/use-game";
import { CategoryDetailSheet } from "@/screens/category-detail-sheet";
import { neon } from "@/theme/colors";

const H_PADDING = 20;
const GAP = 12;

/** Pełnoekranowa zakładka „Kategorie": grid 2-kolumnowy kart + podgląd treści po dotknięciu. */
export function CategoriesScreen({ game }: { game: GameApi }) {
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState<MainCategory | null>(null);

  const cardW = Math.floor((width - H_PADDING * 2 - GAP) / 2);
  const cardH = Math.round(cardW * 1.34);

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
        <View className="flex-row flex-wrap" style={{ gap: GAP }}>
          {MAIN_CATEGORIES.map((category) => (
            <CategoryCard
              category={category}
              height={cardH}
              key={category.key}
              onPress={() => setDetail(category)}
              width={cardW}
            />
          ))}
        </View>
      </ScrollView>

      <CategoryDetailSheet
        ageVerified={game.ageVerified}
        bundle={game.contentBundle}
        category={detail}
        key={detail?.key ?? "none"}
        onClose={() => setDetail(null)}
        onVerifyAge={game.verifyAge}
      />
    </View>
  );
}
