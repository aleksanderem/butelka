import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { RoomHeader } from "@/components/room-header";
import type { GameApi } from "@/game/use-game";
import { ChallengeView } from "@/screens/room/challenge-view";
import { CirculatingView } from "@/screens/room/circulating-view";
import { LuckyView } from "@/screens/room/lucky-view";
import { PlayersSheet } from "@/screens/players-sheet";
import { neon } from "@/theme/colors";

export function RoomScreen({ game }: { game: GameApi }) {
  const highlightIndex =
    game.phase === "spinning"
      ? game.activeIndex
      : game.phase === "chosen" || game.phase === "task"
        ? game.luckyIndex
        : null;

  return (
    <View className="flex-1 gap-4 px-5 pt-4">
      <RoomHeader
        highlightIndex={highlightIndex}
        onBack={game.leaveRoom}
        onPlayers={() => game.setPlayersOpen(true)}
        onSettings={() => game.setSettingsOpen(true)}
        players={game.players}
        roomCode={game.roomCode}
      />

      {game.isImpersonating ? <ImpersonationBanner game={game} /> : null}

      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        {game.phase === "chosen" ? (
          <LuckyView game={game} />
        ) : game.phase === "task" ? (
          <ChallengeView game={game} />
        ) : (
          <CirculatingView game={game} />
        )}
      </ScrollView>

      <PlayersSheet game={game} />
    </View>
  );
}

function ImpersonationBanner({ game }: { game: GameApi }) {
  return (
    <View
      className="flex-row items-center gap-2 rounded-2xl px-3.5 py-2.5"
      style={{ backgroundColor: "rgba(251,191,36,0.14)", borderColor: "rgba(251,191,36,0.4)", borderWidth: 1 }}
    >
      <Ionicons color={neon.gold} name="eye" size={16} />
      <Text className="flex-1 text-sm font-semibold" style={{ color: neon.goldBright }}>
        Oglądasz jako {game.viewAsPlayer?.name ?? "gracz"}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-full px-3 py-1"
        onPress={() => game.setActingAs(null)}
        style={{ backgroundColor: "rgba(251,191,36,0.22)" }}
      >
        <Text className="text-xs font-bold" style={{ color: neon.goldBright }}>
          Wróć do siebie
        </Text>
      </Pressable>
    </View>
  );
}
