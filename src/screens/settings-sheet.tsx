import { Ionicons } from "@expo/vector-icons";
import { Dialog, Switch } from "heroui-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { RoomSettings } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

type TabId = "general" | "gameplay" | "sounds";

const TABS: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: "general", icon: "settings-outline", label: "Ogólne" },
  { id: "gameplay", icon: "game-controller-outline", label: "Rozgrywka" },
  { id: "sounds", icon: "volume-high-outline", label: "Dźwięki" },
];

export function SettingsSheet({ game }: { game: GameApi }) {
  const [tab, setTab] = useState<TabId>("gameplay");

  return (
    <Dialog isOpen={game.settingsOpen} onOpenChange={game.setSettingsOpen}>
      <Dialog.Portal unstable_accessibilityContainerViewIsModal>
        <Dialog.Overlay />
        <Dialog.Content className="w-full max-w-xl gap-4 bg-surface">
          <View className="flex-row items-center justify-between">
            <Dialog.Title>Ustawienia pokoju</Dialog.Title>
            <Dialog.Close
              accessibilityLabel="Zamknij ustawienia"
              className="h-9 w-9 rounded-full p-0"
              variant="tertiary"
            />
          </View>

          <View className="flex-row gap-4">
            <View className="w-32 gap-1.5">
              {TABS.map((item) => {
                const active = tab === item.id;
                return (
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center gap-2 rounded-xl px-3 py-2.5"
                    key={item.id}
                    onPress={() => setTab(item.id)}
                    style={{
                      backgroundColor: active ? "rgba(139,92,246,0.18)" : "transparent",
                    }}
                  >
                    <Ionicons
                      color={active ? neon.purpleBright : neon.textMuted}
                      name={item.icon}
                      size={18}
                    />
                    <Text
                      className="flex-1 text-xs font-semibold"
                      style={{ color: active ? neon.white : neon.textMuted }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-1 gap-4">
              {tab === "gameplay" ? (
                <GameplayTab settings={game.settings} onChange={game.updateSettings} />
              ) : (
                <ComingSoon label={TABS.find((t) => t.id === tab)?.label ?? ""} />
              )}
            </View>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

function GameplayTab({
  settings,
  onChange,
}: {
  settings: RoomSettings;
  onChange: (patch: Partial<RoomSettings>) => void;
}) {
  return (
    <View className="gap-4">
      <Text className="text-base font-bold text-foreground">Rozgrywka</Text>
      <SettingRow
        label="Zakończenie tury wymaga akceptacji przez innych graczy (większość)"
        value={settings.requireEndTurnApproval}
        onChange={(v) => onChange({ requireEndTurnApproval: v })}
      />
      <SettingRow
        label="Wybranie następnego pytania wymaga akceptacji przez innych graczy (większość)"
        value={settings.requireNextTruthApproval}
        onChange={(v) => onChange({ requireNextTruthApproval: v })}
      />
      <SettingRow
        label="Wybranie następnego wyzwania wymaga akceptacji przez innych graczy (większość)"
        value={settings.requireNextDareApproval}
        onChange={(v) => onChange({ requireNextDareApproval: v })}
      />
      <Text className="text-xs leading-5 text-muted">
        Jeśli opcja jest włączona, większość graczy musi zaakceptować akcję, aby została wykonana.
      </Text>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <Text className="flex-1 text-sm leading-5 text-foreground">{label}</Text>
      <Switch isSelected={value} onSelectedChange={onChange} />
    </View>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-foreground">{label}</Text>
      <View className="items-center gap-2 rounded-2xl border border-border bg-background px-4 py-8">
        <Ionicons color={neon.textMuted} name="construct-outline" size={24} />
        <Text className="text-center text-sm text-muted">Ta sekcja pojawi się wkrótce.</Text>
      </View>
    </View>
  );
}
