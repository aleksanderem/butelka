import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GameCard } from "@/components/game-card";
import type { Player } from "@/game/types";
import { t } from "@/game/ui-strings";

const MAX = 5;
const CARD_W = 160;
const CARD_H = 220;
const CONTAINER_W = 344;
const CONTAINER_H = 272;
const LEFT = (CONTAINER_W - CARD_W) / 2;
const TOP = (CONTAINER_H - CARD_H) / 2;
const TIMING = { duration: 240, easing: Easing.out(Easing.cubic) };

/** Rozstaw kart zależny od liczby: mniej graczy = szerzej (widać więcej avatara i nazwy). */
function xStepFor(count: number): number {
  if (count <= 2) return 134; // 2 karty: prawie obok siebie (lekkie nachodzenie)
  if (count === 3) return 92;
  if (count === 4) return 62;
  return 50;
}

/** Wachlarz kart graczy (do 5). Karta „Ty" (tego telefonu) zawsze w środku i na wierzchu,
 *  reszta układa się symetrycznie wokół. Wachlarz jest zawsze wyśrodkowany. */
export function CardFan({ players }: { players: Player[] }) {
  const self = players.find((p) => p.isSelf);
  const others = players.filter((p) => !p.isSelf);
  const shownOthers = others.slice(0, self ? MAX - 1 : MAX);
  const list = self ? [self, ...shownOthers] : shownOthers;
  const xStep = xStepFor(list.length);

  // Sloty: „Ty" w środku, reszta naprzemiennie +1,-1,+2,-2. Następnie przesuwamy wszystkie
  // o średnią, żeby GRUPA była zawsze wyśrodkowana (też przy parzystej liczbie, np. 2 karty).
  const raw = list.map((player, i) => ({
    player,
    slot: i === 0 ? 0 : i % 2 === 1 ? Math.ceil(i / 2) : -Math.ceil(i / 2),
    prominent: self ? player.isSelf === true : i === 0,
  }));
  const avg = raw.reduce((sum, c) => sum + c.slot, 0) / raw.length;
  const cards = raw.map((c) => ({ ...c, slot: c.slot - avg }));

  return (
    <View style={{ height: CONTAINER_H, width: CONTAINER_W }}>
      {cards.map(({ player, slot, prominent }) => (
        <FanCard key={player.id} player={player} prominent={prominent} slot={slot} xStep={xStep} />
      ))}
    </View>
  );
}

function FanCard({
  player,
  slot,
  prominent,
  xStep,
}: {
  player: Player;
  slot: number;
  prominent: boolean;
  xStep: number;
}) {
  const depth = Math.abs(slot);
  const targetX = slot * xStep;
  const targetScale = prominent ? 1 : Math.max(0.8, 1 - depth * 0.09);
  // Karta „Ty" zawsze na samej górze; reszta według głębi.
  const zIndex = prominent ? 100 : MAX - depth;
  // Głębia: blur i przyciemnienie głównie na skrajnych (depth ≈ 2); środkowe ostre.
  const blur = prominent ? 0 : Math.round(Math.max(0, depth - 1) * 30);
  const dim = prominent ? 0 : Math.min(0.34, depth * 0.12);

  // Init na wartości docelowe -> zawsze poprawna pozycja/skala (nie gubi się przy przejściach).
  const tx = useSharedValue(targetX);
  const sc = useSharedValue(targetScale);
  const entered = useSharedValue(0);

  useEffect(() => {
    tx.value = withTiming(targetX, TIMING);
    sc.value = withTiming(targetScale, TIMING);
  }, [targetX, targetScale, tx, sc]);

  // Lekkie „wskakiwanie" (floor skali 0.88 — nawet bez ukończonej animacji karta ma dobrą wielkość).
  useEffect(() => {
    entered.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
  }, [entered]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { scale: sc.value * (0.88 + 0.12 * entered.value) }],
  }));

  return (
    <Animated.View style={[{ left: LEFT, position: "absolute", top: TOP, zIndex }, animatedStyle]}>
      <GameCard
        animate={prominent}
        avatarId={player.avatarId}
        blur={blur}
        colorId={player.colorId}
        dim={dim}
        label={player.isSelf ? t("cardFan.you") : player.name}
      />
    </Animated.View>
  );
}
