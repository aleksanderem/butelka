import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AvatarVisual } from "@/components/player-avatar";
import type { AvatarId } from "@/game/types";
import { playerPalette, type PlayerColorId } from "@/theme/colors";

type SelectableAvatarProps = {
  avatarId: AvatarId;
  colorId: PlayerColorId;
  selected: boolean;
  onPress: () => void;
  /** Bok avatara w px (siatka responsywna). Domyślnie 72 (= preset „lg"). */
  size?: number;
};

export function SelectableAvatar({
  avatarId,
  colorId,
  selected,
  onPress,
  size = 72,
}: SelectableAvatarProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View>
        <AvatarVisual active={selected} avatarId={avatarId} colorId={colorId} size={size} />
        {selected ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: playerPalette[colorId],
              borderColor: "#16121F",
              borderRadius: 11,
              borderWidth: 2,
              bottom: -2,
              height: 22,
              justifyContent: "center",
              position: "absolute",
              right: -2,
              width: 22,
            }}
          >
            <Ionicons color="#FFFFFF" name="checkmark" size={13} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
