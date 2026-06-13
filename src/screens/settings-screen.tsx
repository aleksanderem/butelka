import { Ionicons } from "@expo/vector-icons";
import { Switch } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { ApprovalThreshold, RoomSettings } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

type TabId = "general" | "gameplay" | "sounds";

const TABS: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: "general", icon: "settings-outline", label: "Ogólne" },
  { id: "gameplay", icon: "game-controller-outline", label: "Rozgrywka" },
  { id: "sounds", icon: "volume-high-outline", label: "Dźwięki" },
];

const THRESHOLDS: { id: ApprovalThreshold; label: string }[] = [
  { id: "off", label: "Bez zgody" },
  { id: "half", label: "Połowa" },
  { id: "majority", label: "Większość" },
  { id: "all", label: "Wszyscy" },
];

/** Pełnoekranowa podstrona ustawień pokoju (taby u góry). */
export function SettingsScreen({ game }: { game: GameApi }) {
  const [tab, setTab] = useState<TabId>("gameplay");

  return (
    <View className="flex-1 gap-4 px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityLabel="Wróć do pokoju"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => game.setSettingsOpen(false)}
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons color={neon.white} name="arrow-back" size={22} />
        </Pressable>
        <Text className="text-xl font-extrabold text-foreground">Ustawienia pokoju</Text>
      </View>

      <View className="flex-row gap-2">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5"
              key={item.id}
              onPress={() => setTab(item.id)}
              style={{ backgroundColor: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)" }}
            >
              <Ionicons
                color={active ? neon.purpleBright : neon.textMuted}
                name={item.icon}
                size={16}
              />
              <Text
                className="text-xs font-semibold"
                numberOfLines={1}
                style={{ color: active ? neon.white : neon.textMuted }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "gameplay" ? (
          <GameplayTab settings={game.settings} onChange={game.updateSettings} />
        ) : (
          <ComingSoon label={TABS.find((t) => t.id === tab)?.label ?? ""} />
        )}
      </ScrollView>
    </View>
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
    <View className="gap-5">
      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">Start rundy</Text>
        <SettingRow
          label="Runda startuje automatycznie (bez losowania przez hosta)"
          value={settings.autoStart}
          onChange={(v) => onChange({ autoStart: v })}
        />
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">Ile osób musi się zgodzić na…</Text>
        <ThresholdRow
          label="zmianę pytania"
          value={settings.nextTruthApproval}
          onChange={(v) => onChange({ nextTruthApproval: v })}
        />
        <ThresholdRow
          label="zmianę wyzwania"
          value={settings.nextDareApproval}
          onChange={(v) => onChange({ nextDareApproval: v })}
        />
        <ThresholdRow
          label="koniec tury (kolejka gracza)"
          value={settings.endTurnApproval}
          onChange={(v) => onChange({ endTurnApproval: v })}
        />
      </View>

      <Text className="text-xs leading-5 text-muted">
        „Bez zgody” wykonuje akcję od razu. „Połowa / Większość / Wszyscy” wymaga zgody danej części
        graczy w głosowaniu.
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

function ThresholdRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ApprovalThreshold;
  onChange: (value: ApprovalThreshold) => void;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm text-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-1.5">
        {THRESHOLDS.map((opt) => {
          const active = value === opt.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="rounded-full px-3 py-1.5"
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={{ backgroundColor: active ? neon.purpleBright : "rgba(255,255,255,0.06)" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: active ? "#FFFFFF" : neon.textMuted }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
