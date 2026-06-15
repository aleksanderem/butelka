import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { CATEGORY_IMAGES } from "@/game/category-images";
import { ADULT_MODE_GROUPS, cleanCardText } from "@/game/content-selection";
import type { Card, Category } from "@/game/content-types";
import { ageBadge, type MainCategory } from "@/game/main-categories";
import type { ChallengeType } from "@/game/types";
import type { GameApi } from "@/game/use-game";
import { neon } from "@/theme/colors";

type TabId = "preview" | "subs";
const PREVIEW_LIMIT = 24;
const TYPE_MATCH: Record<ChallengeType, Card["cardType"][]> = {
  prawda: ["truth"],
  wyzwanie: ["dare", "choice"],
};

/** Pełnoekranowy widok szczegółów głównej kategorii: nagłówek + taby + dolny pasek Prawda/Wyzwanie. */
export function CategoryDetailScreen({
  category,
  game,
  onBack,
}: {
  category: MainCategory;
  game: GameApi;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<TabId>("preview");
  const [previewType, setPreviewType] = useState<ChallengeType>("prawda");
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [shuffled, setShuffled] = useState<Card[] | null>(null);

  const bundle = game.contentBundle;
  const image: ImageSourcePropType | undefined = CATEGORY_IMAGES[category.key];
  const locked = ADULT_MODE_GROUPS.has(category.key) && !game.ageVerified;

  const subs: Category[] = bundle
    ? bundle.categories
        .filter((c) => c.modeGroup === category.key && c.enabled)
        .sort((a, b) => a.order - b.order)
    : [];
  const cardCount = bundle ? bundle.cards.filter((c) => c.modeGroup === category.key).length : 0;

  const pool = useMemo(() => {
    if (!bundle) return [] as Card[];
    const want = TYPE_MATCH[previewType];
    return bundle.cards.filter(
      (c) =>
        c.modeGroup === category.key &&
        want.includes(c.cardType) &&
        (selectedSub ? c.categoryId === selectedSub : true)
    );
  }, [bundle, category.key, previewType, selectedSub]);

  const sample = (shuffled ?? pool).slice(0, PREVIEW_LIMIT);

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

  const showBottomTabs = tab === "preview" && !locked;

  return (
    <View className="flex-1" style={{ backgroundColor: neon.bg }}>
      {/* Nagłówek z obrazem. */}
      <View className="overflow-hidden" style={{ height: 180 }}>
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
        <LinearGradient
          colors={["rgba(5,3,12,0.55)", "transparent", "rgba(5,3,12,0.95)"]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          accessibilityLabel="Wróć"
          accessibilityRole="button"
          className="absolute left-4 top-3 h-10 w-10 items-center justify-center rounded-full"
          onPress={onBack}
          style={{ backgroundColor: "rgba(5,3,12,0.5)" }}
        >
          <Ionicons color={neon.white} name="arrow-back" size={22} />
        </Pressable>
        <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-2 px-5 pb-3">
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

      <View className="flex-1 gap-3 px-5 pt-3" style={{ backgroundColor: neon.bg }}>
        <Text className="text-sm leading-5 text-muted">{category.descriptionPl}</Text>

        <View className="flex-row gap-2">
          <TabButton
            active={tab === "preview"}
            icon="documents-outline"
            label="Podgląd kart"
            onPress={() => setTab("preview")}
          />
          <TabButton
            active={tab === "subs"}
            icon="albums-outline"
            label={`Podkategorie (${subs.length})`}
            onPress={() => setTab("subs")}
          />
        </View>

        {tab === "preview" ? (
          locked ? (
            <View className="flex-1 items-center justify-center gap-3 px-4">
              <Text style={{ fontSize: 40 }}>🔞</Text>
              <Text className="text-center text-xs leading-5 text-muted">
                Treści 18+. Potwierdź wiek, aby podejrzeć karty z tej kategorii.
              </Text>
              <NeonButton label="Mam 18+" onPress={game.verifyAge} variant="pink" />
            </View>
          ) : (
            <View className="flex-1 gap-3">
              {subs.length > 0 ? (
                <SubcategorySelect
                  accent={category.accent}
                  onSelect={changeSub}
                  selectedSub={selectedSub}
                  subs={subs}
                />
              ) : null}

              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted">{sample.length} przykładów</Text>
                {sample.length > 0 ? (
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

              <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 16, gap: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {sample.length > 0 ? (
                  sample.map((card) => (
                    <View
                      className="rounded-2xl px-3.5 py-3"
                      key={card.cardId}
                      style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <Text className="text-sm leading-5 text-foreground">
                        {cleanCardText(card.textPl)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="py-4 text-center text-xs text-muted">
                    {bundle ? "Brak kart tego typu." : "Ładuję karty…"}
                  </Text>
                )}
              </ScrollView>
            </View>
          )
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24, gap: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-xs text-muted">Łącznie {cardCount} kart w tej kategorii.</Text>
            {subs.map((sub) => (
              <View
                className="flex-row items-center gap-2 rounded-2xl px-3.5 py-3"
                key={sub.categoryId}
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <Text className="flex-1 text-sm font-semibold text-foreground">{sub.namePl}</Text>
                {sub.requiresAcceptance ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons color={category.accent} name="warning" size={13} />
                    <Text className="text-[10px]" style={{ color: category.accent }}>
                      18+
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {showBottomTabs ? (
        <View className="flex-row gap-2 px-5 pb-6 pt-3">
          <BottomTab
            accent={category.accent}
            label="Prawda"
            onPress={() => changeType("prawda")}
            selected={previewType === "prawda"}
          />
          <BottomTab
            accent={category.accent}
            label="Wyzwanie"
            onPress={() => changeType("wyzwanie")}
            selected={previewType === "wyzwanie"}
          />
        </View>
      ) : null}
    </View>
  );
}

function SubcategorySelect({
  subs,
  selectedSub,
  accent,
  onSelect,
}: {
  subs: Category[];
  selectedSub: string | null;
  accent: string;
  onSelect: (s: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedName = selectedSub
    ? (subs.find((s) => s.categoryId === selectedSub)?.namePl ?? "Wszystkie podkategorie")
    : "Wszystkie podkategorie";

  const choose = (s: string | null) => {
    onSelect(s);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-2xl px-3.5 py-3"
        onPress={() => setOpen((v) => !v)}
        style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: accent, borderWidth: 1 }}
      >
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {selectedName}
        </Text>
        <Ionicons color={accent} name={open ? "chevron-up" : "chevron-down"} size={16} />
      </Pressable>

      {open ? (
        <View
          className="mt-1 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: neon.surfaceRaised,
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            maxHeight: 260,
          }}
        >
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <SelectOption
              accent={accent}
              label="Wszystkie podkategorie"
              onPress={() => choose(null)}
              selected={selectedSub === null}
            />
            {subs.map((sub) => (
              <SelectOption
                accent={accent}
                key={sub.categoryId}
                label={sub.namePl}
                onPress={() => choose(sub.categoryId)}
                selected={selectedSub === sub.categoryId}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function SelectOption({
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
      className="flex-row items-center justify-between rounded-2xl px-3.5 py-3"
      onPress={onPress}
      style={{ backgroundColor: selected ? `${accent}22` : "transparent" }}
    >
      <Text
        className="flex-1 text-sm"
        style={{ color: selected ? accent : neon.white, fontWeight: selected ? "700" : "400" }}
      >
        {label}
      </Text>
      {selected ? <Ionicons color={accent} name="checkmark" size={18} /> : null}
    </Pressable>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5"
      onPress={onPress}
      style={{ backgroundColor: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)" }}
    >
      <Ionicons color={active ? neon.purpleBright : neon.textMuted} name={icon} size={16} />
      <Text
        className="text-xs font-semibold"
        numberOfLines={1}
        style={{ color: active ? neon.white : neon.textMuted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BottomTab({
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
      className="flex-1 items-center rounded-2xl py-3.5"
      onPress={onPress}
      style={{ backgroundColor: selected ? accent : "rgba(255,255,255,0.05)" }}
    >
      <Text
        className="text-base font-extrabold"
        style={{ color: selected ? neon.white : neon.textMuted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
