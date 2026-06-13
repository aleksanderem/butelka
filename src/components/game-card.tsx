import { BlurView } from "expo-blur";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Polygon, RadialGradient, Rect, Stop } from "react-native-svg";

import { AvatarVisual } from "@/components/player-avatar";
import type { AvatarId } from "@/game/types";
import { neon, type PlayerColorId } from "@/theme/colors";
import { fonts } from "@/theme/fonts";

const W = 160;
const H = 220;
const CX = W / 2;
const CY = H / 2;
const R = 170; // z zapasem, by promienie sięgały rogów (przycina overflow karty)
const SEGMENTS = 32;

/** Naprzemienne kliny tworzące sunburst (połowa segmentów = jaśniejsze promienie). */
const RAYS: string[] = Array.from({ length: SEGMENTS }, (_, i) => i)
  .filter((i) => i % 2 === 0)
  .map((i) => {
    const a1 = (i / SEGMENTS) * 2 * Math.PI;
    const a2 = ((i + 1) / SEGMENTS) * 2 * Math.PI;
    const x1 = (CX + R * Math.cos(a1)).toFixed(1);
    const y1 = (CY + R * Math.sin(a1)).toFixed(1);
    const x2 = (CX + R * Math.cos(a2)).toFixed(1);
    const y2 = (CY + R * Math.sin(a2)).toFixed(1);
    return `${CX},${CY} ${x1},${y1} ${x2},${y2}`;
  });

/** Iskierki rozrzucone po karcie (deterministycznie). */
const SPARKLES = [
  { x: 30, y: 42, r: 1.6 },
  { x: 128, y: 54, r: 2 },
  { x: 146, y: 120, r: 1.5 },
  { x: 22, y: 150, r: 1.8 },
  { x: 120, y: 186, r: 1.5 },
  { x: 52, y: 28, r: 1.1 },
  { x: 98, y: 74, r: 1 },
  { x: 26, y: 96, r: 1.4 },
  { x: 138, y: 176, r: 1 },
  { x: 72, y: 198, r: 1.5 },
  { x: 108, y: 150, r: 1.1 },
  { x: 44, y: 184, r: 1 },
];

/** Duża neonowa karta „Ty” z sunburstem (krąży wśród graczy / wachlarz w lobby). */
export function GameCard({
  label,
  avatarId,
  colorId,
  animate,
  spinning = false,
  blur = 0,
  dim = 0,
}: {
  label?: string;
  avatarId?: AvatarId;
  colorId?: PlayerColorId;
  animate?: boolean;
  spinning?: boolean;
  /** Rozmycie własnej zawartości karty (głębia w wachlarzu) — 0 = ostra. */
  blur?: number;
  /** Przyciemnienie karty (głębia) — 0..1. */
  dim?: number;
}) {
  const hasAvatar = avatarId !== undefined && colorId !== undefined;
  return (
    <View
      style={{
        elevation: 14,
        shadowColor: neon.purpleBright,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: spinning ? 1 : 0.8,
        shadowRadius: spinning ? 34 : 26,
      }}
    >
      <View
        style={{
          borderColor: "rgba(196,160,255,0.9)",
          borderRadius: 24,
          borderWidth: 2,
          height: H,
          overflow: "hidden",
          width: W,
        }}
      >
        <Svg height={H} width={W}>
          <Defs>
            <RadialGradient id="card-center" cx="50%" cy="50%" fx="50%" fy="50%" r="55%">
              <Stop offset="0%" stopColor={neon.purpleDeepest} stopOpacity={1} />
              <Stop offset="100%" stopColor={neon.purpleDeepest} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="card-edge" cx="50%" cy="50%" fx="50%" fy="50%" r="78%">
              <Stop offset="55%" stopColor={neon.purpleBright} stopOpacity={0} />
              <Stop offset="100%" stopColor={neon.purpleBright} stopOpacity={0.4} />
            </RadialGradient>
          </Defs>

          <Rect fill={neon.purpleDeep} height={H} width={W} />
          {RAYS.map((points) => (
            <Polygon fill={neon.purpleBright} fillOpacity={0.5} key={points} points={points} />
          ))}
          <Rect fill="url(#card-edge)" height={H} width={W} />
          <Rect fill="url(#card-center)" height={H} width={W} />
          {SPARKLES.map((s) => (
            <Circle
              cx={s.x}
              cy={s.y}
              fill="#EDE0FF"
              fillOpacity={0.85}
              key={`${s.x}-${s.y}`}
              r={s.r}
            />
          ))}
        </Svg>

        <View
          className="items-center justify-center"
          style={[StyleSheet.absoluteFill, { gap: 12, paddingHorizontal: 10 }]}
        >
          {hasAvatar ? (
            <AvatarVisual animate={animate} avatarId={avatarId} colorId={colorId} size="lg" />
          ) : null}
          {label ? (
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: "#FFFFFF",
                fontFamily: fonts.extrabold,
                fontSize: hasAvatar ? 24 : 52,
                letterSpacing: 0.5,
                maxWidth: W - 24,
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.35)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              {label}
            </Text>
          ) : null}
        </View>

        {/* Głębia wachlarza: blur rozmywa własną zawartość karty (jest pod nim), dim przyciemnia. */}
        {blur > 0 ? (
          <BlurView
            intensity={blur}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
        ) : null}
        {dim > 0 ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(4,2,10,${dim})` }]}
          />
        ) : null}
      </View>
    </View>
  );
}
