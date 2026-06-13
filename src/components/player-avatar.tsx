import LottieView from "lottie-react-native";
import { Text, View } from "react-native";

import { avatarSources } from "@/game/avatars";
import type { AvatarId, Player } from "@/game/types";
import { neon, playerPalette, type PlayerColorId } from "@/theme/colors";

type Size = "sm" | "md" | "lg" | "xl";

const dims: Record<Size, { box: number; ring: number }> = {
  sm: { box: 48, ring: 2 },
  md: { box: 64, ring: 2.5 },
  lg: { box: 72, ring: 3 },
  xl: { box: 96, ring: 3.5 },
};

type AvatarVisualProps = {
  avatarId: AvatarId;
  colorId: PlayerColorId;
  size?: Size;
  active?: boolean;
  dimmed?: boolean;
  /** Czy odtwarzać animację (domyślnie tylko aktywny lub duży podgląd — oszczędza CPU). */
  animate?: boolean;
};

/** Animowany avatar-maskotka (Lottie) w kolorowym kółku z ringiem. */
export function AvatarVisual({
  avatarId,
  colorId,
  size = "md",
  active = false,
  dimmed = false,
  animate,
}: AvatarVisualProps) {
  const { box, ring } = dims[size];
  const color = playerPalette[colorId];
  const playing = animate ?? (active || size === "xl");
  const inner = box - ring * 2;

  return (
    <View
      style={[
        {
          alignItems: "center",
          backgroundColor: neon.surfaceRaised,
          borderColor: active ? color : `${color}66`,
          borderRadius: box / 2,
          borderWidth: active ? ring + 1 : ring,
          height: box,
          justifyContent: "center",
          opacity: dimmed ? 0.45 : 1,
          overflow: "hidden",
          width: box,
        },
        active
          ? {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 14,
              elevation: 10,
            }
          : null,
      ]}
    >
      <LottieView
        autoPlay={playing}
        loop={playing}
        resizeMode="cover"
        source={avatarSources[avatarId]}
        style={{ height: inner * 1.15, width: inner * 1.15 }}
      />
    </View>
  );
}

type PlayerAvatarProps = {
  player: Player;
  size?: Size;
  active?: boolean;
  dimmed?: boolean;
  /** Pokaż imię pod avatarem. */
  showName?: boolean;
};

/** Avatar gracza z opcjonalnym podpisem imienia (rząd graczy w pokoju). */
export function PlayerAvatar({
  player,
  size = "md",
  active = false,
  dimmed = false,
  showName = false,
}: PlayerAvatarProps) {
  return (
    <View className="items-center gap-1.5">
      <AvatarVisual
        active={active}
        avatarId={player.avatarId}
        colorId={player.colorId}
        dimmed={dimmed}
        size={size}
      />
      {showName ? (
        <Text
          numberOfLines={1}
          style={{ color: active ? neon.white : neon.textMuted }}
          className="max-w-16 text-center text-xs font-semibold"
        >
          {player.isSelf ? "Ty" : player.name}
        </Text>
      ) : null}
    </View>
  );
}
