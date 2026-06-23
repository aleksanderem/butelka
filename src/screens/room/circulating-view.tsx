import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { CardFan } from "@/components/card-fan";
import { ContentSummary } from "@/components/content-summary";
import { GameCard } from "@/components/game-card";
import { NeonButton } from "@/components/neon-button";
import { RoundHistory } from "@/components/round-history";
import { t } from "@/game/ui-strings";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

function cardLabelFor(name: string | null, isSelf: boolean | undefined): string {
  if (isSelf || !name) {
    return t("circulatingView.you");
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export function CirculatingView({ game }: { game: GameApi }) {
  const spinning = game.phase === "spinning";
  const isLobby = game.phase === "lobby";
  const label = cardLabelFor(game.activePlayer?.name ?? null, game.activePlayer?.isSelf);
  const enoughPlayers = game.players.length >= 2;
  const autoStart = game.settings.autoStart;

  return (
    <View className="gap-7">
      <View className="items-center gap-5 pt-2">
        {isLobby ? (
          <CardFan players={game.players} />
        ) : (
          <GameCard label={label} spinning={spinning} />
        )}
        <View className="items-center gap-1.5">
          <Text className="text-2xl font-extrabold text-foreground">
            {spinning ? t("circulatingView.cardSpinning") : t("circulatingView.readyForRound")}
          </Text>
          <Text className="text-center text-sm font-medium" style={{ color: neon.textMuted }}>
            {spinning
              ? t("circulatingView.waitForLuck")
              : autoStart
                ? t("circulatingView.roundStartsAuto")
                : game.amHost
                  ? t("circulatingView.pickLuckyOne")
                  : t("circulatingView.hostWillStart")}
          </Text>
        </View>
      </View>

      {isLobby && game.amHost ? (
        <View className="gap-3">
          {autoStart ? (
            <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
              <Ionicons color={neon.purpleBright} name="sparkles" size={18} />
              <Text className="text-sm font-medium text-foreground">
                {enoughPlayers
                  ? t("circulatingView.roundStartsAutoEllipsis")
                  : t("circulatingView.waitingForPlayers")}
              </Text>
            </View>
          ) : (
            <>
              <NeonButton
                disabled={!game.canSpin}
                icon="sparkles"
                label={t("circulatingView.spinButton")}
                onPress={game.spin}
                variant="violet"
              />
              {!enoughPlayers ? (
                <Text className="text-center text-xs text-muted">
                  {t("circulatingView.needMorePlayers")}
                </Text>
              ) : null}
            </>
          )}
          {game.singleDevice || game.testMode ? (
            <NeonButton
              icon="person-add-outline"
              label={
                game.singleDevice
                  ? t("circulatingView.addPlayer")
                  : t("circulatingView.addTestPlayer")
              }
              onPress={game.addDemoPlayer}
              variant="ghost"
            />
          ) : null}
        </View>
      ) : isLobby ? (
        <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 py-4">
          <Ionicons color={neon.textMuted} name="hourglass-outline" size={18} />
          <Text className="text-sm font-medium text-muted">
            {autoStart
              ? t("circulatingView.roundStartsAutoEllipsis")
              : t("circulatingView.waitForHost")}
          </Text>
        </View>
      ) : null}

      {isLobby ? <ContentSummary game={game} /> : null}

      <RoundHistory history={game.roundHistory} />
    </View>
  );
}
