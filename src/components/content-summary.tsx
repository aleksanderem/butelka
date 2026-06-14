import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { LEVEL_LABELS, type ContentLevel } from "@/game/content-selection";
import { MAIN_CATEGORIES } from "@/game/main-categories";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

/** Sekcja w lobby: jakie kategorie treści są aktywne w pokoju (host może zmienić). */
export function ContentSummary({ game }: { game: GameApi }) {
  const selection = game.contentSelection;
  const active = MAIN_CATEGORIES.filter((cat) => (selection[cat.key] ?? 0) > 0);

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons color={neon.purpleBright} name="sparkles" size={16} />
          <Text className="text-sm font-bold text-foreground">Treści w grze</Text>
        </View>
        {game.amHost ? (
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-1"
            hitSlop={8}
            onPress={() => game.setSettingsOpen(true)}
          >
            <Text className="text-xs font-semibold" style={{ color: neon.purpleBright }}>
              Zmień
            </Text>
            <Ionicons color={neon.purpleBright} name="chevron-forward" size={13} />
          </Pressable>
        ) : null}
      </View>

      {active.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {active.map((cat) => {
            const level = (selection[cat.key] ?? 0) as ContentLevel;
            return (
              <View
                className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                key={cat.key}
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.accent }}
                />
                <Text className="text-xs font-semibold text-foreground">{cat.namePl}</Text>
                <Text className="text-[10px] text-muted">· {LEVEL_LABELS[level]}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="text-xs text-muted">
          {game.amHost
            ? "Brak aktywnych kategorii — wybierz w Ustawienia → Treści."
            : "Host nie wybrał jeszcze kategorii treści."}
        </Text>
      )}
    </View>
  );
}
