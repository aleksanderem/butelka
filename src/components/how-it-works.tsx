import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { NeonCard } from "@/components/neon-card";
import { neon } from "@/theme/colors";

const STEPS: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }[] = [
  { icon: "people", color: neon.purpleBright, label: "Karta „Ty” krąży wśród graczy" },
  { icon: "trophy", color: neon.gold, label: "Wylosuje się Szczęśliwiec" },
  { icon: "albums", color: neon.pink, label: "Wybiera: Prawda lub Wyzwanie" },
];

export function HowItWorks() {
  return (
    <NeonCard className="gap-4">
      <Text className="text-center text-base font-bold text-foreground">Jak to działa?</Text>
      <View className="flex-row items-start justify-between">
        {STEPS.map((step, index) => (
          <View key={step.label} className="flex-1 flex-row items-start">
            <View className="flex-1 items-center gap-2 px-1">
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: `${step.color}22`,
                  borderRadius: 24,
                  height: 48,
                  justifyContent: "center",
                  width: 48,
                }}
              >
                <Ionicons color={step.color} name={step.icon} size={24} />
              </View>
              <Text className="text-center text-xs font-medium text-muted">{step.label}</Text>
            </View>
            {index < STEPS.length - 1 ? (
              <Ionicons
                color={neon.textMuted}
                name="chevron-forward"
                size={16}
                style={{ marginTop: 16 }}
              />
            ) : null}
          </View>
        ))}
      </View>
    </NeonCard>
  );
}
