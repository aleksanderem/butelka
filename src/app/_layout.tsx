import { Stack } from "expo-router";
import { ConvexProvider } from "convex/react";
import { HeroUINativeProvider } from "heroui-native";
import type { JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { convexClient } from "@/lib/convex";

import "../global.css";

export default function RootLayout(): JSX.Element {
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
