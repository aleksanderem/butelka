import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { CATEGORY_IMAGES } from "@/game/category-images";
import { ADULT_MODE_GROUPS } from "@/game/content-selection";
import type { Card, ContentBundle } from "@/game/content-types";
import { ageBadge, type MainCategory } from "@/game/main-categories";
import type { ChallengeType } from "@/game/types";
import { neon } from "@/theme/colors";

const PREVIEW_LIMIT = 24;
const TYPE_MATCH: Record<ChallengeType, Card["cardType"][]> = {
  prawda: ["truth"],
  wyzwanie: ["dare", "choice"],
};

/** Pełnoekranowy arkusz szczegółów głównej kategorii: obraz + podkategorie + PODGLĄD kart. */
export function CategoryDetailSheet({
  category,
  bundle,
  ageVerified,
  onVerifyAge,
  onClose,
}: {
  category: MainCategory | null;
  bundle: ContentBundle | null;
  ageVerified: boolean;
  onVerifyAge: () => void;
  onClose: () => void;
}) {
  const [previewType, setPreviewType] = useState<ChallengeType>("prawda");
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [shuffled, setShuffled] = useState<Card[] | null>(null);

  const pool = useMemo(() => {
    if (!bundle || !category) return [] as Card[];
    const want = TYPE_MATCH[previewType];
    return bundle.cards.filter(
      (c) =>
        c.modeGroup === category.key &&
        want.includes(c.cardType) &&
        (selectedSub ? c.categoryId === selectedSub : true)
    );
  }, [bundle, category, previewType, selectedSub]);

  const sample = (shuffled ?? pool).slice(0, PREVIEW_LIMIT);

  // Math.random tylko w handlerze (nie podczas renderu — purity React Compilera).
  const reshuffle = () => {
    const arr = pool.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
  };
  const changeType = (t: ChallengeType) => {
    setPreviewType(t);
    setShuffled(null);
  };
  const changeSub = (s: string | null) => {
    setSelectedSub(s);
    setShuffled(null);
  };

  if (!category) {
    return null;
  }

  const image: ImageSourcePropType | undefined = CATEGORY_IMAGES[category.key];
  const subs = bundle
    ? bundle.categories
        .filter((c) => c.modeGroup === category.key && c.enabled)
        .sort((a, b) => a.order - b.order)
    : [];
  const cardCount = bundle ? bundle.cards.filter((c) => c.modeGroup === category.key).length : null;
  const locked = ADULT_MODE_GROUPS.has(category.key) && !ageVerified;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 60, backgroundColor: "rgba(4,2,10,0.6)" }]}>
      <Pressable accessibilityLabel="Zamknij" onPress={onClose} style={StyleSheet.absoluteFill} />

      <View
        className="mt-auto overflow-hidden rounded-t-3xl"
        style={{ maxHeight: "90%", backgroundColor: neon.bg }}
      >
        {image ? (
          <Image resizeMode="cover" source={image} style={StyleSheet.absoluteFill} />
        ) : (
          <LinearGradient
            colors={category.gradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={{ height: 170 }}>
          <LinearGradient
            colors={["rgba(5,3,12,0.45)", "transparent"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70 }}
          />
          <LinearGradient
            colors={["transparent", "rgba(5,3,12,0.75)"]}
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90 }}
          />
          <Pressable
            accessibilityLabel="Zamknij"
            accessibilityRole="button"
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full"
            hitSlop={8}
            onPress={onClose}
            style={{ backgroundColor: "rgba(5,3,12,0.55)" }}
          >
            <Ionicons color={neon.white} name="close" size={20} />
          </Pressable>
          <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-2 p-4">
            <Text className="text-2xl font-extrabold text-white">{category.namePl}</Text>
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: "rgba(5,3,12,0.6)" }}
            >
              <Text className="text-[11px] font-bold" style={{ color: category.accent }}>
                {ageBadge(category.ageGate)}
              </Text>
            </View>
          </View>
        </View>

        <View className="overflow-hidden rounded-t-3xl">
          <BlurView
            intensity={60}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(9,6,17,0.82)" }]}
          />

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 16 }}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 460 }}
          >
            <Text className="text-sm leading-6 text-foreground">{category.descriptionPl}</Text>

            {/* Podkategorie — tappable: filtrują podgląd. */}
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-foreground">
                  Podkategorie ({subs.length})
                </Text>
                {cardCount !== null ? (
                  <Text className="text-xs font-semibold" style={{ color: category.accent }}>
                    {cardCount} kart
                  </Text>
                ) : null}
              </View>
              {subs.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  <FilterChip
                    accent={category.accent}
                    label="Wszystkie"
                    onPress={() => changeSub(null)}
                    selected={selectedSub === null}
                  />
                  {subs.map((sub) => (
                    <FilterChip
                      accent={category.accent}
                      key={sub.categoryId}
                      label={sub.namePl}
                      onPress={() => changeSub(sub.categoryId)}
                      selected={selectedSub === sub.categoryId}
                    />
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-muted">Ładuję podkategorie…</Text>
              )}
            </View>

            <Separator />

            {/* Podgląd kart. */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-foreground">Podgląd treści</Text>
                {!locked && sample.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center gap-1"
                    hitSlop={8}
                    onPress={reshuffle}
                  >
                    <Ionicons color={category.accent} name="shuffle" size={14} />
                    <Text className="text-xs font-semibold" style={{ color: category.accent }}>
                      Losuj inne
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {locked ? (
                <View className="items-center gap-3 rounded-2xl px-4 py-6">
                  <Text style={{ fontSize: 32 }}>🔞</Text>
                  <Text className="text-center text-xs leading-5 text-muted">
                    Treści 18+. Potwierdź wiek, aby podejrzeć karty z tej kategorii.
                  </Text>
                  <NeonButton label="Mam 18+" onPress={onVerifyAge} variant="pink" />
                </View>
              ) : (
                <>
                  <View
                    className="flex-row gap-1 rounded-2xl p-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <Segment
                      accent={category.accent}
                      label="Prawda"
                      onPress={() => changeType("prawda")}
                      selected={previewType === "prawda"}
                    />
                    <Segment
                      accent={category.accent}
                      label="Wyzwanie"
                      onPress={() => changeType("wyzwanie")}
                      selected={previewType === "wyzwanie"}
                    />
                  </View>

                  {sample.length > 0 ? (
                    <View className="gap-2">
                      {sample.map((card) => (
                        <View
                          className="rounded-2xl px-3.5 py-3"
                          key={card.cardId}
                          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          <Text className="text-sm leading-5 text-foreground">{card.textPl}</Text>
                        </View>
                      ))}
                      <Text className="pt-1 text-center text-[10px] text-muted">
                        Losowa próbka — w grze kart jest więcej.
                      </Text>
                    </View>
                  ) : (
                    <Text className="py-4 text-center text-xs text-muted">
                      {bundle ? "Brak kart tego typu w wyborze." : "Ładuję karty…"}
                    </Text>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function Separator() {
  return <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />;
}

function FilterChip({
  label,
  selected,
  accent,
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-full px-3 py-1.5"
      onPress={onPress}
      style={{
        backgroundColor: selected ? `${accent}33` : "rgba(255,255,255,0.06)",
        borderColor: selected ? accent : "rgba(255,255,255,0.08)",
        borderWidth: 1,
      }}
    >
      <Text
        className="text-xs"
        style={{ color: selected ? accent : neon.textMuted, fontWeight: selected ? "700" : "400" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Segment({
  label,
  selected,
  accent,
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="flex-1 items-center rounded-xl py-2"
      onPress={onPress}
      style={{ backgroundColor: selected ? accent : "transparent" }}
    >
      <Text className="text-sm font-bold" style={{ color: selected ? neon.white : neon.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}
