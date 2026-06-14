import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dialog, InputOTP } from "heroui-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View, type ViewStyle } from "react-native";

import { BrandLogo } from "@/components/brand-logo";
import { NeonButton } from "@/components/neon-button";
import { NeonCard } from "@/components/neon-card";
import type { GameApi } from "@/game/use-game";
import { gradients, neon } from "@/theme/colors";

/** Styl slotu OTP: domyślnie border w kolorze WYZWANIE, a aktywny (focus) dostaje neonowy glow. */
function otpSlotStyle(isActive: boolean): ViewStyle {
  if (isActive) {
    return {
      borderColor: neon.magenta,
      overflow: "visible",
      shadowColor: neon.magenta,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 8,
    };
  }
  return { borderColor: "rgba(244,63,94,0.55)" };
}

type InfoKind = "rules" | "about";

const infoContent: Record<InfoKind, { title: string; body: string }> = {
  rules: {
    title: "Jak grać?",
    body: "Karta „Ty” krąży wśród graczy. Kogo wskaże los, ten zostaje szczęśliwcem i wybiera: prawdę albo wyzwanie. Po wykonaniu zadania tura przechodzi dalej — i wszystko zaczyna się od nowa.",
  },
  about: {
    title: "O grze",
    body: "Butelka to pokojowa gra w prawdę albo wyzwanie. Stwórz pokój, zaproś znajomych ich ID i bawcie się razem na jednym lub wielu telefonach.",
  },
};

export function StartScreen({ game }: { game: GameApi }) {
  const [info, setInfo] = useState<InfoKind | null>(null);

  return (
    <View className="flex-1 px-5 pt-6">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 24, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pb-2 pt-4">
          <BrandLogo width={300} />
        </View>

        {game.lastSession ? (
          <ActiveSessionBanner
            code={game.lastSession.code}
            onDismiss={game.dismissSession}
            onRejoin={game.rejoinSession}
          />
        ) : null}

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
              {({ slots }) =>
                [0, 1, 2].map((i) => (
                  <InputOTP.Slot
                    className="h-14 w-auto flex-1"
                    index={i}
                    key={i}
                    style={otpSlotStyle(slots[i]?.isActive ?? false)}
                  />
                ))
              }
            </InputOTP.Group>
            <InputOTP.Separator />
            <InputOTP.Group className="flex-1">
              {({ slots }) =>
                [3, 4, 5].map((i) => (
                  <InputOTP.Slot
                    className="h-14 w-auto flex-1"
                    index={i}
                    key={i}
                    style={otpSlotStyle(slots[i]?.isActive ?? false)}
                  />
                ))
              }
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
      </ScrollView>

      <View className="flex-row justify-center gap-8 pb-2 pt-3">
        <FooterLink icon="help-circle-outline" label="Zasady" onPress={() => setInfo("rules")} />
        <FooterLink
          icon="grid-outline"
          label="Kategorie"
          onPress={() => game.setCategoriesOpen(true)}
        />
        <FooterLink
          icon="settings-outline"
          label="Ustawienia"
          onPress={() => game.setGlobalSettingsOpen(true)}
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

function ActiveSessionBanner({
  code,
  onRejoin,
  onDismiss,
}: {
  code: string;
  onRejoin: () => void;
  onDismiss: () => void;
}) {
  return (
    <View
      className="gap-3 overflow-hidden rounded-3xl p-4"
      style={{
        backgroundColor: "rgba(244,63,94,0.1)",
        borderColor: "rgba(244,63,94,0.42)",
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(244,63,94,0.18)" }}
        >
          <Ionicons color={neon.magenta} name="game-controller" size={22} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-foreground">Masz aktywną sesję</Text>
          <Text className="text-xs text-muted">
            Pokój <Text style={{ color: neon.pink }}>{code}</Text>
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Odrzuć sesję"
          accessibilityRole="button"
          className="h-8 w-8 items-center justify-center rounded-full"
          hitSlop={8}
          onPress={onDismiss}
        >
          <Ionicons color={neon.textMuted} name="close" size={18} />
        </Pressable>
      </View>
      <NeonButton
        className="w-full"
        icon="enter-outline"
        label="Dołącz ponownie"
        onPress={onRejoin}
        variant="pink"
      />
    </View>
  );
}
