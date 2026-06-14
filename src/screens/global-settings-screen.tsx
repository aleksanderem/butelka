import { Ionicons } from "@expo/vector-icons";
import { Input } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ColorDot } from "@/components/color-dot";
import { ContentLevelEditor } from "@/components/content-level-editor";
import { AvatarVisual } from "@/components/player-avatar";
import { SelectableAvatar } from "@/components/selectable-avatar";
import { avatarOrder } from "@/game/avatars";
import { colorOrder } from "@/game/data";
import type { GameApi } from "@/game/use-game";
import { neon, playerPalette } from "@/theme/colors";

type TabId = "profile" | "content";

const TABS: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { id: "profile", icon: "person-outline", label: "Profil" },
  { id: "content", icon: "sparkles-outline", label: "Treści" },
];

/** Globalne ustawienia (urządzeniowe): domyślny profil + domyślny dobór treści dla nowych pokoi. */
export function GlobalSettingsScreen({ game }: { game: GameApi }) {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <View className="flex-1 gap-4 px-5 pt-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityLabel="Wróć"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => game.setGlobalSettingsOpen(false)}
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <Ionicons color={neon.white} name="arrow-back" size={22} />
        </Pressable>
        <Text className="text-xl font-extrabold text-foreground">Ustawienia</Text>
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
        <Text className="text-xs text-muted">
          Domyślny profil — podstawiany przy tworzeniu pokoju
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-base font-bold text-foreground">Domyślne imię</Text>
        <View className="justify-center">
          <Input
            autoCapitalize="words"
            maxLength={20}
            onChangeText={(name) => game.updateGlobalSettings({ name })}
            placeholder="Twoje imię"
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
        <Text className="text-base font-bold text-foreground">Domyślny avatar</Text>
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
        <Text className="text-base font-bold text-foreground">Domyślny kolor</Text>
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
    </View>
  );
}

function ContentDefaultsTab({ game }: { game: GameApi }) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">Domyślne kategorie treści</Text>
        <Text className="text-xs leading-5 text-muted">
          Ten dobór zostanie zastosowany automatycznie przy zakładaniu nowego pokoju. W pokoju
          (Ustawienia → Treści) możesz go w każdej chwili zmienić.
        </Text>
      </View>

      <ContentLevelEditor
        bundle={game.contentBundle}
        onSetLevel={game.setGlobalContentLevel}
        selection={game.globalSettings.contentSelection}
      />
    </View>
  );
}
