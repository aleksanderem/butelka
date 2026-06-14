import { Ionicons } from "@expo/vector-icons";
import { Separator, Slider, Switch } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ContentLevelEditor } from "@/components/content-level-editor";
import type { ApprovalThreshold, RoomSettings } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

type TabId = "general" | "content" | "gameplay" | "sounds";

const TABS: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: "content", icon: "sparkles-outline", label: "Treści" },
  { id: "gameplay", icon: "game-controller-outline", label: "Rozgrywka" },
  { id: "sounds", icon: "volume-high-outline", label: "Dźwięki" },
];

/** Kolejność poziomów progu na suwaku: 0=brak zgody … 3=wszyscy. */
const THRESHOLD_ORDER: ApprovalThreshold[] = ["off", "half", "majority", "all"];
const THRESHOLD_LABEL: Record<ApprovalThreshold, string> = {
  off: "Bez zgody",
  half: "Połowa",
  majority: "Większość",
  all: "Wszyscy",
};

/** Pełnoekranowa podstrona ustawień pokoju (taby u góry). */
export function SettingsScreen({ game }: { game: GameApi }) {
  const [tab, setTab] = useState<TabId>("content");

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
              style={{
                backgroundColor: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
              }}
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
        {tab === "content" ? (
          <ContentTab game={game} />
        ) : tab === "gameplay" ? (
          <GameplayTab settings={game.settings} onChange={game.updateSettings} />
        ) : (
          <ComingSoon label={TABS.find((t) => t.id === tab)?.label ?? ""} />
        )}
      </ScrollView>
    </View>
  );
}

function ContentTab({ game }: { game: GameApi }) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">Z czego losujemy?</Text>
        <Text className="text-xs leading-5 text-muted">
          Wybierz główne kategorie i jak mocne treści mają z nich wpadać. Suwak: Wył. → Łagodne →
          Mocniejsze → Pełne. Możesz włączyć kilka naraz.
        </Text>
      </View>

      <ContentLevelEditor
        bundle={game.contentBundle}
        onSetLevel={game.setContentLevel}
        selection={game.contentSelection}
      />
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
    <View className="gap-4">
      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">Start rundy</Text>
        <SettingRow
          label="Runda startuje automatycznie (bez losowania przez hosta)"
          value={settings.autoStart}
          onChange={(v) => onChange({ autoStart: v })}
        />
      </View>

      <Separator />

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">Ile osób musi się zgodzić na…</Text>
        <ThresholdRow
          label="zmianę pytania"
          value={settings.nextTruthApproval}
          onChange={(v) => onChange({ nextTruthApproval: v })}
        />
        <Separator className="opacity-50" />
        <ThresholdRow
          label="zmianę wyzwania"
          value={settings.nextDareApproval}
          onChange={(v) => onChange({ nextDareApproval: v })}
        />
        <Separator className="opacity-50" />
        <ThresholdRow
          label="koniec tury (kolejka gracza)"
          value={settings.endTurnApproval}
          onChange={(v) => onChange({ endTurnApproval: v })}
        />
      </View>

      <Separator />

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

function toIndex(value: number | number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : value;
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
  // Lokalny indeks suwaka dla płynnego przesuwania; zapis do backendu dopiero po puszczeniu.
  const [idx, setIdx] = useState(() => Math.max(0, THRESHOLD_ORDER.indexOf(value)));
  const current = THRESHOLD_ORDER[idx] ?? "off";

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-foreground">{label}</Text>
        <Text className="text-xs font-bold" style={{ color: neon.purpleBright }}>
          {THRESHOLD_LABEL[current]}
        </Text>
      </View>
      <Slider
        maxValue={THRESHOLD_ORDER.length - 1}
        minValue={0}
        onChange={(v) => setIdx(toIndex(v))}
        onChangeEnd={(v) => {
          const i = toIndex(v);
          setIdx(i);
          onChange(THRESHOLD_ORDER[i] ?? "off");
        }}
        step={1}
        value={idx}
      >
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
      <View className="flex-row justify-between">
        <Text className="text-[10px] text-muted">Bez zgody</Text>
        <Text className="text-[10px] text-muted">Wszyscy</Text>
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
