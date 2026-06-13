import type { AnimationObject } from "lottie-react-native";

import celebrate from "@/assets/bursts/celebrate.json";
import dare from "@/assets/bursts/dare.json";
import spin from "@/assets/bursts/spin.json";
import truth from "@/assets/bursts/truth.json";

/** Reakcyjne animacje (Lottie burst) odpalane po akcjach z przycisków. */
export const bursts = {
  /** Energia przy losowaniu szczęśliwca. */
  spin: spin as AnimationObject,
  /** Fioletowy spark przy wyborze „Prawda”. */
  truth: truth as AnimationObject,
  /** Czerwono-magentowy spark przy wyborze „Wyzwanie”. */
  dare: dare as AnimationObject,
  /** Kolorowy wybuch przy akceptacji / celebracji. */
  celebrate: celebrate as AnimationObject,
} as const;

export type BurstName = keyof typeof bursts;
