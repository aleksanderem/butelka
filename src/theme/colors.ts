/**
 * Neonowa paleta "PRAWDA czy WYZWANIE" — surowe hexy do gradientów i poświaty (glow),
 * których nie da się wyrazić tokenami HeroUI/Tailwind (LinearGradient, shadowColor, SVG).
 * Tokeny semantyczne (tło, tekst, akcent) żyją w src/global.css.
 */

export const neon = {
  bg: "#0A0712",
  bgDeep: "#070510",
  surface: "#16121F",
  surfaceRaised: "#1D1828",

  purple: "#8B5CF6",
  purpleBright: "#A855F7",
  purpleDeep: "#6D28D9",
  purpleDeepest: "#4C1D95",

  pink: "#EC4899",
  magenta: "#F43F5E",
  magentaDeep: "#BE185D",

  gold: "#FBBF24",
  goldBright: "#FCD34D",

  green: "#22C55E",
  greenBright: "#34D399",

  white: "#F4F1FB",
  textMuted: "#A39BB8",
} as const;

/** Gradienty przycisków i powierzchni (kierunek ustawiany na miejscu użycia). */
export const gradients = {
  /** UTWÓRZ POKÓJ / PRAWDA — fioletowy primary. */
  violet: ["#7C3AED", "#5B21B6"] as const,
  violetBright: ["#A855F7", "#7C3AED"] as const,
  /** DOŁĄCZ / WYZWANIE — magenta-róż. */
  pink: ["#F43F5E", "#EC4899"] as const,
  pinkDeep: ["#EC4899", "#BE185D"] as const,
  /** Animowana karta „Ty”. */
  card: ["#8B5CF6", "#6D28D9"] as const,
  /** Pasek postępu akceptacji. */
  progress: ["#A855F7", "#EC4899"] as const,
} as const;

/** Kolory akcentu gracza (ring + poświata avatara) — 7 opcji z mockupu onboardingu. */
export const playerPalette = {
  violet: "#A855F7",
  purple: "#7C3AED",
  blue: "#3B82F6",
  teal: "#14B8A6",
  amber: "#F59E0B",
  orange: "#FB7185",
  red: "#EF4444",
} as const;

export type PlayerColorId = keyof typeof playerPalette;
