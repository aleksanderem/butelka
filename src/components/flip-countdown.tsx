import LottieView, { type AnimationObject } from "lottie-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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

const W = 58;
const H = 70;

/**
 * Pojedyncza klapka flipboard: animowana tablica (Lottie) + nałożona cyfra.
 * Cyfra w samym Lottie to warstwa tekstu, której lottie-react-native nie renderuje,
 * więc liczbę rysujemy własnym <Text>. Key = cyfra → remount → ponowny obrót klapki.
 */
function FlipDigit({ value }: { value: number }) {
  return (
    <View style={{ borderRadius: 7, height: H, overflow: "hidden", width: W }}>
      <LottieView
        autoPlay
        key={value}
        loop={false}
        resizeMode="cover"
        source={DIGITS[value] ?? DIGITS[0]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.digit}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  digit: {
    color: "#F4F1FA",
    fontFamily: fonts.extrabold,
    fontSize: 40,
    includeFontPadding: false,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
  },
});

/**
 * Odliczanie czasu na odpowiedź/wyzwanie w stylu tablicy klapkowej (flipboard).
 * Licznik LOKALNY — startuje, gdy pojawia się dana karta (restart po zmianie `restartKey`).
 */
export function FlipCountdown({
  seconds,
  restartKey,
}: {
  seconds: number;
  restartKey: string | number;
}) {
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

  const clamped = Math.max(0, Math.min(99, remaining));
  const tens = Math.floor(clamped / 10);
  const ones = clamped % 10;
  const urgent = clamped <= 5;

  return (
    <View className="flex-row items-center justify-center gap-1.5">
      <FlipDigit value={tens} />
      <FlipDigit value={ones} />
      <Text
        className="ml-0.5 text-sm font-extrabold"
        style={{ color: urgent ? neon.magenta : neon.textMuted }}
      >
        s
      </Text>
    </View>
  );
}
