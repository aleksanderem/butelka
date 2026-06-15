import LottieView, { type AnimationObject } from "lottie-react-native";
import { Text, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

import { doodleSources } from "@/game/doodles";

type Placement = {
  /** Indeks 0-based do doodleSources (np. korona = scribble-26 = index 25). */
  index: number;
  top: number | `${number}%`;
  left: number | `${number}%`;
  width: number;
  /** Domyslnie = width (kwadrat). */
  height?: number;
  rotate?: string;
  /** Poziome rozciagniecie animacji (np. swoosh -> szerokie podkreslenie). */
  scaleX?: number;
  opacity?: number;
  /** Neonowy kolor poswiaty (glow). */
  glow: string;
  /** Mnoznik rozmiaru blobu glow wzgledem doodle. */
  glowScale?: number;
  resizeMode?: "contain" | "cover" | "center";
};

/**
 * Doodle wokol logo (korona nad, kwiatek w prawym gornym). Pozycje w px wzgledem PUDELKA LOGO
 * (360x176), bo HeroDoodles jest renderowany wewnatrz kontenera logo — dzieki temu doodle
 * scrolluja RAZEM z logiem, a nie zostaja przyklejone do ekranu. Kazdy z neonowym glow.
 */
const HERO: Placement[] = [
  // Korona nad logo (rozowy) — wysrodkowana, nad slowem PRAWDA
  {
    index: 25,
    top: -34,
    left: 138,
    width: 80,
    glow: "#EC4899",
    opacity: 0.95,
    glowScale: 1.5,
  },
  // Kwiatek w prawym gornym rogu logo (fiolet)
  {
    index: 26,
    top: 4,
    left: 296,
    width: 54,
    rotate: "-6deg",
    glow: "#A855F7",
    opacity: 0.75,
    glowScale: 1.6,
  },
];

/** Miekki neonowy blob (radial gradient) jako poswiata pod doodle. */
function GlowBlob({ color, w, h, id }: { color: string; w: number; h: number; id: string }) {
  return (
    <Svg
      height={h}
      pointerEvents="none"
      style={{ left: 0, position: "absolute", top: 0 }}
      width={w}
    >
      <Defs>
        <RadialGradient cx="50%" cy="50%" id={id} rx="50%" ry="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <Stop offset="55%" stopColor={color} stopOpacity={0.16} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={w / 2} cy={h / 2} fill={`url(#${id})`} rx={w / 2} ry={h / 2} />
    </Svg>
  );
}

/**
 * Dekoracyjna warstwa animowanych neonowych doodli (nieklikalna).
 * `preview` renderuje siatke wszystkich 28 z numerami do wyboru ksztaltow.
 */
export function HeroDoodles({ preview = false }: { preview?: boolean }) {
  if (preview) {
    return (
      <View
        pointerEvents="none"
        style={{
          backgroundColor: "#0A0712",
          bottom: 0,
          flexDirection: "row",
          flexWrap: "wrap",
          left: 0,
          paddingTop: 60,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      >
        {doodleSources.map((src, i) => (
          <View
            key={i}
            style={{ alignItems: "center", height: 96, justifyContent: "center", width: "25%" }}
          >
            <LottieView
              autoPlay
              loop
              resizeMode="contain"
              source={src}
              style={{ height: 70, width: 70 }}
            />
            <Text style={{ color: "#fff", fontSize: 11, left: 8, position: "absolute", top: 2 }}>
              {i + 1}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
    >
      {HERO.map((p, i) => {
        const w = p.width;
        const h = p.height ?? p.width;
        const sx = p.scaleX ?? 1;
        const scale = p.glowScale ?? 1.5;
        const gw = w * sx * scale;
        const gh = h * scale;
        return (
          <View
            key={i}
            style={{
              left: p.left,
              opacity: p.opacity ?? 0.9,
              position: "absolute",
              top: p.top,
              transform: p.rotate ? [{ rotate: p.rotate }] : undefined,
            }}
          >
            <View style={{ left: (w - gw) / 2, position: "absolute", top: (h - gh) / 2 }}>
              <GlowBlob color={p.glow} h={gh} id={`doodle-glow-${i}`} w={gw} />
            </View>
            <LottieView
              autoPlay
              loop
              resizeMode={p.resizeMode ?? "contain"}
              source={doodleSources[p.index] as AnimationObject}
              style={{ height: h, transform: [{ scaleX: sx }], width: w }}
            />
          </View>
        );
      })}
    </View>
  );
}
