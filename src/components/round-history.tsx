import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { NeonCard } from "@/components/neon-card";
import type { RoundHistoryEntry } from "@/game/round-history";
import { neon } from "@/theme/colors";

/** Przebieg gry: log zakończonych tur (najnowsze u góry). Zastępuje statyczne „Jak to działa?". */
export function RoundHistory({ history }: { history: RoundHistoryEntry[] }) {
  return (
    <NeonCard className="gap-3">
      <View className="flex-row items-center justify-center gap-2">
        <Ionicons color={neon.textMuted} name="time-outline" size={16} />
        <Text className="text-center text-base font-bold text-foreground">Przebieg gry</Text>
      </View>

      {history.length === 0 ? (
        <Text className="text-center text-xs leading-5 text-muted">
          Jeszcze nikt nie zagrał rundy — kolejne tury pojawią się tutaj.
        </Text>
      ) : (
        <View className="gap-2">
          {[...history].reverse().map((entry, index) => {
            const isTruth = entry.type === "prawda";
            const accent = isTruth ? neon.purpleBright : neon.magenta;
            return (
              <View
                className="flex-row items-center gap-3 rounded-2xl px-3 py-2.5"
                key={`${entry.at}-${index}`}
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: `${accent}22`,
                    borderRadius: 16,
                    height: 32,
                    justifyContent: "center",
                    width: 32,
                  }}
                >
                  <Ionicons color={accent} name={isTruth ? "help" : "flash"} size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                    {entry.name || "Gracz"}
                  </Text>
                  {entry.text ? (
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {entry.text}
                    </Text>
                  ) : null}
                </View>
                <Text
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: accent }}
                >
                  {isTruth ? "Prawda" : "Wyzwanie"}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </NeonCard>
  );
}
