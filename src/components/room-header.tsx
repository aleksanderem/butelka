import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PlayerAvatar } from "@/components/player-avatar";
import type { Player } from "@/game/types";
import { neon } from "@/theme/colors";

type RoomHeaderProps = {
  roomCode: string;
  players: Player[];
  highlightIndex: number | null;
  onMenu: () => void;
};

export function RoomHeader({ roomCode, players, highlightIndex, onMenu }: RoomHeaderProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between px-1">
        <Pressable accessibilityLabel="Menu pokoju" accessibilityRole="button" onPress={onMenu}>
          <Ionicons color={neon.white} name="menu" size={26} />
        </Pressable>
        <Text className="text-base font-bold text-foreground">
          Pokój: <Text style={{ color: neon.purpleBright }}>{roomCode}</Text>
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Ionicons color={neon.textMuted} name="people" size={20} />
          <Text className="text-base font-bold text-foreground">{players.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ gap: 14, paddingHorizontal: 4 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {players.map((player, index) => (
          <PlayerAvatar
            key={player.id}
            active={highlightIndex === index}
            dimmed={highlightIndex !== null && highlightIndex !== index}
            player={player}
            showName
            size="sm"
          />
        ))}
      </ScrollView>
    </View>
  );
}
