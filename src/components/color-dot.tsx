import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type ColorDotProps = {
  color: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
};

export function ColorDot({ color, selected, onPress, size = 44 }: ColorDotProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View
        style={[
          {
            alignItems: "center",
            backgroundColor: color,
            borderColor: selected ? "#FFFFFF" : "transparent",
            borderRadius: size / 2,
            borderWidth: 2.5,
            height: size,
            justifyContent: "center",
            width: size,
          },
          selected
            ? {
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.85,
                shadowRadius: 12,
                elevation: 8,
              }
            : null,
        ]}
      >
        {selected ? <Ionicons color="#FFFFFF" name="checkmark" size={22} /> : null}
      </View>
    </Pressable>
  );
}
