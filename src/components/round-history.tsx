import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { NeonCard } from "@/components/neon-card";
import { t } from "@/game/ui-strings";
import { AvatarVisual } from "@/components/player-avatar";
import { avatarSources } from "@/game/avatars";
import type { RoundHistoryEntry } from "@/game/round-history";
import type { AvatarId } from "@/game/types";
import { neon, playerPalette, type PlayerColorId } from "@/theme/colors";

/** Wpis ma poprawny avatar tylko wtedy, gdy zna i maskotkę, i kolor (starsze/uszkodzone wpisy nie). */
function hasAvatar(entry: RoundHistoryEntry): boolean {
  return entry.avatarId in avatarSources && entry.colorId in playerPalette;
}

/** Przebieg gry: log zakończonych tur (najnowsze u góry). Zastępuje statyczne „Jak to działa?". */
export function RoundHistory({ history }: { history: RoundHistoryEntry[] }) {
  return (
    <NeonCard className="gap-3">
      <View className="flex-row items-center justify-center gap-2">
        <Ionicons color={neon.textMuted} name="time-outline" size={16} />
        <Text className="text-center text-base font-bold text-foreground">
          {t("roundHistory.gameProgress")}
        </Text>
      </View>

      {history.length === 0 ? (
        <Text className="text-center text-xs leading-5 text-muted">
          {t("roundHistory.emptyState")}
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
                {hasAvatar(entry) ? (
                  <AvatarVisual
                    avatarId={entry.avatarId as AvatarId}
                    colorId={entry.colorId as PlayerColorId}
                    size="xs"
                  />
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: `${accent}22`,
                      borderRadius: 18,
                      height: 36,
                      justifyContent: "center",
                      width: 36,
                    }}
                  >
                    <Ionicons color={accent} name={isTruth ? "help" : "flash"} size={16} />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                    {entry.name || t("roundHistory.defaultPlayerName")}
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
                  {isTruth ? t("roundHistory.truth") : t("roundHistory.dare")}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </NeonCard>
  );
}
