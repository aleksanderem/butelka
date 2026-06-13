import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dialog, Input, Label } from "heroui-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BrandLogo } from "@/components/brand-logo";
import { NeonButton } from "@/components/neon-button";
import { NeonCard } from "@/components/neon-card";
import type { GameApi } from "@/game/use-game";
import { gradients, neon } from "@/theme/colors";

type InfoKind = "rules" | "settings" | "about";

const infoContent: Record<InfoKind, { title: string; body: string }> = {
  rules: {
    title: "Jak grać?",
    body: "Karta „Ty” krąży wśród graczy. Kogo wskaże los, ten zostaje szczęśliwcem i wybiera: prawdę albo wyzwanie. Po wykonaniu zadania tura przechodzi dalej — i wszystko zaczyna się od nowa.",
  },
  settings: {
    title: "Ustawienia",
    body: "Ustawienia rozgrywki (zgody większości, dźwięki, zarządzanie graczami) znajdziesz w panelu wewnątrz pokoju.",
  },
  about: {
    title: "O grze",
    body: "Butelka to pokojowa gra w prawdę albo wyzwanie. Stwórz pokój, zaproś znajomych ich ID i bawcie się razem na jednym lub wielu telefonach.",
  },
};

export function StartScreen({ game }: { game: GameApi }) {
  const [info, setInfo] = useState<InfoKind | null>(null);

  return (
    <View className="flex-1 gap-6 px-5 pt-6">
      <View className="items-center pb-2 pt-4">
        <BrandLogo width={300} />
      </View>

      <Pressable
        accessibilityLabel="Utwórz pokój"
        accessibilityRole="button"
        onPress={game.createRoom}
        style={({ pressed }) => ({
          borderRadius: 24,
          shadowColor: neon.purple,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 22,
          elevation: 10,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View className="overflow-hidden rounded-3xl">
          <LinearGradient colors={gradients.violet} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }}>
            <View className="flex-row items-center gap-4 p-5">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Ionicons color="#FFFFFF" name="people" size={28} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold uppercase tracking-wide text-white">
                  Utwórz pokój
                </Text>
                <Text className="mt-0.5 text-sm text-white/80">
                  Stwórz pokój i zaproś znajomych
                </Text>
              </View>
              <Ionicons color="rgba(255,255,255,0.8)" name="chevron-forward" size={22} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>

      <NeonCard className="gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Ionicons color={neon.magenta} name="enter-outline" size={22} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-extrabold text-foreground">Dołącz do pokoju</Text>
            <Text className="text-sm text-muted">Wpisz ID pokoju, aby dołączyć</Text>
          </View>
        </View>

        <View className="gap-2">
          <Label className="uppercase">ID pokoju</Label>
          <Input
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            onChangeText={(value) => game.setJoinCode(value.toUpperCase())}
            placeholder="Wpisz ID pokoju"
            value={game.joinCode}
          />
        </View>

        <NeonButton
          disabled={game.normalizedJoinCode.length < 4}
          label="Dołącz"
          onPress={game.joinRoom}
          variant="pink"
        />
      </NeonCard>

      <View className="mt-auto flex-row justify-center gap-10 pb-2">
        <FooterLink icon="help-circle-outline" label="Zasady" onPress={() => setInfo("rules")} />
        <FooterLink
          icon="settings-outline"
          label="Ustawienia"
          onPress={() => setInfo("settings")}
        />
        <FooterLink
          icon="information-circle-outline"
          label="O grze"
          onPress={() => setInfo("about")}
        />
      </View>

      <Dialog isOpen={info !== null} onOpenChange={(open) => !open && setInfo(null)}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Close variant="tertiary" />
            <View className="gap-2 pr-8">
              <Dialog.Title>{info ? infoContent[info].title : ""}</Dialog.Title>
              <Dialog.Description>{info ? infoContent[info].body : ""}</Dialog.Description>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
}

function FooterLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" className="items-center gap-1.5" onPress={onPress}>
      <Ionicons color={neon.textMuted} name={icon} size={24} />
      <Text className="text-xs font-medium text-muted">{label}</Text>
    </Pressable>
  );
}
