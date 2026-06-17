import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { FlipCountdown } from "@/components/flip-countdown";
import { NeonButton } from "@/components/neon-button";
import { NeonCard } from "@/components/neon-card";
import { cleanCardText } from "@/game/content-selection";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

export function ChallengeView({ game }: { game: GameApi }) {
  const isTruth = game.challengeType === "prawda";
  const accent = isTruth ? neon.purpleBright : neon.magenta;
  const amLucky = game.amLucky;
  const luckyName = game.luckyPlayer?.name ?? "";
  // Czas na odpowiedź (prawda) / wykonanie (wyzwanie); 0 = licznik wyłączony.
  const countdown = isTruth ? game.settings.truthSeconds : game.settings.dareSeconds;

  // Przegrana: czas minął, a szczęśliwiec nie przeszedł dalej. Reset przy nowej karcie.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
  }, [game.challengeText]);

  return (
    <View className="gap-5 pt-2">
      <View className="flex-row items-center justify-center gap-2">
        <Ionicons color={accent} name={isTruth ? "help-circle" : "flash"} size={22} />
        <Text style={{ color: accent }} className="text-lg font-extrabold uppercase tracking-wider">
          {isTruth ? "Prawda" : "Wyzwanie"}
        </Text>
      </View>

      <NeonCard className="items-center gap-5" glow={isTruth ? "violet" : "pink"}>
        <Text className="text-center text-xl font-bold leading-8 text-foreground">
          {game.challengeText ? cleanCardText(game.challengeText) : null}
        </Text>
      </NeonCard>

      {countdown > 0 ? (
        <FlipCountdown
          onExpire={() => setTimedOut(true)}
          restartKey={game.challengeText ?? ""}
          seconds={countdown}
        />
      ) : null}

      {timedOut ? (
        <Text className="text-center text-base font-extrabold" style={{ color: neon.magenta }}>
          {amLucky ? "⏰ Czas minął — przegrałeś!" : `⏰ Czas minął — ${luckyName} przegrał!`}
        </Text>
      ) : (
        <Text className="text-center text-sm font-medium text-muted">
          {amLucky
            ? isTruth
              ? "Odpowiedz szczerze!"
              : "Ty nie dasz rady?"
            : isTruth
              ? `${luckyName} odpowiada — czekajcie na wynik.`
              : `${luckyName} ma wyzwanie — czekajcie na wynik.`}
        </Text>
      )}

      {amLucky ? (
        timedOut ? (
          <NeonButton
            icon="people"
            label="Następny gracz"
            onPress={game.passTurn}
            variant="pink"
          />
        ) : (
          <>
            <View className="flex-row gap-3">
              <NeonButton
                className="flex-1"
                icon="dice-outline"
                label="Wylosuj inne"
                onPress={game.nextChallenge}
                variant="ghost"
              />
              <NeonButton
                className="flex-1"
                icon="people"
                label="Następny gracz"
                onPress={game.passTurn}
                variant="violet"
              />
            </View>
            <Text className="text-center text-xs text-muted">
              „Następny gracz" przekazuje turę kolejnej osobie.
            </Text>
          </>
        )
      ) : null}
    </View>
  );
}
