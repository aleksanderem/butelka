import { Text, View } from "react-native";

import { avatarPresets } from "@/game/data";
import type { AvatarId, Player } from "@/game/types";
import { neon, playerPalette, type PlayerColorId } from "@/theme/colors";

type Size = "sm" | "md" | "lg" | "xl";

const dims: Record<Size, { box: number; ring: number; font: number }> = {
  sm: { box: 48, ring: 2, font: 24 },
  md: { box: 64, ring: 2.5, font: 32 },
  lg: { box: 72, ring: 3, font: 36 },
  xl: { box: 96, ring: 3.5, font: 48 },
};

function faceFor(avatarId: AvatarId): string {
  return avatarPresets.find((preset) => preset.id === avatarId)?.face ?? "🙂";
}

type AvatarVisualProps = {
  avatarId: AvatarId;
  colorId: PlayerColorId;
  size?: Size;
  active?: boolean;
  dimmed?: boolean;
};

/** Czysto wizualny avatar (emoji-twarz w kolorowym kółku z ringiem). */
export function AvatarVisual({
  avatarId,
  colorId,
  size = "md",
  active = false,
  dimmed = false,
}: AvatarVisualProps) {
  const { box, ring, font } = dims[size];
  const color = playerPalette[colorId];

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
      <Text style={{ fontSize: font }}>{faceFor(avatarId)}</Text>
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
