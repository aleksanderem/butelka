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
      let id = await AsyncStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = generateId();
        await AsyncStorage.setItem(STORAGE_KEY, id);
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
