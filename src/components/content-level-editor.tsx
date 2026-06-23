import { Ionicons } from "@expo/vector-icons";
import { Separator, Slider, Switch } from "heroui-native";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { SubcategorySheet } from "@/components/subcategory-sheet";
import {
  ADULT_MODE_GROUPS,
  CONTENT_FILTERS,
  CONTENT_LEVELS,
  LEVEL_LABELS,
  cardPool,
  type ContentFilterId,
  type ContentLevel,
  type ContentSelection,
} from "@/game/content-selection";
import type { ContentBundle } from "@/game/content-types";
import { MAIN_CATEGORIES, ageBadge, mainName, type MainCategory } from "@/game/main-categories";
import { neon } from "@/theme/colors";

function toIndex(value: number | number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : value;
}

export interface ContentEditorApi {
  bundle: ContentBundle | null;
  selection: ContentSelection;
  onSetLevel: (modeGroup: string, level: ContentLevel) => void;
  onSetCategoryEnabled: (categoryId: string, enabled: boolean) => void;
  onSetFilter: (filterId: ContentFilterId, on: boolean) => void;
  ageVerified: boolean;
  onVerifyAge: () => void;
  acceptedCategories: string[];
  onAcceptCategory: (categoryId: string) => void;
  /** Czy kategoria premium jest zablokowana zakupem (true = pokaż kłódkę/cenę zamiast suwaka). */
  isPremiumLocked: (key: string) => boolean;
  /** Cena pojedynczej kategorii ze StoreKitu (np. "8,99 zł") lub null. */
  premiumPrice: (key: string) => string | null;
  /** Otwórz paywall dla danej kategorii premium. */
  onOpenPaywall: (key: string) => void;
}

/** Edytor doboru treści: 6 trybów (slider + podkategorie) + filtry + bramka wieku. */
export function ContentLevelEditor(api: ContentEditorApi) {
  const { bundle, selection } = api;
  const [subcatMode, setSubcatMode] = useState<MainCategory | null>(null);
  const [ageGateOpen, setAgeGateOpen] = useState(false);

  const poolCount = bundle
    ? cardPool(bundle, selection, "prawda").length + cardPool(bundle, selection, "wyzwanie").length
    : null;

  return (
    <View className="gap-4">
      <View className="gap-3">
        {MAIN_CATEGORIES.map((cat, i) => {
          const level = (selection.levels[cat.key] ?? 0) as ContentLevel;
          const total = bundle
            ? bundle.categories.filter((c) => c.modeGroup === cat.key && c.enabled).length
            : 0;
          const enabledCount = bundle
            ? bundle.categories.filter(
                (c) =>
                  c.modeGroup === cat.key &&
                  c.enabled &&
                  !selection.disabledCategories.includes(c.categoryId)
              ).length
            : 0;
          const locked = ADULT_MODE_GROUPS.has(cat.key) && !api.ageVerified;
          const premiumLocked = api.isPremiumLocked(cat.key);
          return (
            <View key={cat.key}>
              {i > 0 ? <Separator className="mb-3 opacity-50" /> : null}
              <ContentLevelRow
                accent={cat.accent}
                ageLabel={ageBadge(cat.ageGate)}
                enabledCount={enabledCount}
                level={level}
                locked={locked}
                name={mainName(cat)}
                onChange={(next) => api.onSetLevel(cat.key, next)}
                onOpenAgeGate={() => setAgeGateOpen(true)}
                onOpenPaywall={() => api.onOpenPaywall(cat.key)}
                onOpenSubcats={() => setSubcatMode(cat)}
                premiumLocked={premiumLocked}
                premiumPrice={api.premiumPrice(cat.key)}
                total={total}
              />
            </View>
          );
        })}
      </View>

      <Separator />

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">Filtry treści</Text>
        {CONTENT_FILTERS.map((f) => (
          <View className="flex-row items-center justify-between gap-3" key={f.id}>
            <Text className="flex-1 text-sm text-foreground">{f.namePl}</Text>
            <Switch
              isSelected={selection.filters[f.id] === true}
              onSelectedChange={(v) => api.onSetFilter(f.id, v)}
            />
          </View>
        ))}
      </View>

      <View
        className="flex-row items-center gap-2 rounded-2xl px-3.5 py-3"
        style={{ backgroundColor: "rgba(139,92,246,0.12)" }}
      >
        <Ionicons color={neon.purpleBright} name="albums-outline" size={18} />
        <Text className="flex-1 text-xs leading-5 text-foreground">
          {poolCount === null
            ? "Ładuję treści…"
            : poolCount > 0
              ? `W puli: ${poolCount} kart z wybranych treści.`
              : "Brak kart — włącz tryb albo poluzuj filtry."}
        </Text>
      </View>

      <SubcategorySheet
        acceptedCategories={api.acceptedCategories}
        bundle={bundle}
        mainCategory={subcatMode}
        onAcceptCategory={api.onAcceptCategory}
        onClose={() => setSubcatMode(null)}
        onSetCategoryEnabled={api.onSetCategoryEnabled}
        selection={selection}
      />

      {ageGateOpen ? (
        <AgeGateModal
          onCancel={() => setAgeGateOpen(false)}
          onConfirm={() => {
            api.onVerifyAge();
            setAgeGateOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

function ContentLevelRow({
  name,
  ageLabel,
  accent,
  level,
  locked,
  premiumLocked,
  premiumPrice,
  total,
  enabledCount,
  onChange,
  onOpenSubcats,
  onOpenAgeGate,
  onOpenPaywall,
}: {
  name: string;
  ageLabel: string;
  accent: string;
  level: ContentLevel;
  locked: boolean;
  premiumLocked: boolean;
  premiumPrice: string | null;
  total: number;
  enabledCount: number;
  onChange: (level: ContentLevel) => void;
  onOpenSubcats: () => void;
  onOpenAgeGate: () => void;
  onOpenPaywall: () => void;
}) {
  const [idx, setIdx] = useState<number>(level);
  const current = (idx as ContentLevel) ?? 0;
  const on = current > 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: on && !locked ? accent : "rgba(255,255,255,0.18)" }}
          />
          <Text className="text-sm font-semibold text-foreground">{name}</Text>
          <View
            className="rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <Text className="text-[10px] font-bold text-muted">{ageLabel}</Text>
          </View>
        </View>
        {!locked ? (
          <Text className="text-xs font-bold" style={{ color: on ? accent : neon.textMuted }}>
            {LEVEL_LABELS[current]}
          </Text>
        ) : null}
      </View>

      {locked ? (
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-2 rounded-2xl py-3"
          onPress={onOpenAgeGate}
          style={{ borderColor: "rgba(244,63,94,0.45)", borderWidth: 1.5 }}
        >
          <Text style={{ fontSize: 14 }}>🔞</Text>
          <Text className="text-sm font-bold" style={{ color: neon.magenta }}>
            Potwierdź wiek 18+, aby włączyć
          </Text>
        </Pressable>
      ) : premiumLocked ? (
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-2 rounded-2xl py-3"
          onPress={onOpenPaywall}
          style={{ borderColor: "rgba(192,132,252,0.5)", borderWidth: 1.5 }}
        >
          <Ionicons color={neon.purpleBright} name="lock-closed" size={15} />
          <Text className="text-sm font-bold" style={{ color: neon.purpleBright }}>
            {premiumPrice ? `Odblokuj — ${premiumPrice}` : "Odblokuj"}
          </Text>
        </Pressable>
      ) : (
        <>
          <Slider
            maxValue={CONTENT_LEVELS - 1}
            minValue={0}
            onChange={(v) => setIdx(toIndex(v))}
            onChangeEnd={(v) => {
              const i = toIndex(v);
              setIdx(i);
              onChange(i as ContentLevel);
            }}
            step={1}
            value={idx}
          >
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
          {on ? (
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-2xl px-3 py-2"
              onPress={onOpenSubcats}
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <Text className="text-xs text-muted">
                Podkategorie: {enabledCount}/{total}
              </Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-semibold" style={{ color: accent }}>
                  Wybierz
                </Text>
                <Ionicons color={accent} name="chevron-forward" size={13} />
              </View>
            </Pressable>
          ) : (
            <Text className="text-[10px] text-muted">{total} podkategorii</Text>
          )}
        </>
      )}
    </View>
  );
}

function AgeGateModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible>
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(4,2,10,0.8)" }}
      >
        <View
          className="w-full max-w-xl gap-4 rounded-3xl p-5"
          style={{
            backgroundColor: neon.surface,
            borderColor: "rgba(244,63,94,0.4)",
            borderWidth: 1,
          }}
        >
          <View className="items-center gap-2">
            <Text style={{ fontSize: 36 }}>🔞</Text>
            <Text className="text-lg font-extrabold text-foreground">Treści dla dorosłych</Text>
            <Text className="text-center text-sm leading-6 text-muted">
              Te tryby zawierają treści 18+ (flirt, dotyk, seksualne pytania). Potwierdź, że Ty i
              gracze macie ukończone 18 lat.
            </Text>
          </View>
          <View className="flex-row gap-3">
            <NeonButton className="flex-1" label="Nie" onPress={onCancel} variant="ghost" />
            <NeonButton className="flex-1" label="Mamy 18+" onPress={onConfirm} variant="pink" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
