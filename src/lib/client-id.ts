import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "butelka.clientId";

function generateId(): string {
  return `c_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Na webie pozwalamy wymusić clientId przez ?clientId=... (test multiplayera w wielu kartach). */
function overrideFromUrl(): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return null;
  }
  const param = new URLSearchParams(window.location.search).get("clientId");
  return param && param.length > 0 ? param : null;
}

// Dostęp do storage odporny na brak natywnego modułu (np. w Expo Go) —
// nigdy nie rzuca, w najgorszym razie clientId żyje tylko w pamięci sesji.
async function safeGet(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // storage niedostępny — pomijamy, identyfikator i tak zostanie wygenerowany
  }
}

/**
 * Trwały identyfikator urządzenia. Pozwala backendowi rozpoznać, który rekord
 * gracza należy do tego telefonu („Ty”). Zwraca null, dopóki się nie wczyta.
 */
export function useClientId(): string | null {
  // Override z URL ustawiamy synchronicznie przy inicjalizacji (bez efektu).
  const [clientId, setClientId] = useState<string | null>(() => overrideFromUrl());

  useEffect(() => {
    if (clientId) {
      return;
    }
    let active = true;
    (async () => {
      let id = await safeGet(STORAGE_KEY);
      if (!id) {
        id = generateId();
        await safeSet(STORAGE_KEY, id);
      }
      if (active) {
        setClientId(id);
      }
    })();
    return () => {
      active = false;
    };
  }, [clientId]);

  return clientId;
}
