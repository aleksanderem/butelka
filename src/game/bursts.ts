import type { AnimationObject } from "lottie-react-native";

import cornerLeft from "@/assets/bursts/corner-left.json";
import cornerRight from "@/assets/bursts/corner-right.json";

/** Reakcyjne animacje (Lottie) wystrzeliwane z dolnych rogów po akcjach z przycisków. */
export const bursts = {
  cornerLeft: cornerLeft as AnimationObject,
  cornerRight: cornerRight as AnimationObject,
} as const;
