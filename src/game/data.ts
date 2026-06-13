import type { AvatarId, ChallengeType, RoomSettings } from "@/game/types";
import type { PlayerColorId } from "@/theme/colors";

export interface AvatarPreset {
  id: AvatarId;
  /** Emoji-twarz jako placeholder pod docelowe ilustracje z mockupu. */
  face: string;
}

/** 8 avatarów z ekranu onboardingu. Emoji są placeholderem pod właściwe ilustracje. */
export const avatarPresets: AvatarPreset[] = [
  { id: "kuba", face: "🧑" },
  { id: "ola", face: "👩" },
  { id: "bartek", face: "🧔" },
  { id: "zuzia", face: "👧" },
  { id: "michal", face: "🧑‍🦱" },
  { id: "kasia", face: "👩‍🦰" },
  { id: "filip", face: "👱" },
  { id: "nina", face: "👩‍🦳" },
];

/** Kolory akcentu w kolejności jak na mockupie (pierwszy = domyślny). */
export const colorOrder: PlayerColorId[] = [
  "violet",
  "purple",
  "blue",
  "teal",
  "amber",
  "orange",
  "red",
];

export const truthPrompts: string[] = [
  "Jaka jest najbardziej żenująca rzecz, jaką kiedykolwiek zrobiłeś/aś?",
  "Jaka była twoja najdziwniejsza pierwsza randka?",
  "Kiedy ostatnio udawałeś/aś, że rozumiesz temat, choć nie miałeś/aś pojęcia?",
  "Kto z pokoju najłatwiej rozbawiłby cię do łez?",
  "Jaki sekret z dzieciństwa nadal cię śmieszy?",
  "O czym myślisz, gdy nie możesz zasnąć?",
  "Jaką najbardziej wstydliwą piosenkę masz w ulubionych?",
  "Co ostatnio wygooglowałeś/aś o drugiej w nocy?",
  "Kogo z tego pokoju znasz najkrócej, a najbardziej lubisz?",
  "Jakie kłamstewko powtarzasz najczęściej?",
  "Czego najbardziej żałujesz z ostatniego miesiąca?",
  "Jakie masz dziwne przyzwyczajenie, do którego nikt się nie przyznaje?",
];

export const darePrompts: string[] = [
  "Powiedz szczery komplement każdej osobie w pokoju.",
  "Przez 10 sekund nagraj dramatyczną reklamę butelki.",
  "Wyślij ostatnio użytą emotkę do wybranej osoby z pokoju.",
  "Opowiedz historię, zaczynając każde zdanie od słowa „butelka”.",
  "Zatańcz przez 15 sekund bez muzyki.",
  "Pokaż ostatnie zdjęcie z galerii (jeśli się odważysz).",
  "Naśladuj wybraną osobę z pokoju, aż reszta zgadnie, kto to.",
  "Powiedz całe zdanie współgłoskami, jakbyś szeptał/a sekret.",
  "Zadzwoń do kogoś i zaśpiewaj mu „Sto lat”.",
  "Przez następną rundę mów wyłącznie pytaniami.",
  "Zrób trzy pompki albo wykonaj fanty od grupy.",
  "Oddaj telefon sąsiadowi — niech wyśle dowolne emoji w twoim imieniu.",
];

export const defaultSettings: RoomSettings = {
  requireEndTurnApproval: true,
  requireNextTruthApproval: true,
  requireNextDareApproval: false,
};

/** Gracze-atrapy w lobby (single-device); znikną po podpięciu multiplayera. */
export const demoPlayers: { name: string; avatarId: AvatarId; colorId: PlayerColorId }[] = [
  { name: "Kasia", avatarId: "kasia", colorId: "orange" },
  { name: "Bartek", avatarId: "bartek", colorId: "blue" },
  { name: "Ola", avatarId: "ola", colorId: "amber" },
  { name: "Michał", avatarId: "michal", colorId: "teal" },
  { name: "Zuzia", avatarId: "zuzia", colorId: "red" },
];

/** ID pokoju: 6 znaków alfanumerycznych (jak „AB12CD” na mockupie). */
export function makeRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join("");
}

export function pickPrompt(type: ChallengeType, exclude?: string): string {
  const prompts = type === "prawda" ? truthPrompts : darePrompts;
  const pool = exclude ? prompts.filter((p) => p !== exclude) : prompts;
  const source = pool.length > 0 ? pool : prompts;
  return source[Math.floor(Math.random() * source.length)];
}
