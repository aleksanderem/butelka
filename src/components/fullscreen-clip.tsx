import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { neon } from "@/theme/colors";

type FullscreenClipProps = {
  /** Wynik require("...mp4"). */
  source: number;
  /** Bezpiecznik: maksymalny czas pokazywania klipu, gdyby zdarzenie końca nie dotarło. */
  maxDurationMs: number;
  onDone: () => void;
};

/**
 * Pełnoekranowy klip wideo odtwarzany RAZ (intro / reveal). Po zakończeniu (zdarzenie
 * `playToEnd` lub bezpiecznik czasowy) wygasza się i woła `onDone`. Dotknięcie pomija klip.
 */
export function FullscreenClip({ source, maxDurationMs, onDone }: FullscreenClipProps) {
  const fade = useRef(new Animated.Value(1)).current;
  const doneRef = useRef(false);

  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const finish = (durationMs: number) => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    Animated.timing(fade, { toValue: 0, duration: durationMs, useNativeDriver: true }).start(
      () => onDone()
    );
  };

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => finish(320));
    const timeout = setTimeout(() => finish(320), maxDurationMs);
    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
    // Komponent montowany jest na nowo dla każdego klipu — `player` jest stabilny w jego cyklu życia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { backgroundColor: neon.bg, opacity: fade, zIndex: 100 }]}
    >
      <Pressable onPress={() => finish(200)} style={StyleSheet.absoluteFill}>
        <VideoView
          contentFit="cover"
          nativeControls={false}
          player={player}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
    </Animated.View>
  );
}
