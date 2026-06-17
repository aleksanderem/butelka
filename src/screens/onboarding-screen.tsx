import { Ionicons } from "@expo/vector-icons";
import { Input } from "heroui-native";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { ColorDot } from "@/components/color-dot";
import { NeonButton } from "@/components/neon-button";
import { AvatarVisual } from "@/components/player-avatar";
import { SelectableAvatar } from "@/components/selectable-avatar";
import { avatarOrder } from "@/game/avatars";
import { colorOrder } from "@/game/data";
import type { GameApi } from "@/game/use-game";
import { neon, playerPalette } from "@/theme/colors";

const AVATAR_H_PAD = 20;
const AVATAR_GAP = 12;

export function OnboardingScreen({ game }: { game: GameApi }) {
  const heading = game.roomTab === "create" ? "Tworzenie pokoju" : "Dołączanie do pokoju";

  // Siatka avatarów responsywna: 5 kolumn na szerokich ekranach (Pro Max/Plus ≥ 420pt), 4 na węższych.
  // Bok avatara liczony tak, by kolumny wypełniły rząd bez resztki po prawej.
  const { width } = useWindowDimensions();
  const avatarCols = width >= 420 ? 5 : 4;
  const avatarSize = Math.floor(
    (width - AVATAR_H_PAD * 2 - AVATAR_GAP * (avatarCols - 1)) / avatarCols
  );

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 22, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 6 }}
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
            <Text className="text-2xl font-extrabold text-foreground">Witaj w pokoju!</Text>
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
              style={{
                bottom: 0,
                justifyContent: "center",
                position: "absolute",
                right: 16,
                top: 0,
              }}
            >
              <Text className="text-sm font-medium text-muted">{game.playerName.length}/20</Text>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-base font-bold text-foreground">2. Wybierz avatar</Text>
          <View className="flex-row flex-wrap" style={{ gap: AVATAR_GAP }}>
            {avatarOrder.map((id) => (
              <SelectableAvatar
                avatarId={id}
                colorId={game.colorId}
                key={id}
                onPress={() => game.setAvatarId(id)}
                selected={game.avatarId === id}
                size={avatarSize}
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
      </ScrollView>

      {/* Fixed dolny pasek z przyciskiem — flush, bez glow/obwódki od góry. */}
      <View className="gap-3 px-5 pb-2 pt-3" style={{ backgroundColor: neon.bg }}>
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
      </View>
    </View>
  );
}
