import { Ionicons } from "@expo/vector-icons";
import { Dialog } from "heroui-native";
import { Pressable, ScrollView, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { AvatarVisual } from "@/components/player-avatar";
import type { Player } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

export function PlayersSheet({ game }: { game: GameApi }) {
  return (
    <Dialog isOpen={game.playersOpen} onOpenChange={game.setPlayersOpen}>
      <Dialog.Portal unstable_accessibilityContainerViewIsModal>
        <Dialog.Overlay />
        <Dialog.Content className="w-full max-w-xl gap-4 bg-surface">
          <View className="flex-row items-center justify-between">
            <Dialog.Title>Gracze ({game.players.length})</Dialog.Title>
            <Dialog.Close
              accessibilityLabel="Zamknij"
              className="h-9 w-9 rounded-full p-0"
              variant="tertiary"
            />
          </View>

          <Text className="text-xs leading-5 text-muted">
            Dotknij gracza, aby oglądać grę z jego perspektywy (test na jednym urządzeniu).
          </Text>

          <ScrollView
            className="max-h-80"
            contentContainerStyle={{ gap: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {game.players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                canKick={game.amHost && !player.isHost && !player.isSelf}
                onView={() => game.setActingAs(player.clientId ?? null)}
                onKick={() => player.clientId && game.kickPlayer(player.clientId)}
              />
            ))}
          </ScrollView>

          {game.amHost ? (
            <NeonButton
              icon="person-add-outline"
              label="Dodaj gracza testowego"
              onPress={game.addDemoPlayer}
              variant="ghost"
            />
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 rounded-2xl py-3.5"
            onPress={game.leaveRoom}
            style={{ borderColor: "rgba(244,63,94,0.5)", borderWidth: 1.5 }}
          >
            <Ionicons color={neon.magenta} name="exit-outline" size={18} />
            <Text className="text-base font-bold" style={{ color: neon.magenta }}>
              Opuść pokój
            </Text>
          </Pressable>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

function PlayerRow({
  player,
  canKick,
  onView,
  onKick,
}: {
  player: Player;
  canKick: boolean;
  onView: () => void;
  onKick: () => void;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-2xl px-3 py-2.5"
      style={{
        backgroundColor: player.isSelf ? "rgba(139,92,246,0.16)" : "rgba(255,255,255,0.04)",
      }}
    >
      <Pressable
        accessibilityLabel={`Pokaż widok: ${player.name}`}
        accessibilityRole="button"
        className="flex-1 flex-row items-center gap-3"
        onPress={onView}
      >
        <AvatarVisual avatarId={player.avatarId} colorId={player.colorId} size="sm" />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text numberOfLines={1} className="text-base font-bold text-foreground">
              {player.name}
            </Text>
            {player.isHost ? <Text style={{ fontSize: 13 }}>👑</Text> : null}
          </View>
          {player.isSelf ? (
            <View className="mt-0.5 flex-row items-center gap-1">
              <Ionicons color={neon.green} name="eye" size={13} />
              <Text className="text-xs font-semibold" style={{ color: neon.green }}>
                Oglądasz ten widok
              </Text>
            </View>
          ) : (
            <Text className="mt-0.5 text-xs text-muted">Dotknij, aby zobaczyć jego widok</Text>
          )}
        </View>
      </Pressable>

      {canKick ? (
        <Pressable
          accessibilityLabel={`Wyrzuć: ${player.name}`}
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full"
          hitSlop={6}
          onPress={onKick}
          style={{ backgroundColor: "rgba(244,63,94,0.12)" }}
        >
          <Ionicons color={neon.magenta} name="close" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}
