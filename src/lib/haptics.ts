// Sygnaly haptyczne (Taptic Engine, expo-haptics). Wszystkie no-op na symulatorze i przy braku
// sprzetu — wywolania sa bezpieczne (bledy ignorowane).

import * as Haptics from "expo-haptics";

/** Lekki tap przy kliknieciu przycisku. */
export function hapticTap(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Subtelny tyk przy kazdej zmianie wskazania podczas losowania (krazenie karty). */
export function hapticSpinTick(): void {
  Haptics.selectionAsync().catch(() => {});
}

/** Mocniejszy sygnal w momencie wskazania szczesliwca. */
export function hapticReveal(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Puls u wylosowanego, powtarzany do momentu wyboru. */
export function hapticPulse(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}
