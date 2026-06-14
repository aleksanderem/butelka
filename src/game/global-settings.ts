// Globalne (urządzeniowe) ustawienia gracza: domyślne imię/avatar/kolor + domyślny dobór treści.
// Trzymane lokalnie (AsyncStorage). Stosowane automatycznie przy tworzeniu pokoju — w pokoju
// dalej można je nadpisać (dobór treści zapisuje się wtedy na samym pokoju).

import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_SELECTION, parseSelection, type ContentSelection } from "@/game/content-selection";
import type { AvatarId } from "@/game/types";
import type { PlayerColorId } from "@/theme/colors";

export interface GlobalSettings {
  name: string;
  avatarId: AvatarId | null;
  colorId: PlayerColorId | null;
  contentSelection: ContentSelection;
  /** Ukryty tryb testowy (odblokowywany kodem pokoju) — pokazuje funkcje deweloperskie. */
  testMode: boolean;
}

const KEY = "butelka.globalSettings.v1";

export const EMPTY_GLOBAL_SETTINGS: GlobalSettings = {
  name: "",
  avatarId: null,
  colorId: null,
  contentSelection: { ...DEFAULT_SELECTION },
  testMode: false,
};

export async function loadGlobalSettings(): Promise<GlobalSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_GLOBAL_SETTINGS };
    const obj = JSON.parse(raw) as Record<string, unknown>;
    return {
      name: typeof obj.name === "string" ? obj.name : "",
      avatarId: (obj.avatarId as AvatarId | null) ?? null,
      colorId: (obj.colorId as PlayerColorId | null) ?? null,
      contentSelection: parseSelection(JSON.stringify(obj.contentSelection ?? {})),
      testMode: obj.testMode === true,
    };
  } catch {
    return { ...EMPTY_GLOBAL_SETTINGS };
  }
}

export async function saveGlobalSettings(settings: GlobalSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // brak miejsca / błąd zapisu — pomijamy; ustawienia zostają w pamięci sesji
  }
}
