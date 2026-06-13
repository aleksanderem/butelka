import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";

import { GameCard } from "@/components/game-card";
import type { Player } from "@/game/types";

/** Maks. liczba kart w wachlarzu — powyżej i tak pokazujemy 5. */
const MAX = 5;
const ANGLE = 10; // stopnie rotacji na pozycję od środka
const X_STEP = 34; // px przesunięcia poziomego
const Y_STEP = 11; // px obniżenia kart bocznych (łuk)
const CARD_W = 160;
const CARD_H = 220;
const SPRING = { damping: 15, mass: 0.9, stiffness: 150 };

const CONTAINER_W = CARD_W + (MAX - 1) * X_STEP + 36;
const CONTAINER_H = CARD_H + Math.floor(MAX / 2) * Y_STEP + 80;
const LEFT = (CONTAINER_W - CARD_W) / 2;
const TOP = (CONTAINER_H - CARD_H) / 2;

/** Wachlarz kart graczy (po jednej karcie na gracza, do 5). Nowa karta „wskakuje”,
 *  a pozostałe spring-em przesuwają się na nowe pozycje. */
export function CardFan({ players }: { players: Player[] }) {
  const shown = players.slice(0, MAX);
  const total = shown.length;
  const frontIndex = Math.round((total - 1) / 2);

  return (
    <View style={{ height: CONTAINER_H, width: CONTAINER_W }}>
      {shown.map((player, index) => (
        <FanCard
          index={index}
          key={player.id}
          player={player}
          prominent={index === frontIndex}
          total={total}
        />
      ))}
    </View>
  );
}

function FanCard({
  index,
  total,
  player,
  prominent,
}: {
  index: number;
  total: number;
  player: Player;
  prominent: boolean;
}) {
  const center = (total - 1) / 2;
  const offset = index - center;
  const depth = Math.abs(offset);
  const targetRot = offset * ANGLE;
  const targetX = offset * X_STEP;
  const targetY = depth * Y_STEP;
  const targetScale = prominent ? 1 : Math.max(0.76, 1 - depth * 0.11);
  const zIndex = MAX - Math.round(depth * 2);

  // Głębia: tylne karty mniejsze, ciemniejsze i rozmyte; przednia (prominent) ostra.
  const blur = prominent ? 0 : Math.min(46, Math.round(depth * 18));
  const dim = prominent ? 0 : Math.min(0.45, depth * 0.2);

  const rot = useSharedValue(targetRot);
  const tx = useSharedValue(targetX);
  const ty = useSharedValue(targetY);
  const sc = useSharedValue(targetScale);

  useEffect(() => {
    rot.value = withSpring(targetRot, SPRING);
    tx.value = withSpring(targetX, SPRING);
    ty.value = withSpring(targetY, SPRING);
    sc.value = withSpring(targetScale, SPRING);
  }, [targetRot, targetX, targetY, targetScale, rot, tx, ty, sc]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotateZ: `${rot.value}deg` },
      { scale: sc.value },
    ],
  }));

  return (
    // Zewnętrzny View = entering (wskakiwanie nowej karty); wewnętrzny = transform (układ wachlarza).
    <Animated.View
      entering={ZoomIn.springify().damping(13).stiffness(170)}
      style={{ left: LEFT, position: "absolute", top: TOP, zIndex }}
    >
      <Animated.View style={animatedStyle}>
        <GameCard
          animate={prominent}
          avatarId={player.avatarId}
          blur={blur}
          colorId={player.colorId}
          dim={dim}
          label={player.isSelf ? "Ty" : player.name}
        />
      </Animated.View>
    </Animated.View>
  );
}
