import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dialog, Spinner } from "heroui-native";
import { Pressable, Text, View } from "react-native";

import { AvatarVisual } from "@/components/player-avatar";
import { NeonButton } from "@/components/neon-button";
import type { ApprovalAction, Player } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { t } from "@/game/ui-strings";
import { gradients, neon } from "@/theme/colors";

// Funkcja (nie stała): t() przy renderze, inaczej zamraża język z czasu importu.
const copy = (): Record<
  ApprovalAction,
  { title: string; verb: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  endTurn: {
    title: t("approvalModal.endTurnTitle"),
    verb: t("approvalModal.endTurnVerb"),
    icon: "checkmark-done",
  },
  nextTruth: {
    title: t("approvalModal.nextTruthTitle"),
    verb: t("approvalModal.nextTruthVerb"),
    icon: "help",
  },
  nextDare: {
    title: t("approvalModal.nextDareTitle"),
    verb: t("approvalModal.nextDareVerb"),
    icon: "flash",
  },
});

export function ApprovalModal({ game }: { game: GameApi }) {
  const action = game.pendingApproval;
  const info = action ? copy()[action] : null;
  const initiator = game.luckyPlayer?.isSelf
    ? t("approvalModal.selfLabel")
    : (game.luckyPlayer?.name ?? t("approvalModal.playerFallback"));

  // Realne głosy z backendu: każdy gracz głosuje na swoim urządzeniu.
  const total = game.approval?.total ?? game.players.length;
  const approved = game.approval?.approved ?? 0;
  const needed = game.approval?.needed ?? Math.floor(total / 2) + 1;
  const rejected = game.approval?.rejected ?? 0;
  const ratio = needed > 0 ? Math.min(1, approved / needed) : 1;
  const myVote = game.approval?.myVote ?? null;

  // Wynik przesądzony: większość „za" (akceptacja) albo większość już niemożliwa (odrzucenie).
  // Pokazujemy loader i czekamy, aż host wykona akcję i dialog sam zniknie.
  const accepted = approved >= needed;
  const declined = total - rejected < needed;
  const resolving = accepted || declined;

  return (
    <Dialog
      isOpen={action !== null}
      onOpenChange={(open) => {
        // Zamknięcie (tap w tło / wstecz) anuluje głosowanie — dialog zawsze da się zamknąć.
        if (!open) {
          game.cancelApproval();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="items-center gap-4">
          <Dialog.Close variant="tertiary" />
          <View
            style={{
              alignItems: "center",
              backgroundColor: "rgba(139,92,246,0.18)",
              borderRadius: 28,
              height: 56,
              justifyContent: "center",
              width: 56,
            }}
          >
            <Ionicons color={neon.purpleBright} name={info?.icon ?? "help"} size={26} />
          </View>

          <View className="items-center gap-1">
            <Dialog.Title>{info?.title ?? ""}</Dialog.Title>
            <Text className="text-center text-sm text-muted">
              {t("approvalModal.actionPrompt")
                .replace("{initiator}", initiator)
                .replace("{verb}", info?.verb ?? "")}
            </Text>
          </View>

          <View className="flex-row flex-wrap items-start justify-center gap-3 py-1">
            {game.players.map((player) => (
              <VoteAvatar
                key={player.id}
                player={player}
                voted={!!player.approved}
                onSwitch={() => game.setActingAs(player.clientId ?? null)}
              />
            ))}
          </View>

          <View className="w-full gap-1.5">
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                height: 8,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={gradients.progress}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={{ height: 8, width: `${Math.round(ratio * 100)}%` }}
              />
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted">{t("approvalModal.approvalsLabel")}</Text>
              <Text className="text-xs font-bold text-foreground">
                {approved} / {needed}
              </Text>
            </View>
          </View>

          {resolving ? (
            <View className="w-full items-center gap-2 py-1">
              <Spinner color={neon.purpleBright} size="sm" />
              <Text className="text-center text-sm font-semibold text-foreground">
                {accepted ? t("approvalModal.accepted") : t("approvalModal.declined")}
              </Text>
            </View>
          ) : (
            <>
              <View className="w-full flex-row gap-3">
                <NeonButton
                  className="flex-1"
                  disabled={myVote !== null}
                  label={t("approvalModal.rejectButton")}
                  onPress={game.rejectApproval}
                  variant="ghost"
                />
                <NeonButton
                  className="flex-1"
                  disabled={myVote !== null}
                  label={t("approvalModal.acceptButton")}
                  onPress={game.confirmApproval}
                  variant="violet"
                />
              </View>
              <Text className="text-center text-[11px] text-muted">
                {myVote !== null
                  ? t("approvalModal.voteCast")
                  : t("approvalModal.votesRequired")
                      .replace("{needed}", String(needed))
                      .replace("{total}", String(total))}
              </Text>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

function VoteAvatar({
  player,
  voted,
  onSwitch,
}: {
  player: Player;
  voted: boolean;
  onSwitch: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={t("approvalModal.voteAsLabel").replace("{name}", player.name)}
      accessibilityRole="button"
      className="items-center gap-1"
      onPress={onSwitch}
    >
      <View>
        <AvatarVisual
          active={player.isSelf}
          avatarId={player.avatarId}
          colorId={player.colorId}
          dimmed={!voted && !player.isSelf}
          size="sm"
        />
        <View
          style={{
            alignItems: "center",
            backgroundColor: voted ? neon.green : "rgba(120,113,140,0.9)",
            borderColor: neon.surface,
            borderRadius: 10,
            borderWidth: 2,
            bottom: -2,
            height: 20,
            justifyContent: "center",
            position: "absolute",
            right: -2,
            width: 20,
          }}
        >
          <Ionicons color="#FFFFFF" name={voted ? "checkmark" : "ellipsis-horizontal"} size={12} />
        </View>
      </View>
      <Text
        numberOfLines={1}
        className="max-w-14 text-center text-[11px]"
        style={{ color: player.isSelf ? neon.white : neon.textMuted }}
      >
        {player.isSelf ? t("approvalModal.selfLabel") : player.name}
      </Text>
    </Pressable>
  );
}
