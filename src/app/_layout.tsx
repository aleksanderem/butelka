import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { FullscreenClip } from "@/components/fullscreen-clip";
import { IapProvider } from "@/iap/use-iap";

import "../global.css";

const INTRO_SOURCE = require("../../assets/animated/entry-video.mp4");

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Renderuj, gdy fonty się wczytają LUB gdy ich ładowanie zawiedzie — nigdy nie
  // zostawiaj użytkownika na czarnym ekranie, gdy font nie wstanie (np. na natywie).
  const ready = fontsLoaded || fontError !== null;
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <IapProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </IapProvider>
        {showIntro ? (
          <FullscreenClip
            maxDurationMs={11600}
            onDone={() => setShowIntro(false)}
            source={INTRO_SOURCE}
          />
        ) : null}
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
