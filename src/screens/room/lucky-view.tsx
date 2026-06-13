import { Text, View } from "react-native";

import { Confetti } from "@/components/confetti";
import { Crown } from "@/components/crown";
import { NeonButton } from "@/components/neon-button";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

export function LuckyView({ game }: { game: GameApi }) {
  const name = game.luckyPlayer?.isSelf ? "Ciebie" : (game.luckyPlayer?.name ?? "");

  return (
    <View className="items-center gap-6 pt-2">
      <View className="items-center justify-center" style={{ width: 280 }}>
        <Confetti />
        <Crown size={120} />
      </View>

      <View className="items-center gap-1">
        <Text
          style={{
            color: neon.gold,
            fontSize: 28,
            fontWeight: "900",
            textShadowColor: "rgba(251,191,36,0.7)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 16,
          }}
        >
          Szczęśliwiec!
        </Text>
        <Text className="text-lg font-bold text-foreground">To {name}!</Text>
      </View>

      <Text className="text-sm font-medium text-muted">Wybierz, co chcesz:</Text>

      <View className="w-full gap-3">
        <NeonButton
          icon="help"
          label="Prawda"
          onPress={() => game.pickChallenge("prawda")}
          variant="violet"
        />
        <NeonButton
          icon="flash"
          label="Wyzwanie"
          onPress={() => game.pickChallenge("wyzwanie")}
          variant="pink"
        />
        <NeonButton icon="dice-outline" label="Wylosuj inne" onPress={game.rerollLucky} variant="ghost" />
      </View>
    </View>
  );
}
