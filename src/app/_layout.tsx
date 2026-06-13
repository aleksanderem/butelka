import { ConvexProvider } from "convex/react";
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
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { convexClient } from "@/lib/convex";

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element | null {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ConvexProvider client={convexClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </ConvexProvider>
  );
}
