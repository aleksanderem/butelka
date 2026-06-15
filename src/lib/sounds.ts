// Lekki menedzer efektow dzwiekowych UI (expo-audio). Tworzy po jednym odtwarzaczu na dzwiek
// przy starcie apki i odtwarza je od poczatku na zadanie. Cisza, gdy wylaczone w ustawieniach.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

const SOURCES = {
  tap: require("../../assets/sounds/tap.m4a"),
  spin: require("../../assets/sounds/spin.m4a"),
  reveal: require("../../assets/sounds/reveal.m4a"),
  success: require("../../assets/sounds/success.m4a"),
  error: require("../../assets/sounds/error.m4a"),
} as const;

export type SoundName = keyof typeof SOURCES;

/** Glosnosc per-dzwiek — klikniecia subtelne, momenty gry pelniejsze. */
const VOLUME: Record<SoundName, number> = {
  tap: 0.5,
  spin: 0.7,
  reveal: 0.9,
  success: 0.8,
  error: 0.7,
};

const players = new Map<SoundName, AudioPlayer>();
let enabled = true;
let ready = false;

/** Tworzy odtwarzacze raz, przy starcie apki. Bezpieczne do wielokrotnego wywolania. */
export function initSounds(): void {
  if (ready) {
    return;
  }
  ready = true;
  // Respektuj przelacznik wyciszenia telefonu (SFX UI nie powinny grac mimo cichego trybu).
  setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
    try {
      const player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUME[name];
      players.set(name, player);
    } catch {
      // Brak pojedynczego dzwieku nie moze wywrocic apki.
    }
  });
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

/** Odtwarza efekt od poczatku. No-op gdy dzwieki wylaczone lub odtwarzacz niegotowy. */
export function playSound(name: SoundName): void {
  if (!enabled) {
    return;
  }
  const player = players.get(name);
  if (!player) {
    return;
  }
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // Ignorujemy bledy odtwarzania pojedynczego SFX.
  }
}
