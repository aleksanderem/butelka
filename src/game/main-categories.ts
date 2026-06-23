// 6 głównych kategorii (= modeGroups z content API V3) z metadanymi do UI: nazwa (z API),
// opis/tagline (własne — API ich nie ma na poziomie trybu), bramka wieku, akcent, gradient
// (fallback, zanim/jeśli nie ma obrazka higgsfield). Kolejność od najłagodniejszej do najostrzejszej.

import type { AgeGate, ModeGroup } from "@/game/content-types";
import { getLang } from "@/game/language";

export interface MainCategory {
  key: ModeGroup; // modeGroup
  namePl: string;
  tagline: string;
  descriptionPl: string;
  nameEn: string;
  taglineEn: string;
  descriptionEn: string;
  ageGate: AgeGate;
  accent: string;
  gradient: readonly [string, string];
  /** Paczka premium (na launchu DARMOWA i grywalna — tylko oznaczona i mierzymy zainteresowanie). */
  premium?: boolean;
}

export const MAIN_CATEGORIES: readonly MainCategory[] = [
  {
    key: "classic",
    namePl: "Classic",
    tagline: "Dla każdego, zero spiny",
    descriptionPl:
      "Klasyczna prawda albo wyzwanie dla całej ekipy. Lekkie pytania, śmieszne zadania i przełamywanie lodów — bez niezręczności.",
    nameEn: "Classic",
    taglineEn: "For everyone, no pressure",
    descriptionEn:
      "Classic truth or dare for the whole crew. Light questions, funny tasks and icebreakers — zero awkwardness.",
    ageGate: "16+",
    accent: "#A855F7",
    gradient: ["#7C3AED", "#5B21B6"],
  },
  {
    key: "teen",
    namePl: "Teen",
    tagline: "Nastoletnia ekipa, bez alkoholu",
    descriptionPl:
      "Wersja dla młodszych: szkoła, znajomi, odwaga społeczna i szybkie akcje. Bezpieczne treści, zero alkoholu i podtekstów.",
    nameEn: "Teen",
    taglineEn: "Teen crew, alcohol-free",
    descriptionEn:
      "A version for younger players: school, friends, social courage and quick challenges. Safe content, no alcohol or innuendo.",
    ageGate: "13+",
    accent: "#34D399",
    gradient: ["#0D9488", "#155E63"],
  },
  {
    key: "party",
    namePl: "Melanż / Impreza",
    tagline: "Impreza bez filtra",
    descriptionPl:
      "Imprezowy chaos dla dorosłych: melanż, przypały, dramy i akcje bez filtra. Maksimum śmiechu i odważnych wyzwań w grupie.",
    nameEn: "Party",
    taglineEn: "Party with no filter",
    descriptionEn:
      "Adult party chaos: boozy nights, cringe stories, drama and no-filter dares. Maximum laughs and bold group challenges.",
    ageGate: "18+",
    accent: "#C084FC",
    gradient: ["#9333EA", "#6B21A8"],
    premium: true,
  },
  {
    key: "couple",
    namePl: "Tylko we 2",
    tagline: "Bliskość we dwoje",
    descriptionPl:
      "Tryb dla pary: bliskość, wdzięczność, przyszłość i rozmowy, których nie było. Do budowania więzi, bez pikanterii.",
    nameEn: "Just the Two",
    taglineEn: "Closeness for two",
    descriptionEn:
      "Couple mode: closeness, gratitude, the future and conversations you never had. For building connection, no spice.",
    ageGate: "18+",
    accent: "#F472B6",
    gradient: ["#DB2777", "#9D174D"],
  },
  {
    key: "group_hot",
    namePl: "Hot — grupowo",
    tagline: "Odważny flirt w grupie",
    descriptionPl:
      "Gorący tryb grupowy: flirt, hot i spicy z opcją kontaktu lub bez. Z naciskiem na zgodę i granice — odważnie, ale bezpiecznie.",
    nameEn: "Hot — Group",
    taglineEn: "Bold group flirting",
    descriptionEn:
      "A hot group mode: flirting, hot and spicy, with or without contact. Consent- and boundary-focused — bold but safe.",
    ageGate: "explicit_18+",
    accent: "#F0ABFC",
    gradient: ["#C026D3", "#86198F"],
    premium: true,
  },
  {
    key: "couple_hot",
    namePl: "Tylko we 2 — Hot",
    tagline: "Pikantna noc we dwoje",
    descriptionPl:
      "Najgorętsza odsłona trybu dla par: flirt, napięcie, pragnienia i prywatne wyzwania. Dla dorosłych par, które chcą podkręcić wieczór.",
    nameEn: "Just the Two — Hot",
    taglineEn: "A spicy night for two",
    descriptionEn:
      "The hottest couple mode: flirting, tension, desires and private dares. For adult couples who want to turn up the night.",
    ageGate: "explicit_18+",
    accent: "#FB7185",
    gradient: ["#E11D48", "#9F1239"],
    premium: true,
  },
] as const;

export const MAIN_CATEGORY_KEYS: readonly ModeGroup[] = MAIN_CATEGORIES.map((m) => m.key);

export function mainCategoryByKey(key: string): MainCategory | undefined {
  return MAIN_CATEGORIES.find((m) => m.key === key);
}

// Nazwa/tagline/opis głównej kategorii wg bieżącego języka (EN z fallbackiem do PL).
export const mainName = (m: MainCategory): string =>
  getLang() === "en" && m.nameEn ? m.nameEn : m.namePl;
export const mainTagline = (m: MainCategory): string =>
  getLang() === "en" && m.taglineEn ? m.taglineEn : m.tagline;
export const mainDesc = (m: MainCategory): string =>
  getLang() === "en" && m.descriptionEn ? m.descriptionEn : m.descriptionPl;

/** Krótka etykieta bramki wieku do plakietki. */
export function ageBadge(ageGate: AgeGate): string {
  switch (ageGate) {
    case "13+":
      return "13+";
    case "16+":
      return "16+";
    default:
      return "18+";
  }
}
