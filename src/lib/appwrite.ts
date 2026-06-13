import { Client, Databases } from "@/lib/appwrite-sdk";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error(
    "Brak EXPO_PUBLIC_APPWRITE_ENDPOINT / EXPO_PUBLIC_APPWRITE_PROJECT_ID — uzupełnij .env.local."
  );
}

/** Współdzielony klient Appwrite (singleton — nie wymaga React Providera). */
export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId);

export const databases = new Databases(appwriteClient);

export const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID ?? "butelka";
export const COL_ROOMS = "rooms";
export const COL_PLAYERS = "players";
export const COL_VOTES = "votes";

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
