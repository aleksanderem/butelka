import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PlayerAvatar } from "@/components/player-avatar";
import type { Player } from "@/game/types";
import { neon } from "@/theme/colors";

type RoomHeaderProps = {
  roomCode: string;
  players: Player[];
  highlightIndex: number | null;
  onBack: () => void;
  onPlayers: () => void;
  onSettings: () => void;
};

export function RoomHeader({
  roomCode,
  players,
  highlightIndex,
  onBack,
  onPlayers,
  onSettings,
}: RoomHeaderProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="Opuść pokój"
          accessibilityRole="button"
          className="-ml-1 h-9 w-9 items-center justify-center"
          hitSlop={8}
          onPress={onBack}
        >
          <Ionicons color={neon.white} name="arrow-back" size={24} />
        </Pressable>

        <Text className="text-base font-bold text-foreground">
          Pokój: <Text style={{ color: neon.purpleBright }}>{roomCode}</Text>
        </Text>

        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityLabel="Gracze w pokoju"
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5"
            hitSlop={6}
            onPress={onPlayers}
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <Ionicons color={neon.textMuted} name="people" size={18} />
            <Text className="text-sm font-bold text-foreground">{players.length}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Ustawienia pokoju"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center"
            hitSlop={6}
            onPress={onSettings}
          >
            <Ionicons color={neon.white} name="settings-outline" size={20} />
          </Pressable>
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
