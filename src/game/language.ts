// Język treści (PL/EN). Moduł trzyma bieżący język w pamięci (czytany synchronicznie przez picker
// w room-api) + utrwala wybór w AsyncStorage. Helpery renderu zwracają wariant EN, a gdy pole EN
// jest puste — fallback do PL. UI-stringi samej aplikacji NIE są tu objęte (osobny zakres).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

import type { Card, Category, ModeGroupRef, Setting } from "@/game/content-types";

export type Lang = "pl" | "en";

const KEY = "butelka.lang.v1";
let current: Lang = "pl";

/** Locale urządzenia bez natywnego modułu (unikamy dodatkowego poda — wbudowane w RN). */
function deviceLocale(): string {
  try {
    if (Platform.OS === "ios") {
      const s = NativeModules.SettingsManager?.settings;
      return String(s?.AppleLocale ?? s?.AppleLanguages?.[0] ?? "");
    }
    return String(NativeModules.I18nManager?.localeIdentifier ?? "");
  } catch {
    return "";
  }
}

/** Język z ustawień systemu urządzenia (en -> "en", wszystko inne -> "pl"). */
export function detectLang(): Lang {
  return deviceLocale().toLowerCase().startsWith("en") ? "en" : "pl";
}

/** Synchroniczny odczyt bieżącego języka (używa picker w room-api). */
export function getLang(): Lang {
  return current;
}

/** Inicjalizacja przy starcie: zapamiętany wybór, inaczej locale urządzenia. */
export async function initLang(): Promise<Lang> {
  try {
    const s = await AsyncStorage.getItem(KEY);
    if (s === "pl" || s === "en") {
      current = s;
      return current;
    }
  } catch {
    // brak dostępu do storage — użyj locale
  }
  current = detectLang();
  return current;
}

/** Zmiana języka: natychmiast w pamięci (dla pickera) + utrwalenie. */
export async function setLang(lang: Lang): Promise<void> {
  current = lang;
  try {
    await AsyncStorage.setItem(KEY, lang);
  } catch {
    // pomijamy — zostaje w pamięci sesji
  }
}

// Wybór wariantu wg bieżącego języka z fallbackiem do PL (puste EN -> PL).
const pick = (en: string | undefined, pl: string): string =>
  current === "en" && en && en.trim() ? en : pl;

export const cardText = (c: Card): string => pick(c.textEn, c.textPl);
export const catName = (c: Category): string => pick(c.nameEn, c.namePl);
export const catDisclaimerTitle = (c: Category): string =>
  pick(c.disclaimerTitleEn, c.disclaimerTitlePl);
export const catDisclaimerBody = (c: Category): string =>
  pick(c.disclaimerBodyEn, c.disclaimerBodyPl);
export const catAcceptBtn = (c: Category): string => pick(c.acceptButtonEn, c.acceptButtonPl);
export const catDeclineBtn = (c: Category): string => pick(c.declineButtonEn, c.declineButtonPl);
export const settingName = (s: Setting): string => pick(s.nameEn, s.namePl);
export const settingDesc = (s: Setting): string => pick(s.descriptionEn, s.descriptionPl);
export const modeName = (m: ModeGroupRef): string => pick(m.nameEn, m.namePl);
