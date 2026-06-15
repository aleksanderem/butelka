import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";

const BG_SOURCE = require("../../assets/animated/bg-loop.mp4");

/**
 * Pętlowe, wyciszone tło wideo (neonowe cząstki). Pełni rolę warstwy dekoracyjnej pod treścią —
 * `pointerEvents="none"`, więc dotyk przechodzi do UI. Domyślnie przygaszone, by tekst był czytelny.
 */
export function VideoBackdrop({ opacity = 0.5 }: { opacity?: number }) {
  const player = useVideoPlayer(BG_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <VideoView
        contentFit="cover"
        nativeControls={false}
        player={player}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
