import { Spinner } from "heroui-native";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { Confetti } from "@/components/confetti";
import { GameCard } from "@/components/game-card";
import { NeonButton } from "@/components/neon-button";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

export function LuckyView({ game }: { game: GameApi }) {
  const amLucky = game.amLucky;
  const lucky = game.luckyPlayer;
  const luckyName = lucky?.name ?? "";
  // Tryb „1 telefon”: host trzyma telefon i klika wybór za wylosowanego (nawet gdy to nie on).
  const controls = amLucky || (game.singleDevice && game.amHost);

  // Wejscie: samo fade-in. Karta wyrosla juz w klipie losowania (DrawClip), wiec tu plynnie
  // przejmujemy ten sam widok karty (cross-fade), bez ponownego „popu”.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { duration: 280, toValue: 1, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Animated.View style={{ opacity: enter }}>
      <View className="items-center gap-7 pt-4">
        <View className="items-center justify-center" style={{ height: 268, width: 280 }}>
          <Confetti />
          <View style={{ transform: [{ scale: 1.12 }] }}>
            <GameCard
              animate
              avatarId={lucky?.avatarId}
              colorId={lucky?.colorId}
              label={amLucky ? "Ty" : luckyName}
            />
          </View>
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

        {controls ? (
          <View className="w-full gap-3">
            <Text className="text-center text-sm font-medium text-muted">
              {amLucky ? "Wybierz, co chcesz:" : `Wybierz za ${luckyName}:`}
            </Text>
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
    </Animated.View>
  );
}
