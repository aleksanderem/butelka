import LottieView, { type AnimationObject } from "lottie-react-native";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

type FireOptions = { x?: number; y?: number; size?: number };
type FireFn = (source: AnimationObject, options?: FireOptions) => void;

type BurstItem = { id: number; source: AnimationObject; x: number; y: number; size: number };

const BurstContext = createContext<FireFn>(() => undefined);

/** Odpala reakcyjną animację burst po akcji z przycisku. */
export function useBurst(): FireFn {
  return useContext(BurstContext);
}

/**
 * Trzyma aktywne bursty i renderuje je jako jednorazowe, nieklikalne nakładki
 * Lottie wyśrodkowane na zadanym punkcie ekranu (domyślnie środek).
 */
export function BurstProvider({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [items, setItems] = useState<BurstItem[]>([]);
  const idRef = useRef(0);

  const fire = useCallback<FireFn>(
    (source, options) => {
      const size = options?.size ?? 320;
      const x = options?.x ?? width / 2;
      const y = options?.y ?? height / 2;
      idRef.current += 1;
      setItems((current) => [...current, { id: idRef.current, source, x, y, size }]);
    },
    [width, height]
  );

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((it) => it.id !== id));
  }, []);

  return (
    <BurstContext.Provider value={fire}>
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
            style={{
              height: it.size,
              left: it.x - it.size / 2,
              position: "absolute",
              top: it.y - it.size / 2,
              width: it.size,
            }}
          />
        ))}
      </View>
    </BurstContext.Provider>
  );
}
