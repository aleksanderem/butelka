import { ScrollView, View } from "react-native";

import { RoomHeader } from "@/components/room-header";
import type { GameApi } from "@/game/use-game";
import { ChallengeView } from "@/screens/room/challenge-view";
import { CirculatingView } from "@/screens/room/circulating-view";
import { LuckyView } from "@/screens/room/lucky-view";

export function RoomScreen({ game }: { game: GameApi }) {
  const highlightIndex =
    game.phase === "spinning"
      ? game.activeIndex
      : game.phase === "chosen" || game.phase === "task"
        ? game.luckyIndex
        : null;

  return (
    <View className="flex-1 gap-5 px-5 pt-4">
      <RoomHeader
        highlightIndex={highlightIndex}
        onMenu={() => game.setSettingsOpen(true)}
        players={game.players}
        roomCode={game.roomCode}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {game.phase === "chosen" ? (
          <LuckyView game={game} />
        ) : game.phase === "task" ? (
          <ChallengeView game={game} />
        ) : (
          <CirculatingView game={game} />
        )}
      </ScrollView>
    </View>
  );
}
