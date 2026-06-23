import { Ionicons } from "@expo/vector-icons";
import { Separator, Slider, Switch } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ContentLevelEditor } from "@/components/content-level-editor";
import { t } from "@/game/ui-strings";
import { Paywall } from "@/components/paywall";
import type { ModeGroup } from "@/game/content-types";
import type { ApprovalThreshold, RoomSettings } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { isCategoryUnlocked } from "@/iap/entitlements";
import { CATEGORY_PRODUCT_ID, isPremiumCategory, type PremiumCategory } from "@/iap/products";
import { useIap } from "@/iap/use-iap";
import { neon } from "@/theme/colors";

type TabId = "general" | "content" | "gameplay" | "sounds";

// Funkcje (nie stałe): t() musi być wołane przy renderze, inaczej zamraża język z czasu importu.
const TABS = (): { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] => [
  { id: "content", icon: "sparkles-outline", label: t("settingsScreen.tabContent") },
  { id: "gameplay", icon: "game-controller-outline", label: t("settingsScreen.tabGameplay") },
  { id: "sounds", icon: "volume-high-outline", label: t("settingsScreen.tabSounds") },
];

/** Kolejność poziomów progu na suwaku: 0=brak zgody … 3=wszyscy. */
const THRESHOLD_ORDER: ApprovalThreshold[] = ["off", "half", "majority", "all"];
const THRESHOLD_LABEL = (): Record<ApprovalThreshold, string> => ({
  off: t("settingsScreen.thresholdOff"),
  half: t("settingsScreen.thresholdHalf"),
  majority: t("settingsScreen.thresholdMajority"),
  all: t("settingsScreen.thresholdAll"),
});

/** Presety czasu (s) na suwaku; 0 = licznik wyłączony. */
const TIME_OPTIONS = [0, 15, 30, 45, 60, 90, 120];
const timeLabel = (s: number): string => (s <= 0 ? t("settingsScreen.timerOff") : `${s}s`);

/** Pełnoekranowa podstrona ustawień pokoju (taby u góry). */
export function SettingsScreen({ game }: { game: GameApi }) {
  const [tab, setTab] = useState<TabId>("content");

  return (
    <View className="flex-1 gap-4 px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityLabel={t("settingsScreen.backToRoom")}
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => game.setSettingsOpen(false)}
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons color={neon.white} name="arrow-back" size={22} />
        </Pressable>
        <Text className="text-xl font-extrabold text-foreground">{t("settingsScreen.title")}</Text>
      </View>

      <View className="flex-row gap-2">
        {TABS().map((item) => {
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
          <GameplayTab
            onChange={game.updateSettings}
            settings={game.settings}
            singleDevice={game.singleDevice}
          />
        ) : (
          <ComingSoon label={TABS().find((t) => t.id === tab)?.label ?? ""} />
        )}
      </ScrollView>
    </View>
  );
}

function ContentTab({ game }: { game: GameApi }) {
  const { entitlements, priceFor } = useIap();
  const [paywallCat, setPaywallCat] = useState<PremiumCategory | null>(null);

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">
          {t("settingsScreen.contentSectionTitle")}
        </Text>
        <Text className="text-xs leading-5 text-muted">
          {t("settingsScreen.contentSectionHint")}
        </Text>
      </View>

      <ContentLevelEditor
        acceptedCategories={game.acceptedCategories}
        ageVerified={game.ageVerified}
        bundle={game.contentBundle}
        isPremiumLocked={(key) =>
          isPremiumCategory(key as ModeGroup) && !isCategoryUnlocked(key as ModeGroup, entitlements)
        }
        onAcceptCategory={game.acceptCategory}
        onOpenPaywall={(key) => {
          if (isPremiumCategory(key as ModeGroup)) {
            setPaywallCat(key as PremiumCategory);
          }
        }}
        onSetCategoryEnabled={game.setRoomCategoryEnabled}
        onSetFilter={game.setRoomFilter}
        onSetLevel={game.setContentLevel}
        onVerifyAge={game.verifyAge}
        premiumPrice={(key) =>
          isPremiumCategory(key as ModeGroup)
            ? priceFor(CATEGORY_PRODUCT_ID[key as PremiumCategory])
            : null
        }
        selection={game.contentSelection}
      />

      {paywallCat ? <Paywall category={paywallCat} onClose={() => setPaywallCat(null)} /> : null}
    </View>
  );
}

function GameplayTab({
  settings,
  onChange,
  singleDevice,
}: {
  settings: RoomSettings;
  onChange: (patch: Partial<RoomSettings>) => void;
  singleDevice: boolean;
}) {
  return (
    <View className="gap-4">
      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">
          {t("settingsScreen.roundStartTitle")}
        </Text>
        <SettingRow
          label={t("settingsScreen.autoStartLabel")}
          value={settings.autoStart}
          onChange={(v) => onChange({ autoStart: v })}
        />
      </View>

      <Separator />

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">
          {t("settingsScreen.answerTimeTitle")}
        </Text>
        <TimeRow
          label={t("settingsScreen.truthTimeLabel")}
          onChange={(v) => onChange({ truthSeconds: v })}
          value={settings.truthSeconds}
        />
        <Separator className="opacity-50" />
        <TimeRow
          label={t("settingsScreen.dareTimeLabel")}
          onChange={(v) => onChange({ dareSeconds: v })}
          value={settings.dareSeconds}
        />
        <Text className="text-xs leading-5 text-muted">{t("settingsScreen.timerHint")}</Text>
      </View>

      {singleDevice ? null : (
        <>
          <Separator />

          <View className="gap-3">
            <Text className="text-base font-bold text-foreground">
              {t("settingsScreen.approvalSectionTitle")}
            </Text>
            <ThresholdRow
              label={t("settingsScreen.approvalChangeQuestion")}
              value={settings.nextTruthApproval}
              onChange={(v) => onChange({ nextTruthApproval: v })}
            />
            <Separator className="opacity-50" />
            <ThresholdRow
              label={t("settingsScreen.approvalChangeDare")}
              value={settings.nextDareApproval}
              onChange={(v) => onChange({ nextDareApproval: v })}
            />
            <Separator className="opacity-50" />
            <ThresholdRow
              label={t("settingsScreen.approvalEndTurn")}
              value={settings.endTurnApproval}
              onChange={(v) => onChange({ endTurnApproval: v })}
            />
          </View>

          <Separator />

          <Text className="text-xs leading-5 text-muted">{t("settingsScreen.approvalHint")}</Text>
        </>
      )}
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
          {THRESHOLD_LABEL()[current]}
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
        <Text className="text-[10px] text-muted">{t("settingsScreen.thresholdOff")}</Text>
        <Text className="text-[10px] text-muted">{t("settingsScreen.thresholdAll")}</Text>
      </View>
    </View>
  );
}

function TimeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  // Lokalny indeks suwaka; zapis dopiero po puszczeniu (jak ThresholdRow).
  const [idx, setIdx] = useState(() => Math.max(0, TIME_OPTIONS.indexOf(value)));
  const current = TIME_OPTIONS[idx] ?? 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-foreground">{label}</Text>
        <Text className="text-xs font-bold" style={{ color: neon.purpleBright }}>
          {timeLabel(current)}
        </Text>
      </View>
      <Slider
        maxValue={TIME_OPTIONS.length - 1}
        minValue={0}
        onChange={(v) => setIdx(toIndex(v))}
        onChangeEnd={(v) => {
          const i = toIndex(v);
          setIdx(i);
          onChange(TIME_OPTIONS[i] ?? 0);
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
        <Text className="text-[10px] text-muted">{t("settingsScreen.timerOff")}</Text>
        <Text className="text-[10px] text-muted">120s</Text>
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
        <Text className="text-center text-sm text-muted">{t("settingsScreen.comingSoon")}</Text>
      </View>
    </View>
  );
}
