import { Ionicons } from "@expo/vector-icons";
import { Input } from "heroui-native";
import { ScrollView, Text, View } from "react-native";

import { ColorDot } from "@/components/color-dot";
import { NeonButton } from "@/components/neon-button";
import { AvatarVisual } from "@/components/player-avatar";
import { SelectableAvatar } from "@/components/selectable-avatar";
import { avatarPresets, colorOrder } from "@/game/data";
import type { GameApi } from "@/game/use-game";
import { neon, playerPalette } from "@/theme/colors";

export function OnboardingScreen({ game }: { game: GameApi }) {
  const heading = game.roomTab === "create" ? "Tworzenie pokoju" : "Dołączanie do pokoju";

  return (
    <ScrollView
      contentContainerStyle={{ gap: 22, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 6 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center">
        <Ionicons
          color={neon.white}
          name="arrow-back"
          onPress={game.leaveRoom}
          size={26}
          suppressHighlighting
        />
        <Text
          className="flex-1 text-center text-base font-extrabold"
          style={{ color: neon.magenta }}
        >
          {heading}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <View className="items-center gap-3">
        <AvatarVisual active avatarId={game.avatarId} colorId={game.colorId} size="xl" />
        <View className="items-center gap-1">
          <Text className="text-2xl font-black text-foreground">Witaj w pokoju!</Text>
          <Text className="text-sm text-muted">Zanim dołączysz, stwórz swoją postać</Text>
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">1. Wpisz swoje imię</Text>
        <View className="justify-center">
          <Input
            autoCapitalize="words"
            maxLength={20}
            onChangeText={game.setPlayerName}
            placeholder="Twoje imię"
            value={game.playerName}
          />
          <View
            pointerEvents="none"
            style={{ bottom: 0, justifyContent: "center", position: "absolute", right: 16, top: 0 }}
          >
            <Text className="text-sm font-medium text-muted">{game.playerName.length}/20</Text>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">2. Wybierz avatar</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {avatarPresets.map((preset) => (
            <SelectableAvatar
              key={preset.id}
              avatarId={preset.id}
              colorId={game.colorId}
              selected={game.avatarId === preset.id}
              onPress={() => game.setAvatarId(preset.id)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">3. Wybierz kolor</Text>
        <View className="flex-row items-center justify-between">
          {colorOrder.map((id) => (
            <ColorDot
              key={id}
              color={playerPalette[id]}
              onPress={() => game.setColorId(id)}
              selected={game.colorId === id}
              size={40}
            />
          ))}
        </View>
      </View>

      <NeonButton
        disabled={!game.canEnterRoom}
        label="Dołącz do pokoju"
        onPress={game.completeProfile}
        variant="pink"
      />

      <View className="flex-row items-center justify-center gap-2">
        <Ionicons color={neon.textMuted} name="shield-checkmark-outline" size={16} />
        <Text className="text-center text-xs text-muted">
          Twoje imię i avatar będą widoczne dla innych graczy w pokoju
        </Text>
      </View>
    </ScrollView>
  );
}
