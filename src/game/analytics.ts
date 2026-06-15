// Lekka analityka popytu (np. otwarcia kategorii) zapisywana do kolekcji `events` w Appwrite.
// Fire-and-forget: NIGDY nie blokuje UI i połyka błędy — analityka nie może wywalić rozgrywki.

import { COL_EVENTS, DB_ID, databases } from "@/lib/appwrite";
import { ID } from "@/lib/appwrite-sdk";

/**
 * Zapisuje zdarzenie analityczne.
 * @param type rodzaj zdarzenia, np. "category_open"
 * @param key  czego dotyczy, np. klucz kategorii ("party")
 * @param clientId identyfikator urządzenia (null -> "anon")
 */
export function logEvent(type: string, key: string, clientId: string | null): void {
  void databases
    .createDocument(DB_ID, COL_EVENTS, ID.unique(), {
      type,
      key,
      clientId: clientId ?? "anon",
      at: Date.now(),
    })
    .catch(() => {
      // analityka nie może wywalić UX — błąd celowo ignorowany
    });
}
