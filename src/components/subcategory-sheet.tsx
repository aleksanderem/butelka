import { Ionicons } from "@expo/vector-icons";
import { Switch } from "heroui-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { isCategoryEnabled, type ContentSelection } from "@/game/content-selection";
import type { Category, ContentBundle } from "@/game/content-types";
import type { MainCategory } from "@/game/main-categories";
import { neon } from "@/theme/colors";

/** Modal wyboru konkretnych podkategorii danego trybu + disclaimery (akceptacja przy włączeniu). */
export function SubcategorySheet({
  mainCategory,
  bundle,
  selection,
  acceptedCategories,
  onSetCategoryEnabled,
  onAcceptCategory,
  onClose,
}: {
  mainCategory: MainCategory | null;
  bundle: ContentBundle | null;
  selection: ContentSelection;
  acceptedCategories: string[];
  onSetCategoryEnabled: (categoryId: string, enabled: boolean) => void;
  onAcceptCategory: (categoryId: string) => void;
  onClose: () => void;
}) {
  // Kategoria, dla której pokazujemy ekran akceptacji przed włączeniem.
  const [pending, setPending] = useState<Category | null>(null);

  if (!mainCategory) {
    return null;
  }

  const cats = bundle
    ? bundle.categories
        .filter((c) => c.modeGroup === mainCategory.key && c.enabled)
        .sort((a, b) => a.order - b.order)
    : [];

  const toggle = (cat: Category, next: boolean) => {
    if (next && cat.requiresAcceptance && !acceptedCategories.includes(cat.categoryId)) {
      setPending(cat); // pokaż disclaimer, włączymy po akceptacji
      return;
    }
    onSetCategoryEnabled(cat.categoryId, next);
  };

  const acceptPending = () => {
    if (!pending) return;
    onAcceptCategory(pending.categoryId);
    onSetCategoryEnabled(pending.categoryId, true);
    setPending(null);
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(4,2,10,0.62)" }]}>
        <Pressable accessibilityLabel="Zamknij" onPress={onClose} style={StyleSheet.absoluteFill} />

        <View
          className="mt-auto gap-3 rounded-t-3xl px-5 pb-6 pt-4"
          style={{ backgroundColor: neon.surface, maxHeight: "82%" }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-extrabold text-foreground">{mainCategory.namePl}</Text>
              <Text className="text-xs text-muted">Wybierz podkategorie do losowania</Text>
            </View>
            <Pressable
              accessibilityLabel="Zamknij"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full"
              hitSlop={8}
              onPress={onClose}
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <Ionicons color={neon.white} name="close" size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {cats.length === 0 ? (
              <Text className="py-6 text-center text-sm text-muted">Ładuję podkategorie…</Text>
            ) : (
              cats.map((cat) => {
                const on = isCategoryEnabled(selection, cat.categoryId);
                return (
                  <View
                    className="flex-row items-center gap-3 rounded-2xl px-3.5 py-3"
                    key={cat.categoryId}
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-sm font-semibold text-foreground">{cat.namePl}</Text>
                        {cat.requiresAcceptance ? (
                          <Ionicons color={neon.magenta} name="warning" size={13} />
                        ) : null}
                      </View>
                    </View>
                    <Switch isSelected={on} onSelectedChange={(v) => toggle(cat, v)} />
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Ekran akceptacji (disclaimer) — przy włączaniu kategorii requiresAcceptance. */}
        {pending ? (
          <View
            style={[StyleSheet.absoluteFill, { zIndex: 80, backgroundColor: "rgba(4,2,10,0.78)" }]}
            className="items-center justify-center px-6"
          >
            <View
              className="w-full max-w-xl gap-4 rounded-3xl p-5"
              style={{
                backgroundColor: neon.surface,
                borderColor: "rgba(244,63,94,0.4)",
                borderWidth: 1,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons color={neon.magenta} name="alert-circle" size={22} />
                <Text className="flex-1 text-base font-extrabold" style={{ color: neon.magenta }}>
                  {pending.disclaimerTitlePl}
                </Text>
              </View>
              <Text className="text-sm leading-6 text-foreground">{pending.disclaimerBodyPl}</Text>
              <View className="flex-row gap-3">
                <NeonButton
                  className="flex-1"
                  label={pending.declineButtonPl || "Anuluj"}
                  onPress={() => setPending(null)}
                  variant="ghost"
                />
                <NeonButton
                  className="flex-1"
                  label={pending.acceptButtonPl || "Akceptuję"}
                  onPress={acceptPending}
                  variant="pink"
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
