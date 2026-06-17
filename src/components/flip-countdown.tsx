import LottieView, { type AnimationObject } from "lottie-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import d0 from "@/assets/flipboard/0.json";
import d1 from "@/assets/flipboard/1.json";
import d2 from "@/assets/flipboard/2.json";
import d3 from "@/assets/flipboard/3.json";
import d4 from "@/assets/flipboard/4.json";
import d5 from "@/assets/flipboard/5.json";
import d6 from "@/assets/flipboard/6.json";
import d7 from "@/assets/flipboard/7.json";
import d8 from "@/assets/flipboard/8.json";
import d9 from "@/assets/flipboard/9.json";
import { neon } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

const DIGITS = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9] as AnimationObject[];

const MAX_TILE = 104; // górny limit boku klapki (na szerokich ekranach)
const GAP = 8;

/**
 * Pojedyncza klapka flipboard: animowana tablica (Lottie) + nałożona cyfra.
 * Cyfra w samym Lottie to warstwa tekstu, której lottie-react-native nie renderuje,
 * więc liczbę rysujemy własnym <Text>. Key = cyfra → remount → ponowny obrót klapki.
 */
function FlipDigit({ value, w }: { value: number; w: number }) {
  const h = Math.round(w * 1.18);
  return (
    <View style={{ borderRadius: Math.round(w * 0.12), height: h, overflow: "hidden", width: w }}>
      <LottieView
        autoPlay
        key={value}
        loop={false}
        resizeMode="cover"
        source={DIGITS[value] ?? DIGITS[0]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.digit, { fontSize: Math.round(w * 0.66) }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  digit: {
    color: "#F4F1FA",
    fontFamily: fonts.extrabold,
    includeFontPadding: false,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
});

/**
 * Odliczanie czasu w stylu tablicy klapkowej (flipboard). TRZY klapki SSS, bo czas może mieć
 * 3 cyfry (do 120 s). Licznik LOKALNY — startuje, gdy pojawia się dana karta (restart po `restartKey`).
 */
export function FlipCountdown({
  seconds,
  restartKey,
}: {
  seconds: number;
  restartKey: string | number;
}) {
  const { width } = useWindowDimensions();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    if (seconds <= 0) {
      return;
    }
    let current = seconds;
    const id = setInterval(() => {
      current -= 1;
      setRemaining(current);
      if (current <= 0) {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, restartKey]);

  const clamped = Math.max(0, Math.min(999, remaining));
  const hundreds = Math.floor(clamped / 100);
  const tens = Math.floor((clamped % 100) / 10);
  const ones = clamped % 10;
  const urgent = clamped <= 5;

  // Rozmiar klapki tak, by 3 sztuki + „s” zmieściły się na szerokości (z limitem na dużych ekranach).
  const tile = Math.min(MAX_TILE, Math.floor((width - 96) / 3));

  return (
    <View className="flex-row items-center justify-center" style={{ gap: GAP }}>
      <FlipDigit value={hundreds} w={tile} />
      <FlipDigit value={tens} w={tile} />
      <FlipDigit value={ones} w={tile} />
      <Text
        className="ml-1 font-extrabold"
        style={{ color: urgent ? neon.magenta : neon.textMuted, fontSize: Math.round(tile * 0.28) }}
      >
        s
      </Text>
    </View>
  );
}
