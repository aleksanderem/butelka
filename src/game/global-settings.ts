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
  /** Bramka wieku 18+ potwierdzona na tym urządzeniu. */
  ageVerified: boolean;
  /** Zapamiętane akceptacje kategorii (categoryId) z disclaimerów. */
  acceptedCategories: string[];
  /** Ukryty tryb testowy (odblokowywany kodem pokoju) — pokazuje funkcje deweloperskie. */
  testMode: boolean;
  /** Efekty dzwiekowe UI (kliknięcia, losowanie, reveal). Domyślnie włączone. */
  sound: boolean;
}

const KEY = "butelka.globalSettings.v1";

function defaultContentSelection(): ContentSelection {
  return {
    levels: { ...DEFAULT_SELECTION.levels },
    disabledCategories: [],
    filters: {},
  };
}

export const EMPTY_GLOBAL_SETTINGS: GlobalSettings = {
  name: "",
  avatarId: null,
  colorId: null,
  contentSelection: defaultContentSelection(),
  ageVerified: false,
  acceptedCategories: [],
  testMode: false,
  sound: true,
};

export async function loadGlobalSettings(): Promise<GlobalSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_GLOBAL_SETTINGS, contentSelection: defaultContentSelection() };
    const obj = JSON.parse(raw) as Record<string, unknown>;
    return {
      name: typeof obj.name === "string" ? obj.name : "",
      avatarId: (obj.avatarId as AvatarId | null) ?? null,
      colorId: (obj.colorId as PlayerColorId | null) ?? null,
      contentSelection: parseSelection(JSON.stringify(obj.contentSelection ?? {})),
      ageVerified: obj.ageVerified === true,
      acceptedCategories: Array.isArray(obj.acceptedCategories)
        ? obj.acceptedCategories.filter((x): x is string => typeof x === "string")
        : [],
      testMode: obj.testMode === true,
      sound: obj.sound !== false,
    };
  } catch {
    return { ...EMPTY_GLOBAL_SETTINGS, contentSelection: defaultContentSelection() };
  }
}

export async function saveGlobalSettings(settings: GlobalSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // brak miejsca / błąd zapisu — pomijamy; ustawienia zostają w pamięci sesji
  }
}
