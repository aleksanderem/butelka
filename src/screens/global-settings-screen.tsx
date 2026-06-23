import { Ionicons } from "@expo/vector-icons";
import { Input } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ColorDot } from "@/components/color-dot";
import { t } from "@/game/ui-strings";
import { ContentLevelEditor } from "@/components/content-level-editor";
import { Paywall } from "@/components/paywall";
import { AvatarVisual } from "@/components/player-avatar";
import { SelectableAvatar } from "@/components/selectable-avatar";
import { avatarOrder } from "@/game/avatars";
import type { ModeGroup } from "@/game/content-types";
import { colorOrder } from "@/game/data";
import type { GameApi } from "@/game/use-game";
import { isCategoryUnlocked } from "@/iap/entitlements";
import { CATEGORY_PRODUCT_ID, isPremiumCategory, type PremiumCategory } from "@/iap/products";
import { useIap } from "@/iap/use-iap";
import { neon, playerPalette } from "@/theme/colors";

type TabId = "profile" | "content";

const TABS: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: "profile", icon: "person-outline", label: t("globalSettingsScreen.tabProfile") },
  { id: "content", icon: "sparkles-outline", label: t("globalSettingsScreen.tabContent") },
];

/** Globalne ustawienia (urządzeniowe): domyślny profil + domyślny dobór treści dla nowych pokoi. */
export function GlobalSettingsScreen({ game }: { game: GameApi }) {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <View className="flex-1 gap-4 px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityLabel={t("globalSettingsScreen.backAccessibilityLabel")}
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => game.setGlobalSettingsOpen(false)}
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons color={neon.white} name="arrow-back" size={22} />
        </Pressable>
        <Text className="text-xl font-extrabold text-foreground">
          {t("globalSettingsScreen.title")}
        </Text>
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
                {t(
                  item.id === "profile"
                    ? "globalSettingsScreen.tabProfile"
                    : "globalSettingsScreen.tabContent"
                )}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 36, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "profile" ? <ProfileTab game={game} /> : <ContentDefaultsTab game={game} />}
      </ScrollView>
    </View>
  );
}

function ProfileTab({ game }: { game: GameApi }) {
  const gs = game.globalSettings;
  const previewAvatar = gs.avatarId ?? avatarOrder[0];
  const previewColor = gs.colorId ?? colorOrder[0];

  return (
    <View className="gap-6">
      <View className="items-center gap-2">
        <AvatarVisual active avatarId={previewAvatar} colorId={previewColor} size="xl" />
        <Text className="text-xs text-muted">{t("globalSettingsScreen.profileSubtitle")}</Text>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">
          {t("globalSettingsScreen.defaultNameLabel")}
        </Text>
        <View className="justify-center">
          <Input
            autoCapitalize="words"
            maxLength={20}
            onChangeText={(name) => game.updateGlobalSettings({ name })}
            placeholder={t("globalSettingsScreen.namePlaceholder")}
            value={gs.name}
          />
          <View
            pointerEvents="none"
            style={{ bottom: 0, justifyContent: "center", position: "absolute", right: 16, top: 0 }}
          >
            <Text className="text-sm font-medium text-muted">{gs.name.length}/20</Text>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">
          {t("globalSettingsScreen.defaultAvatarLabel")}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {avatarOrder.map((id) => (
            <SelectableAvatar
              avatarId={id}
              colorId={previewColor}
              key={id}
              onPress={() => game.updateGlobalSettings({ avatarId: id })}
              selected={gs.avatarId === id}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">
          {t("globalSettingsScreen.defaultColorLabel")}
        </Text>
        <View className="flex-row items-center justify-between">
          {colorOrder.map((id) => (
            <ColorDot
              color={playerPalette[id]}
              key={id}
              onPress={() => game.updateGlobalSettings({ colorId: id })}
              selected={gs.colorId === id}
              size={40}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">
          {t("globalSettingsScreen.languageLabel")}
        </Text>
        <View className="flex-row gap-2">
          {(["pl", "en"] as const).map((l) => {
            const active = game.lang === l;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className="flex-1 items-center rounded-2xl px-3 py-3"
                key={l}
                onPress={() => void game.setLanguage(l)}
                style={{
                  backgroundColor: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: active ? neon.white : neon.textMuted }}
                >
                  {l === "pl" ? t("globalSettingsScreen.langPolish") : "English"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function ContentDefaultsTab({ game }: { game: GameApi }) {
  const { entitlements, priceFor } = useIap();
  const [paywallCat, setPaywallCat] = useState<PremiumCategory | null>(null);

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">
          {t("globalSettingsScreen.contentCategoriesLabel")}
        </Text>
        <Text className="text-xs leading-5 text-muted">
          {t("globalSettingsScreen.contentCategoriesDescription")}
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
        onSetCategoryEnabled={game.setGlobalCategoryEnabled}
        onSetFilter={game.setGlobalFilter}
        onSetLevel={game.setGlobalContentLevel}
        onVerifyAge={game.verifyAge}
        premiumPrice={(key) =>
          isPremiumCategory(key as ModeGroup)
            ? priceFor(CATEGORY_PRODUCT_ID[key as PremiumCategory])
            : null
        }
        selection={game.globalSettings.contentSelection}
      />

      {paywallCat ? <Paywall category={paywallCat} onClose={() => setPaywallCat(null)} /> : null}
    </View>
  );
}
