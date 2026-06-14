// 7 głównych kategorii (= tryby z API) z metadanymi do UI: nazwa, opis (API zwraca puste),
// bramka wieku, akcent i gradient (fallback, zanim/jeśli nie ma obrazka higgsfield).
// Kolejność od najłagodniejszej do najostrzejszej.

import type { AgeGate } from "@/game/content-types";

export interface MainCategory {
  key: string; // modeKey
  namePl: string;
  tagline: string;
  descriptionPl: string;
  ageGate: AgeGate;
  accent: string;
  gradient: readonly [string, string];
}

export const MAIN_CATEGORIES: readonly MainCategory[] = [
  {
    key: "classic",
    namePl: "Classic",
    tagline: "Dla każdego, zero spiny",
    descriptionPl:
      "Klasyczna prawda albo wyzwanie dla całej ekipy. Lekkie pytania, śmieszne zadania i przełamywanie lodów — bez wieku 18+ i bez niezręczności.",
    ageGate: "all",
    accent: "#A855F7",
    gradient: ["#7C3AED", "#5B21B6"],
  },
  {
    key: "teen",
    namePl: "Teen",
    tagline: "Nastoletnia ekipa, bez alkoholu",
    descriptionPl:
      "Wersja dla młodszych: szkoła, znajomi, odwaga społeczna i szybkie akcje. Bezpieczne treści dopasowane do wieku 13–17, zero alkoholu i podtekstów.",
    ageGate: "13-17",
    accent: "#34D399",
    gradient: ["#0D9488", "#155E63"],
  },
  {
    key: "couples",
    namePl: "Para",
    tagline: "Bliskość i głębokie rozmowy",
    descriptionPl:
      "Tryb we dwoje: bliskość, wdzięczność, przyszłość i rozmowy, których nie było. Do budowania więzi, bez pikanterii. 18+.",
    ageGate: "18+",
    accent: "#F472B6",
    gradient: ["#DB2777", "#9D174D"],
  },
  {
    key: "couples-hot",
    namePl: "Para Hot",
    tagline: "Pikantna noc we dwoje",
    descriptionPl:
      "Gorętsza odsłona trybu dla par: flirt, napięcie, pragnienia i prywatne wyzwania. Tylko dla dorosłych par, które chcą podkręcić wieczór. 18+.",
    ageGate: "18+",
    accent: "#FB7185",
    gradient: ["#E11D48", "#9F1239"],
  },
  {
    key: "18-party",
    namePl: "18+ Impreza",
    tagline: "Melanż bez filtra",
    descriptionPl:
      "Imprezowy chaos dla dorosłych: melanż, przypały, dramy i akcje bez filtra. Maksimum śmiechu i odważnych wyzwań w grupie. 18+.",
    ageGate: "18+",
    accent: "#C084FC",
    gradient: ["#9333EA", "#6B21A8"],
  },
  {
    key: "18-hot-group",
    namePl: "18+ Hot Grupa",
    tagline: "Odważny flirt w grupie",
    descriptionPl:
      "Gorący tryb grupowy: flirt, hot soft i spicy z opcją kontaktu lub bez. Z wbudowanym boundary/consent check, żeby było odważnie i bezpiecznie. 18+.",
    ageGate: "18+",
    accent: "#F0ABFC",
    gradient: ["#C026D3", "#86198F"],
  },
  {
    key: "18-very-hot",
    namePl: "18+ Very Hot",
    tagline: "Najgorętsze, tylko dla śmiałych",
    descriptionPl:
      "Najostrzejsze treści: deklaracje, wybory, consent game i tryb prywatny. Dla dorosłych, którzy wiedzą, czego chcą — z naciskiem na zgodę. 18+.",
    ageGate: "18+",
    accent: "#FB7185",
    gradient: ["#BE123C", "#7F1D1D"],
  },
] as const;

export const MAIN_CATEGORY_KEYS: readonly string[] = MAIN_CATEGORIES.map((m) => m.key);

export function mainCategoryByKey(key: string): MainCategory | undefined {
  return MAIN_CATEGORIES.find((m) => m.key === key);
}

/** Krótka etykieta bramki wieku do plakietki. */
export function ageBadge(ageGate: AgeGate): string {
  if (ageGate === "all") return "Dla każdego";
  if (ageGate === "13-17") return "13–17";
  return "18+";
}
