import { Spinner } from "heroui-native";
import { Text, View } from "react-native";

import { Confetti } from "@/components/confetti";
import { Crown } from "@/components/crown";
import { NeonButton } from "@/components/neon-button";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

export function LuckyView({ game }: { game: GameApi }) {
  const amLucky = game.amLucky;
  const luckyName = game.luckyPlayer?.name ?? "";

  return (
    <View className="items-center gap-7 pt-4">
      <View className="items-center justify-center" style={{ width: 280 }}>
        <Confetti />
        <Crown size={124} />
      </View>

      <View className="items-center gap-1.5">
        <Text
          style={{
            color: neon.gold,
            fontFamily: fonts.extrabold,
            fontSize: 30,
            letterSpacing: 0.5,
            textShadowColor: "rgba(251,191,36,0.7)",
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 18,
          }}
        >
          Szczęśliwiec!
        </Text>
        <Text className="text-lg font-bold text-foreground">
          {amLucky ? "To Ty!" : `To ${luckyName}!`}
        </Text>
      </View>

      {amLucky ? (
        <View className="w-full gap-3">
          <Text className="text-center text-sm font-medium text-muted">Wybierz, co chcesz:</Text>
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
          <NeonButton
            icon="dice-outline"
            label="Wylosuj inne"
            onPress={game.rerollLucky}
            variant="ghost"
          />
        </View>
      ) : (
        <View className="items-center gap-3 rounded-3xl border border-border bg-surface px-6 py-7">
          <Spinner color="default" size="sm" />
          <Text className="text-center text-base font-semibold text-foreground">
            {luckyName} wybiera prawdę albo wyzwanie…
          </Text>
          <Text className="text-center text-sm text-muted">
            Za chwilę zobaczysz, co go czeka.
          </Text>
        </View>
      )}
    </View>
  );
}
