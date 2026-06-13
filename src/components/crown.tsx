import { Image, View } from "react-native";

import { neon } from "@/theme/colors";

/** Złota korona szczęśliwca (ekran 4). Korzysta z crown.png dołączonego do repo. */
export function Crown({ size = 120 }: { size?: number }) {
  return (
    <View
      style={{
        shadowColor: neon.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 26,
        elevation: 12,
      }}
    >
      <Image
        resizeMode="contain"
        source={require("../../crown.png")}
        style={{ height: size, width: size }}
      />
    </View>
  );
}
