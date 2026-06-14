import LottieView, { type AnimationObject } from "lottie-react-native";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { bursts } from "@/game/bursts";

type BurstItem = { id: number; source: AnimationObject; style: ViewStyle };

type BurstApi = { fireCorners: () => void };

const BurstContext = createContext<BurstApi>({ fireCorners: () => undefined });

/** Reakcyjne animacje burst po akcjach z przycisków. */
export function useBurst(): BurstApi {
  return useContext(BurstContext);
}

const SIZE = 360;

/**
 * Trzyma aktywne bursty i renderuje je jako jednorazowe, nieklikalne nakładki Lottie.
 * fireCorners() wystrzeliwuje parę animacji z lewego i prawego dolnego rogu ekranu.
 */
export function BurstProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BurstItem[]>([]);
  const idRef = useRef(0);

  const add = useCallback((source: AnimationObject, style: ViewStyle) => {
    idRef.current += 1;
    setItems((current) => [...current, { id: idRef.current, source, style }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((it) => it.id !== id));
  }, []);

  const fireCorners = useCallback(() => {
    add(bursts.cornerLeft, { bottom: 0, height: SIZE, left: 0, position: "absolute", width: SIZE });
    add(bursts.cornerRight, { bottom: 0, height: SIZE, position: "absolute", right: 0, width: SIZE });
  }, [add]);

  return (
    <BurstContext.Provider value={{ fireCorners }}>
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {items.map((it) => (
          <LottieView
            autoPlay
            key={it.id}
            loop={false}
            onAnimationFinish={() => remove(it.id)}
            resizeMode="contain"
            source={it.source}
            style={it.style}
          />
        ))}
      </View>
    </BurstContext.Provider>
  );
}
