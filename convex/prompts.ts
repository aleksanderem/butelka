// Treści gry po stronie serwera (losowanie pytań/wyzwań i kodu pokoju dzieje się
// w mutacjach Convex). Listy są zsynchronizowane z src/game/data.ts.

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

export function pickPrompt(type: "prawda" | "wyzwanie", exclude?: string | null): string {
  const prompts = type === "prawda" ? truthPrompts : darePrompts;
  const pool = exclude ? prompts.filter((p) => p !== exclude) : prompts;
  const source = pool.length > 0 ? pool : prompts;
  return source[Math.floor(Math.random() * source.length)];
}
