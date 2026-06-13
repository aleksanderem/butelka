import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { neon } from "@/theme/colors";

type ScreenProps = ViewProps & {
  children: ReactNode;
  withBottomInset?: boolean;
  withTopInset?: boolean;
};

export function Screen({
  children,
  style,
  withBottomInset = true,
  withTopInset = true,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      className="flex-1 bg-background"
      style={[
        {
          paddingBottom: withBottomInset ? insets.bottom : 0,
          paddingTop: withTopInset ? insets.top : 0,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[neon.bg, neon.bgDeep, "#05030B"]}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <AmbientGlow />
      {children}
    </View>
  );
}

/** Dwie neonowe poświaty (fiolet z góry-lewej, magenta z góry-prawej) jak na mockupach. */
function AmbientGlow() {
  const { width } = useWindowDimensions();
  const height = 520;

  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={{ left: 0, position: "absolute", top: 0 }}
      width={width}
    >
      <Defs>
        <RadialGradient id="glow-violet" cx="22%" cy="4%" fx="22%" fy="4%" rx="70%" ry="55%">
          <Stop offset="0%" stopColor={neon.purpleBright} stopOpacity={0.38} />
          <Stop offset="45%" stopColor={neon.purple} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={neon.purple} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="glow-pink" cx="92%" cy="10%" fx="92%" fy="10%" rx="60%" ry="50%">
          <Stop offset="0%" stopColor={neon.pink} stopOpacity={0.26} />
          <Stop offset="50%" stopColor={neon.pink} stopOpacity={0.08} />
          <Stop offset="100%" stopColor={neon.pink} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect fill="url(#glow-violet)" height={height} width={width} />
      <Rect fill="url(#glow-pink)" height={height} width={width} />
    </Svg>
  );
}
