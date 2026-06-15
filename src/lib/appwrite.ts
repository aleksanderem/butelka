import { Client, Databases } from "@/lib/appwrite-sdk";

// Wartości publiczne (NIE sekrety — i tak trafiają do bundla klienta). Fallbacki gwarantują, że
// brak wstrzyknięcia EXPO_PUBLIC_* w buildzie (np. EAS w chmurze bez `.env.local`) NIE wywali
// apki na starcie. Sekret `APPWRITE_API_KEY` jest tylko w skryptach serwerowych, nigdy tutaj.
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "https://appwrite.c.helloalex.pl/v1";
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? "6a2db5940014ceaf8711";

/** Współdzielony klient Appwrite (singleton — nie wymaga React Providera). */
export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId);

export const databases = new Databases(appwriteClient);

export const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID ?? "butelka";
export const COL_ROOMS = "rooms";
export const COL_PLAYERS = "players";
export const COL_VOTES = "votes";
// Lekka analityka (sygnał popytu, np. otwarcia kategorii). Fire-and-forget, bez wpływu na UX.
export const COL_EVENTS = "events";

/** Kanał Realtime konkretnego pokoju (subskrybujemy dokument o ID = kod pokoju). */
export function roomChannel(code: string): string {
  return `databases.${DB_ID}.collections.${COL_ROOMS}.documents.${code}`;
}

/** Kanał Realtime wszystkich graczy (filtrujemy po roomCode w callbacku). */
export function playersChannel(): string {
  return `databases.${DB_ID}.collections.${COL_PLAYERS}.documents`;
}

/** Kanał Realtime wszystkich głosów (filtrujemy po roomCode w callbacku). */
export function votesChannel(): string {
  return `databases.${DB_ID}.collections.${COL_VOTES}.documents`;
}
