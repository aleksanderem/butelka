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

  // Wejscie karty szczesliwca: pop (fade + scale). Odpalane na mount — RoomScreen remontuje
  // ten widok kluczem dopiero po zakonczeniu klipu losowania, wiec pop pokrywa sie z odsloniem.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(enter, {
      friction: 6,
      tension: 60,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
      }}
    >
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
    </Animated.View>
  );
}
