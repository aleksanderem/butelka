import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { NeonCard } from "@/components/neon-card";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

export function ChallengeView({ game }: { game: GameApi }) {
  const isTruth = game.challengeType === "prawda";
  const accent = isTruth ? neon.purpleBright : neon.magenta;
  const name = game.luckyPlayer?.isSelf ? "Ty" : (game.luckyPlayer?.name ?? "");

  return (
    <View className="gap-5 pt-2">
      <View className="flex-row items-center justify-center gap-2">
        <Ionicons color={accent} name={isTruth ? "help-circle" : "flash"} size={22} />
        <Text style={{ color: accent }} className="text-lg font-black uppercase tracking-wide">
          {isTruth ? "Prawda" : "Wyzwanie"}
        </Text>
      </View>

      <NeonCard className="items-center gap-4" glow={isTruth ? "violet" : "pink"}>
        <Text className="text-center text-xl font-bold leading-7 text-foreground">
          {game.challengeText}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-2 rounded-full border border-border px-4 py-2"
          onPress={game.rerollChallenge}
        >
          <Ionicons color={neon.textMuted} name="dice-outline" size={16} />
          <Text className="text-sm font-semibold text-muted">Wylosuj inne</Text>
        </Pressable>
      </NeonCard>

      <Text className="text-center text-sm text-muted">
        {name === "Ty" ? "Odpowiedz szczerze!" : `${name}, odpowiedz szczerze!`}
      </Text>

      <View className="flex-row gap-3">
        <NeonButton
          className="flex-1"
          iconRight="arrow-forward"
          label="Następne"
          onPress={game.nextChallenge}
          variant="ghost"
        />
        <NeonButton
          className="flex-1"
          icon="people"
          label="Podaj dalej"
          onPress={game.passTurn}
          variant="violet"
        />
      </View>

      <Text className="text-center text-xs text-muted">
        Po podaniu dalej tura przechodzi na kolejnego gracza.
      </Text>
    </View>
  );
}
