import { Alert } from "heroui-native";
import { Pressable, StyleSheet, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { t } from "@/game/ui-strings";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

/** Bramka potwierdzenia przed wyjściem z pokoju — komunikat jako heroui Alert.
 *  Samodzielny overlay (NIE heroui Dialog), bo Dialog na webie nie usuwa zawartości portalu
 *  przy zamknięciu. Tu render jest warunkowy: gdy zamknięty, znika z drzewa — pewne na każdej
 *  platformie. */
export function LeaveConfirmDialog({ game }: { game: GameApi }) {
  if (!game.confirmLeaveOpen) {
    return null;
  }
  return (
    <View
      className="items-center justify-center px-6"
      style={[StyleSheet.absoluteFill, { zIndex: 50, backgroundColor: "rgba(4,2,10,0.62)" }]}
    >
      {/* Backdrop — dotknięcie poza kartą zamyka (jak „Zostań"). */}
      <Pressable
        accessibilityLabel={t("leaveConfirmDialog.closeAccessibilityLabel")}
        onPress={() => game.setConfirmLeaveOpen(false)}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="w-full max-w-xl gap-4 rounded-3xl p-5"
        style={{
          backgroundColor: neon.surface,
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
        }}
      >
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t("leaveConfirmDialog.title")}</Alert.Title>
            <Alert.Description>
              {t("leaveConfirmDialog.description")}
            </Alert.Description>
          </Alert.Content>
        </Alert>

        <View className="flex-row gap-3">
          <NeonButton
            className="flex-1"
            label={t("leaveConfirmDialog.stayButton")}
            onPress={() => game.setConfirmLeaveOpen(false)}
            variant="ghost"
          />
          <NeonButton className="flex-1" label={t("leaveConfirmDialog.leaveButton")} onPress={game.leaveRoom} variant="pink" />
        </View>
      </View>
    </View>
  );
}
