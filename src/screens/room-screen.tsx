import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { RoomHeader } from "@/components/room-header";
import type { GameApi } from "@/game/use-game";
import { ChallengeView } from "@/screens/room/challenge-view";
import { CirculatingView } from "@/screens/room/circulating-view";
import { LuckyView } from "@/screens/room/lucky-view";
import { PlayersSheet } from "@/screens/players-sheet";
import { neon } from "@/theme/colors";

export function RoomScreen({ game }: { game: GameApi }) {
  const highlightIndex =
    game.phase === "spinning"
      ? game.activeIndex
      : game.phase === "chosen" || game.phase === "task"
        ? game.luckyIndex
        : null;

  // Wysokość nagłówka, by treść zaczynała się pod nim (i przewijała się za jego rozmyciem).
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          // Treść w całości pod nagłówkiem, z małym marginesem. Rozmycie widać, gdy treść
          // przewija się pod półprzezroczysty pasek.
          paddingTop: headerHeight + 10,
          paddingBottom: 28,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {game.phase === "chosen" ? (
          <LuckyView game={game} />
        ) : game.phase === "task" ? (
          <ChallengeView game={game} />
        ) : (
          <CirculatingView game={game} />
        )}
      </ScrollView>

      {/* Frosted glass header: półprzezroczysty pasek z rozmyciem — treść przewija się pod nim. */}
      <View
        className="absolute left-0 right-0 top-0 overflow-hidden"
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={{ zIndex: 10, borderBottomColor: "rgba(255,255,255,0.07)", borderBottomWidth: 1 }}
      >
        <BlurView intensity={55} pointerEvents="none" style={StyleSheet.absoluteFill} tint="dark" />
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,8,18,0.2)" }]}
        />

        <View className="gap-3 px-5 pb-3 pt-3">
          <RoomHeader
            highlightIndex={highlightIndex}
            onBack={game.leaveRoom}
            onPlayers={() => game.setPlayersOpen(true)}
            onSettings={() => game.setSettingsOpen(true)}
            players={game.players}
            roomCode={game.roomCode}
          />

          {game.isImpersonating ? <ImpersonationBanner game={game} /> : null}
        </View>
      </View>

      <PlayersSheet game={game} />
    </View>
  );
}

function ImpersonationBanner({ game }: { game: GameApi }) {
  return (
    <View
      className="flex-row items-center gap-2 rounded-2xl px-3.5 py-2.5"
      style={{
        backgroundColor: "rgba(251,191,36,0.14)",
        borderColor: "rgba(251,191,36,0.4)",
        borderWidth: 1,
      }}
    >
      <Ionicons color={neon.gold} name="eye" size={16} />
      <Text className="flex-1 text-sm font-semibold" style={{ color: neon.goldBright }}>
        Oglądasz jako {game.viewAsPlayer?.name ?? "gracz"}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-full px-3 py-1"
        onPress={() => game.setActingAs(null)}
        style={{ backgroundColor: "rgba(251,191,36,0.22)" }}
      >
        <Text className="text-xs font-bold" style={{ color: neon.goldBright }}>
          Wróć do siebie
        </Text>
      </Pressable>
    </View>
  );
}
