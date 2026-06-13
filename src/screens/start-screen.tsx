import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dialog, InputOTP } from "heroui-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

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
                <Image
                  resizeMode="contain"
                  source={require("../../icons/icons8-user-male-96.png")}
                  style={{ height: 30, width: 30 }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-white">Utwórz pokój</Text>
                <Text className="mt-0.5 text-sm text-white/80">
                  Stwórz pokój i zaproś znajomych
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Pressable>

      <NeonCard className="items-center gap-5">
        <View className="items-center gap-2">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Ionicons color={neon.magenta} name="enter-outline" size={22} />
          </View>
          <Text className="text-lg font-extrabold text-foreground">Dołącz do pokoju</Text>
          <Text className="text-center text-sm text-muted">Wpisz ID pokoju, aby dołączyć</Text>
        </View>

        <InputOTP
          className="w-full"
          inputMode="numeric"
          maxLength={6}
          onChange={(value) => game.setJoinCode(value.replace(/\D/g, ""))}
          value={game.joinCode}
        >
          <InputOTP.Group className="flex-1">
            <InputOTP.Slot className="h-14 w-auto flex-1" index={0} />
            <InputOTP.Slot className="h-14 w-auto flex-1" index={1} />
            <InputOTP.Slot className="h-14 w-auto flex-1" index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group className="flex-1">
            <InputOTP.Slot className="h-14 w-auto flex-1" index={3} />
            <InputOTP.Slot className="h-14 w-auto flex-1" index={4} />
            <InputOTP.Slot className="h-14 w-auto flex-1" index={5} />
          </InputOTP.Group>
        </InputOTP>

        <NeonButton
          className="w-full"
          disabled={game.normalizedJoinCode.length < 6}
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
