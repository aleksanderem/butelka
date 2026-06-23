import { BlurView } from "expo-blur";
import LottieView, { type AnimationObject } from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
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

const MAX_TILE = 132; // górny limit boku klapki (na szerokich ekranach)
const GAP = 3; // mały odstęp — klapki blisko siebie

/**
 * Pojedyncza klapka flipboard: animowana tablica (Lottie) + akcentowy tint + nałożona cyfra.
 * Cyfra w samym Lottie to warstwa tekstu, której lottie-react-native nie renderuje,
 * więc liczbę rysujemy własnym <Text>. Key = cyfra → remount → ponowny obrót klapki.
 */
function FlipDigit({ value, w, accent }: { value: number; w: number; accent: string }) {
  const h = Math.round(w * 1.18);
  return (
    <View
      style={{
        borderColor: `${accent}59`,
        borderRadius: Math.round(w * 0.12),
        borderWidth: 1.5,
        height: h,
        overflow: "hidden",
        width: w,
      }}
    >
      <LottieView
        autoPlay
        key={value}
        loop={false}
        resizeMode="cover"
        source={DIGITS[value] ?? DIGITS[0]}
        style={StyleSheet.absoluteFill}
      />
      {/* Akcentowy tint na ciemnej klapce — wpina licznik w neonowy motyw. */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `${accent}24` }]}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Text
          style={[styles.digit, { fontSize: Math.round(w * 0.66), textShadowColor: `${accent}cc` }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  digit: {
    color: "#FFFFFF",
    fontFamily: fonts.extrabold,
    includeFontPadding: false,
    textShadowOffset: { height: 0, width: 0 },
    textShadowRadius: 10,
  },
});

/**
 * Odliczanie czasu w stylu tablicy klapkowej (flipboard). TRZY klapki SSS (do 120 s).
 * Kolor (box/obwódka/glow/tint/„s") bierze z `accent` rundy. Licznik LOKALNY — startuje,
 * gdy pojawia się dana karta (restart po `restartKey`).
 */
export function FlipCountdown({
  seconds,
  restartKey,
  onExpire,
  accent,
}: {
  seconds: number;
  restartKey: string | number;
  onExpire?: () => void;
  accent: string;
}) {
  const { width } = useWindowDimensions();
  const [remaining, setRemaining] = useState(seconds);
  // Ref, żeby zmiana (niestabilnej) funkcji onExpire nie restartowała odliczania.
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

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
        onExpireRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, restartKey]);

  const clamped = Math.max(0, Math.min(999, remaining));
  const hundreds = Math.floor(clamped / 100);
  const tens = Math.floor((clamped % 100) / 10);
  const ones = clamped % 10;
  const urgent = clamped <= 5;
  const sColor = urgent ? neon.magenta : accent;

  // Rozmiar klapki tak, by 3 sztuki + „s" + padding boxa zmieściły się na szerokości.
  const tile = Math.min(MAX_TILE, Math.floor((width - 100) / 3));

  return (
    // Zewnętrzna warstwa = neonowy glow (cień nie może być przycięty overflow:hidden).
    <View
      style={{
        alignSelf: "center",
        borderRadius: 24,
        elevation: 16,
        shadowColor: accent,
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 28,
      }}
    >
      {/* Wewnętrzna warstwa = szkło: frosted BlurView + akcentowy tint + obwódka, przycięte do rogów. */}
      <View
        style={{
          borderColor: `${accent}80`,
          borderRadius: 24,
          borderWidth: 1.5,
          overflow: "hidden",
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
      >
        <BlurView intensity={28} pointerEvents="none" style={StyleSheet.absoluteFill} tint="dark" />
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: `${accent}1f` }]}
        />
        <View className="flex-row items-center justify-center" style={{ gap: GAP }}>
          <FlipDigit accent={accent} value={hundreds} w={tile} />
          <FlipDigit accent={accent} value={tens} w={tile} />
          <FlipDigit accent={accent} value={ones} w={tile} />
          <Text
            className="ml-1 font-extrabold"
            style={{ color: sColor, fontSize: Math.round(tile * 0.3) }}
          >
            s
          </Text>
        </View>
      </View>
    </View>
  );
}
