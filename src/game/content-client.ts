// Pobieranie i cache paczki treści. Strategia: manifest -> wersja -> (jeśli inna) pełna paczka.
// Cache na AsyncStorage (już zlinkowany; iOS bez limitu 6 MB Androida). Singleton w pamięci,
// żeby picker (room-api) mógł czytać synchronicznie.

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ContentBundle, ContentManifest } from "@/game/content-types";

const API =
  process.env.EXPO_PUBLIC_CONTENT_API ??
  "https://butelka-admin.aleksander-kolabogroup.workers.dev/api/v1";

const CACHE_KEY = "butelka.content.bundle.v1";

let memo: ContentBundle | null = null;
let inflight: Promise<ContentBundle | null> | null = null;

/** Synchroniczny dostęp do paczki w pamięci (null, dopóki nie wczytana). Używa picker. */
export function getCachedContent(): ContentBundle | null {
  return memo;
}

async function readCache(): Promise<ContentBundle | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ContentBundle) : null;
  } catch {
    return null;
  }
}

async function writeCache(bundle: ContentBundle): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // brak miejsca / błąd zapisu — gramy z pamięci, cache odświeży się następnym razem
  }
}

async function fetchManifest(): Promise<ContentManifest | null> {
  try {
    const res = await fetch(`${API}/manifest`);
    if (!res.ok) return null;
    return (await res.json()) as ContentManifest;
  } catch {
    return null;
  }
}

async function fetchBundle(): Promise<ContentBundle | null> {
  try {
    const res = await fetch(`${API}/content`);
    if (!res.ok) return null;
    return (await res.json()) as ContentBundle;
  } catch {
    return null;
  }
}

async function load(): Promise<ContentBundle | null> {
  if (!memo) {
    memo = await readCache();
  }
  const manifest = await fetchManifest();
  if (manifest && (!memo || memo.version !== manifest.version)) {
    const fresh = await fetchBundle();
    if (fresh) {
      memo = fresh;
      await writeCache(fresh);
    }
  }
  return memo;
}

/**
 * Zapewnia paczkę: z cache (gdy wersja aktualna) lub dociąga z API. Bezpieczne do wielokrotnego
 * wołania — równoległe wywołania współdzielą jeden lot. Zwraca null tylko gdy brak sieci i cache.
 */
export function ensureContent(): Promise<ContentBundle | null> {
  if (!inflight) {
    inflight = load().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
