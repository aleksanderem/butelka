import { Ionicons } from "@expo/vector-icons";
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
  const isLobby = game.phase === "lobby";
  const label = cardLabelFor(game.activePlayer?.name ?? null, game.activePlayer?.isSelf);
  const enoughPlayers = game.players.length >= 2;

  return (
    <View className="gap-7">
      <View className="items-center gap-5 pt-2">
        <GameCard label={label} spinning={spinning} />
        <View className="items-center gap-1.5">
          <Text className="text-2xl font-extrabold text-foreground">
            {spinning ? "Karta krąży…" : "Gotowi na rundę?"}
          </Text>
          <Text className="text-center text-sm font-medium" style={{ color: neon.textMuted }}>
            {spinning
              ? "Czekajcie, na kogo wskaże los"
              : game.amHost
                ? "Wylosuj, kto zostanie szczęśliwcem"
                : "Host za chwilę rozpocznie rundę"}
          </Text>
        </View>
      </View>

      {isLobby && game.amHost ? (
        <View className="gap-3">
          <NeonButton
            disabled={!game.canSpin}
            icon="sparkles"
            label="Losuj szczęśliwca"
            onPress={game.spin}
            variant="violet"
          />
          {!enoughPlayers ? (
            <Text className="text-center text-xs text-muted">
              Potrzeba co najmniej 2 graczy, aby zacząć.
            </Text>
          ) : null}
          <NeonButton
            icon="person-add-outline"
            label="Dodaj gracza testowego"
            onPress={game.addDemoPlayer}
            variant="ghost"
          />
        </View>
      ) : isLobby ? (
        <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
          <Ionicons color={neon.textMuted} name="hourglass-outline" size={18} />
          <Text className="text-sm font-medium text-muted">
            Czekajcie, aż host rozpocznie rundę
          </Text>
        </View>
      ) : null}

      <HowItWorks />
    </View>
  );
}
