import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dialog } from "heroui-native";
import { Text, View } from "react-native";

import { AvatarVisual } from "@/components/player-avatar";
import { NeonButton } from "@/components/neon-button";
import type { ApprovalAction, Player } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { gradients, neon } from "@/theme/colors";

const copy: Record<
  ApprovalAction,
  { title: string; verb: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  endTurn: { title: "Zakończenie tury", verb: "zakończyć turę", icon: "checkmark-done" },
  nextTruth: { title: "Następne pytanie", verb: "wylosować następne pytanie", icon: "help" },
  nextDare: { title: "Następne wyzwanie", verb: "wylosować następne wyzwanie", icon: "flash" },
};

export function ApprovalModal({ game }: { game: GameApi }) {
  const action = game.pendingApproval;
  const info = action ? copy[action] : null;
  const initiator = game.luckyPlayer?.isSelf ? "Ty" : (game.luckyPlayer?.name ?? "Gracz");

  // Wizualizacja głosów: pozostali gracze już zaakceptowali (symulacja single-device),
  // lokalny gracz decyduje przyciskiem. Po podpięciu multiplayera to zastąpią realne głosy.
  const total = game.players.length;
  const approved = Math.max(0, total - 1);
  const needed = Math.floor(total / 2) + 1;
  const ratio = total > 0 ? approved / total : 0;

  return (
    <Dialog isOpen={action !== null} onOpenChange={(open) => !open && game.rejectApproval()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="items-center gap-4">
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
              {initiator} chce {info?.verb}. Czy się zgadzasz?
            </Text>
          </View>

          <View className="flex-row flex-wrap items-start justify-center gap-3 py-1">
            {game.players.map((player) => (
              <VoteAvatar key={player.id} player={player} voted={!player.isSelf} />
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
              <Text className="text-xs text-muted">Potrzeba większości do akceptacji</Text>
              <Text className="text-xs font-bold text-foreground">
                {approved} / {total}
              </Text>
            </View>
          </View>

          <View className="w-full flex-row gap-3">
            <NeonButton
              className="flex-1"
              label="Odrzuć"
              onPress={game.rejectApproval}
              variant="ghost"
            />
            <NeonButton
              className="flex-1"
              label="Akceptuj"
              onPress={game.confirmApproval}
              variant="violet"
            />
          </View>
          <Text className="text-[11px] text-muted">
            Wymagana zgoda {needed} z {total} graczy.
          </Text>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

function VoteAvatar({ player, voted }: { player: Player; voted: boolean }) {
  return (
    <View className="items-center gap-1">
      <View>
        <AvatarVisual
          avatarId={player.avatarId}
          colorId={player.colorId}
          dimmed={!voted}
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
      <Text numberOfLines={1} className="max-w-14 text-center text-[11px] text-muted">
        {player.isSelf ? "Ty" : player.name}
      </Text>
    </View>
  );
}
