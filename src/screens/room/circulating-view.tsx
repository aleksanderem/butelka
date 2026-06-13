import { Text, View } from "react-native";

import { GameCard } from "@/components/game-card";
import { HowItWorks } from "@/components/how-it-works";
import { NeonButton } from "@/components/neon-button";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

function cardLabelFor(name: string | null, isSelf: boolean | undefined): string {
  if (isSelf || !name) {
    return "Ty";
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export function CirculatingView({ game }: { game: GameApi }) {
  const spinning = game.phase === "spinning";
  const label = cardLabelFor(game.activePlayer?.name ?? null, game.activePlayer?.isSelf);

  return (
    <View className="gap-6">
      <View className="items-center gap-5 pt-2">
        <GameCard label={label} spinning={spinning} />
        <View className="items-center gap-1">
          <Text className="text-xl font-black text-foreground">
            {spinning ? "Karta krąży wśród graczy..." : "Gotowi na rundę?"}
          </Text>
          <Text className="text-sm" style={{ color: neon.textMuted }}>
            {spinning ? "Czekaj na swoją kolej!" : "Wylosuj, kogo wskaże los"}
          </Text>
        </View>
      </View>

      {game.phase === "lobby" ? (
        <View className="gap-3">
          <NeonButton
            disabled={!game.canSpin}
            icon="sparkles"
            label="Losuj szczęśliwca"
            onPress={game.spin}
            variant="violet"
          />
          <NeonButton
            icon="person-add-outline"
            label="Dodaj gracza testowego"
            onPress={game.addDemoPlayer}
            variant="ghost"
          />
        </View>
      ) : null}

      <HowItWorks />
    </View>
  );
}
