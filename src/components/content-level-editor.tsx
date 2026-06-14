import { Ionicons } from "@expo/vector-icons";
import { Separator, Slider } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  CONTENT_LEVELS,
  LEVEL_LABELS,
  intensityCapForLevel,
  type ContentLevel,
  type ContentSelection,
} from "@/game/content-selection";
import type { ContentBundle } from "@/game/content-types";
import { MAIN_CATEGORIES, ageBadge } from "@/game/main-categories";
import { neon } from "@/theme/colors";

function toIndex(value: number | number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : value;
}

/** Edytor doboru treści: 7 głównych kategorii, każda z suwakiem Wył.→Łagodne→Mocniejsze→Pełne. */
export function ContentLevelEditor({
  bundle,
  selection,
  onSetLevel,
}: {
  bundle: ContentBundle | null;
  selection: ContentSelection;
  onSetLevel: (modeKey: string, level: ContentLevel) => void;
}) {
  const poolCount = bundle
    ? bundle.cards.filter((card) => {
        const level = (selection[card.modeKey] ?? 0) as ContentLevel;
        return level > 0 && card.intensity <= intensityCapForLevel(level);
      }).length
    : null;

  return (
    <View className="gap-4">
      <View className="gap-3">
        {MAIN_CATEGORIES.map((cat, i) => {
          const level = (selection[cat.key] ?? 0) as ContentLevel;
          const count = bundle
            ? bundle.categories.filter((c) => c.modeKey === cat.key).length
            : null;
          return (
            <View key={cat.key}>
              {i > 0 ? <Separator className="mb-3 opacity-50" /> : null}
              <ContentLevelRow
                accent={cat.accent}
                ageLabel={ageBadge(cat.ageGate)}
                level={level}
                name={cat.namePl}
                onChange={(next) => onSetLevel(cat.key, next)}
                subCount={count}
              />
            </View>
          );
        })}
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
              ? `W puli: ${poolCount} kart z wybranych kategorii.`
              : "Brak kart — włącz przynajmniej jedną kategorię."}
        </Text>
      </View>
    </View>
  );
}

function ContentLevelRow({
  name,
  ageLabel,
  accent,
  level,
  subCount,
  onChange,
}: {
  name: string;
  ageLabel: string;
  accent: string;
  level: ContentLevel;
  subCount: number | null;
  onChange: (level: ContentLevel) => void;
}) {
  // Lokalny indeks dla płynnego suwaka; zapis dopiero po puszczeniu.
  const [idx, setIdx] = useState<number>(level);
  const current = (idx as ContentLevel) ?? 0;
  const on = current > 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: on ? accent : "rgba(255,255,255,0.18)" }}
          />
          <Text className="text-sm font-semibold text-foreground">{name}</Text>
          <View
            className="rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <Text className="text-[10px] font-bold text-muted">{ageLabel}</Text>
          </View>
        </View>
        <Text className="text-xs font-bold" style={{ color: on ? accent : neon.textMuted }}>
          {LEVEL_LABELS[current]}
        </Text>
      </View>
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
      {subCount !== null ? (
        <Text className="text-[10px] text-muted">{subCount} podkategorii</Text>
      ) : null}
    </View>
  );
}
