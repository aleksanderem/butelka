import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameCard } from "@/components/game-card";
import { RoomHeader } from "@/components/room-header";
import type { Phase, Player } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { t } from "@/game/ui-strings";
import { hapticPulse, hapticReveal, hapticSpinTick } from "@/lib/haptics";

const DRAW_SOURCE = require("../../assets/animated/draw-shuffle.mp4");
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
  // Zwiększane po zakończeniu klipu losowania — wymusza remount LuckyView, by jego wejście
  // (pop karty) odpaliło się dokładnie w momencie odsłonięcia, a nie pod spodem nakładki.
  const [drawNonce, setDrawNonce] = useState(0);

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
          <LuckyView game={game} key={drawNonce} />
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

      <DrawOverlay
        amLucky={game.amLucky}
        luckyPlayer={game.luckyPlayer}
        onReveal={() => setDrawNonce((n) => n + 1)}
        phase={game.phase}
      />
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
 * Animacja losowania: gdy zaczyna się tura (faza wchodzi w `spinning`), na pełnym ekranie leci
 * klip tasujących się neonowych kart (~6s). Gdy los wskaże szczęśliwca (faza `chosen`, ~2s przez
 * SPIN_MS), na klipie WYRASTA karta wybranego gracza (scale) i trzyma do końca klipu — wtedy
 * nakładka wygasa i odsłania `LuckyView` z tą samą kartą (płynne przejście).
 */
function DrawOverlay({
  phase,
  luckyPlayer,
  amLucky,
  onReveal,
}: {
  phase: Phase;
  luckyPlayer: Player | null;
  amLucky: boolean;
  onReveal: () => void;
}) {
  const [active, setActive] = useState(false);
  const prevPhase = useRef(phase);

  useEffect(() => {
    if (prevPhase.current !== "spinning" && phase === "spinning") {
      setActive(true);
    }
    prevPhase.current = phase;
  }, [phase]);

  if (!active) {
    return null;
  }

  return (
    <DrawClip
      amLucky={amLucky}
      luckyPlayer={luckyPlayer}
      onDone={() => {
        setActive(false);
        onReveal();
      }}
      phase={phase}
    />
  );
}

/** Klip losowania + wyrastająca karta wybrańca. */
function DrawClip({
  phase,
  luckyPlayer,
  amLucky,
  onDone,
}: {
  phase: Phase;
  luckyPlayer: Player | null;
  amLucky: boolean;
  onDone: () => void;
}) {
  const fade = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(false);
  const grownRef = useRef(false);

  const player = useVideoPlayer(DRAW_SOURCE, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  // Karta wybrańca wyrasta, gdy los wskaże (faza „chosen" + znany gracz).
  useEffect(() => {
    if (!grownRef.current && phase === "chosen" && luckyPlayer) {
      grownRef.current = true;
      Animated.spring(cardScale, {
        friction: 7,
        tension: 36,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [phase, luckyPlayer, cardScale]);

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) {
        return;
      }
      doneRef.current = true;
      Animated.timing(fade, { duration: 300, toValue: 0, useNativeDriver: true }).start(() =>
        onDone()
      );
    };
    const subscription = player.addListener("playToEnd", finish);
    const timeout = setTimeout(finish, 6500);
    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { backgroundColor: neon.bg, opacity: fade, zIndex: 100 }]}
    >
      <VideoView
        contentFit="cover"
        nativeControls={false}
        player={player}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}
      >
        <Animated.View
          style={{
            opacity: cardScale,
            transform: [
              { scale: cardScale.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.12] }) },
            ],
          }}
        >
          <GameCard
            animate
            avatarId={luckyPlayer?.avatarId}
            colorId={luckyPlayer?.colorId}
            label={amLucky ? t("roomScreen.you") : (luckyPlayer?.name ?? "")}
          />
        </Animated.View>
      </View>
    </Animated.View>
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
        {t("roomScreen.watchingAs")} {game.viewAsPlayer?.name ?? t("roomScreen.player")}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-full px-3 py-1"
        onPress={() => game.setActingAs(null)}
        style={{ backgroundColor: "rgba(251,191,36,0.22)" }}
      >
        <Text className="text-xs font-bold" style={{ color: neon.goldBright }}>
          {t("roomScreen.backToSelf")}
        </Text>
      </Pressable>
    </View>
  );
}
