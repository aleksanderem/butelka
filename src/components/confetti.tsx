import { View } from "react-native";

import { neon } from "@/theme/colors";

const COLORS = [neon.purpleBright, neon.pink, neon.gold, neon.green, neon.magenta, "#38BDF8"];

/** Deterministyczny rozrzut konfetti wokół korony (ekran 4). */
const PIECES = [
  { x: 8, y: 6, r: -25, w: 10, h: 16 },
  { x: 26, y: 38, r: 40, w: 8, h: 8 },
  { x: 50, y: 4, r: 12, w: 12, h: 6 },
  { x: 74, y: 30, r: -15, w: 9, h: 14 },
  { x: 90, y: 10, r: 55, w: 10, h: 10 },
  { x: 4, y: 56, r: 18, w: 8, h: 12 },
  { x: 38, y: 64, r: -38, w: 11, h: 7 },
  { x: 62, y: 58, r: 28, w: 8, h: 8 },
  { x: 84, y: 60, r: -20, w: 10, h: 15 },
  { x: 18, y: 20, r: 8, w: 7, h: 7 },
  { x: 96, y: 40, r: -45, w: 9, h: 12 },
  { x: 46, y: 30, r: 60, w: 6, h: 6 },
];

export function Confetti({ width = 280, height = 150 }: { width?: number; height?: number }) {
  return (
    <View pointerEvents="none" style={{ height, position: "absolute", top: -10, width }}>
      {PIECES.map((p, i) => (
        <View
          key={i}
          style={{
            backgroundColor: COLORS[i % COLORS.length],
            borderRadius: 2,
            height: p.h,
            left: `${p.x}%`,
            position: "absolute",
            top: `${p.y}%`,
            transform: [{ rotate: `${p.r}deg` }],
            width: p.w,
          }}
        />
      ))}
    </View>
  );
}
