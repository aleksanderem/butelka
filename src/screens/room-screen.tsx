import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FullscreenClip } from "@/components/fullscreen-clip";
import { RoomHeader } from "@/components/room-header";
import type { Phase } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { hapticPulse, hapticReveal, hapticSpinTick } from "@/lib/haptics";

const REVEAL_SOURCE = require("../../assets/animated/reveal-bottle.mp4");
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

  const insets = useSafeAreaInsets();
  // Wysokość nagłówka, by treść zaczynała się pod nim (i przewijała się za jego rozmyciem).
  const [headerHeight, setHeaderHeight] = useState(0);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          // Treść w całości pod nagłówkiem, z małym marginesem. Nagłówek wchodzi pod status bar
          // (top: -insets.top), więc odejmujemy inset z jego zmierzonej wysokości.
          paddingTop: Math.max(0, headerHeight - insets.top) + 10,
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

      {/* Frosted glass header: półprzezroczysty pasek z rozmyciem, rozciągnięty też pod status bar
          (top: -insets.top), żeby notch nie był „innym fragmentem". Treść przewija się pod nim. */}
      <View
        className="absolute left-0 right-0 overflow-hidden"
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={{
          top: -insets.top,
          zIndex: 10,
          borderBottomColor: "rgba(255,255,255,0.07)",
          borderBottomWidth: 1,
        }}
      >
        <BlurView intensity={55} pointerEvents="none" style={StyleSheet.absoluteFill} tint="dark" />
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,8,18,0.2)" }]}
        />

        <View className="gap-3 px-5 pb-3" style={{ paddingTop: insets.top + 8 }}>
          <RoomHeader
            highlightIndex={highlightIndex}
            onBack={game.requestLeave}
            onPlayers={() => game.setPlayersOpen(true)}
            onSettings={() => game.setSettingsOpen(true)}
            players={game.players}
            roomCode={game.roomCode}
          />

          {game.isImpersonating ? <ImpersonationBanner game={game} /> : null}
        </View>
      </View>

      <PlayersSheet game={game} />

      <RevealGate phase={game.phase} />
      <RoomHaptics activeIndex={game.activeIndex} amLucky={game.amLucky} phase={game.phase} />
    </View>
  );
}

/**
 * Sygnaly haptyczne pokoju (no-op na symulatorze):
 * - tyk przy kazdej zmianie wskazania podczas losowania (czuja wszyscy),
 * - mocny sygnal w momencie wskazania szczesliwca,
 * - puls u wylosowanego, powtarzany do momentu wyboru prawda/wyzwanie.
 */
function RoomHaptics({
  phase,
  activeIndex,
  amLucky,
}: {
  phase: Phase;
  activeIndex: number | null;
  amLucky: boolean;
}) {
  // Tyk przy kazdej zmianie aktywnego gracza w trakcie krazenia karty.
  useEffect(() => {
    if (phase === "spinning") {
      hapticSpinTick();
    }
  }, [phase, activeIndex]);

  // Mocniejszy sygnal dokladnie w chwili wskazania (spinning -> chosen).
  const prevPhase = useRef(phase);
  useEffect(() => {
    if (prevPhase.current === "spinning" && phase === "chosen") {
      hapticReveal();
    }
    prevPhase.current = phase;
  }, [phase]);

  // Puls u szczesliwca dopoki nie wybierze (faza "chosen") — tylko na jego urzadzeniu.
  useEffect(() => {
    if (!(amLucky && phase === "chosen")) {
      return;
    }
    hapticPulse();
    const id = setInterval(hapticPulse, 1100);
    return () => clearInterval(id);
  }, [amLucky, phase]);

  return null;
}

/**
 * Pokazuje klip „reveal" (wirująca butelka) na pełnym ekranie w momencie, gdy faza pokoju
 * przechodzi ze `spinning` na `chosen` — czyli gdy los właśnie wskazał szczęśliwca.
 * Po zakończeniu klipu odsłania się leżący pod spodem `LuckyView`.
 */
function RevealGate({ phase }: { phase: Phase }) {
  const [active, setActive] = useState(false);
  const prevPhase = useRef(phase);

  useEffect(() => {
    if (prevPhase.current === "spinning" && phase === "chosen") {
      setActive(true);
    }
    prevPhase.current = phase;
  }, [phase]);

  if (!active) {
    return null;
  }

  return (
    <FullscreenClip maxDurationMs={5500} onDone={() => setActive(false)} source={REVEAL_SOURCE} />
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
