// Idempotentny provisioning backendu Appwrite dla gry "Butelka".
// Tworzy baze + kolekcje (rooms/players/votes) z atrybutami, indeksami i uprawnieniami.
//
// Uruchom:  node scripts/appwrite-setup.mjs
// Konfiguracja czytana z .env.local (APPWRITE_API_KEY uzywany TYLKO tutaj, nie w aplikacji).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv() {
  const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const ENDPOINT = env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT = env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = env.APPWRITE_API_KEY;
const DB_ID = env.EXPO_PUBLIC_APPWRITE_DB_ID || "butelka";

if (!ENDPOINT || !PROJECT || !API_KEY) {
  console.error("Brak EXPO_PUBLIC_APPWRITE_ENDPOINT / EXPO_PUBLIC_APPWRITE_PROJECT_ID / APPWRITE_API_KEY w .env.local");
  process.exit(1);
}

const ANY = ['create("any")', 'read("any")', 'update("any")', 'delete("any")'];

async function api(method, path, body) {
  const res = await fetch(`${ENDPOINT}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": PROJECT,
      "X-Appwrite-Key": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    // 409 = juz istnieje -> idempotentnie OK.
    if (res.status === 409) return { exists: true };
    // UWAGA: NIE dolaczamy `text` do bledu — Appwrite 1.7.4 echo'uje naglowki
    // (w tym x-appwrite-key) w trace bledu, co wyciekaloby klucz API do logow.
    throw new Error(`${method} ${path} -> ${res.status}`);
  }
  return json;
}

// Cache kluczy atrybutow per kolekcja -> idempotentne pomijanie istniejacych (bez ponownego POST,
// ktory na kolekcji u limitu rozmiaru zwraca 400 zamiast 409 i wywalalby skrypt).
const _attrCache = new Map();
async function attrExists(col, key) {
  if (!_attrCache.has(col)) {
    let keys = new Set();
    try {
      const list = await api("GET", `/databases/${DB_ID}/collections/${col}/attributes`);
      keys = new Set((list.attributes || []).map((a) => a.key));
    } catch {
      // kolekcja moze jeszcze nie istniec — pusty zbior
    }
    _attrCache.set(col, keys);
  }
  return _attrCache.get(col).has(key);
}

async function ensureDatabase() {
  const r = await api("POST", "/databases", { databaseId: DB_ID, name: "Butelka" });
  console.log(r.exists ? `DB ${DB_ID}: istnieje` : `DB ${DB_ID}: utworzona`);
}

async function ensureCollection(id, name) {
  const r = await api("POST", `/databases/${DB_ID}/collections`, {
    collectionId: id,
    name,
    permissions: ANY,
    documentSecurity: false,
    enabled: true,
  });
  console.log(r.exists ? `Kolekcja ${id}: istnieje` : `Kolekcja ${id}: utworzona`);
}

async function strAttr(col, key, size, required, def) {
  if (await attrExists(col, key)) return console.log(`  [${col}] string ${key}: istnieje`);
  const body = { key, size, required };
  if (!required && def !== undefined) body.default = def;
  await api("POST", `/databases/${DB_ID}/collections/${col}/attributes/string`, body);
  console.log(`  [${col}] string ${key}: ok`);
}

async function intAttr(col, key, required, def) {
  if (await attrExists(col, key)) return console.log(`  [${col}] integer ${key}: istnieje`);
  const body = { key, required };
  if (!required && def !== undefined) body.default = def;
  await api("POST", `/databases/${DB_ID}/collections/${col}/attributes/integer`, body);
  console.log(`  [${col}] integer ${key}: ok`);
}

async function boolAttr(col, key, required, def) {
  if (await attrExists(col, key)) return console.log(`  [${col}] boolean ${key}: istnieje`);
  const body = { key, required };
  if (!required && def !== undefined) body.default = def;
  await api("POST", `/databases/${DB_ID}/collections/${col}/attributes/boolean`, body);
  console.log(`  [${col}] boolean ${key}: ok`);
}

async function waitForAttributes(col, keys) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const list = await api("GET", `/databases/${DB_ID}/collections/${col}/attributes`);
    const byKey = new Map((list.attributes || []).map((a) => [a.key, a.status]));
    const pending = keys.filter((k) => byKey.get(k) !== "available");
    if (pending.length === 0) {
      console.log(`  [${col}] atrybuty available (${keys.length})`);
      return;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error(`[${col}] atrybuty nie osiagnely 'available' w czasie`);
}

async function ensureIndex(col, key, attributes) {
  const r = await api("POST", `/databases/${DB_ID}/collections/${col}/indexes`, {
    key,
    type: "key",
    attributes,
    orders: attributes.map(() => "ASC"),
  });
  console.log(`  [${col}] index ${key}: ${r.exists ? "istnieje" : "ok"}`);
}

async function main() {
  console.log(`Appwrite setup -> ${ENDPOINT} (project ${PROJECT})`);
  await ensureDatabase();

  // rooms
  await ensureCollection("rooms", "Rooms");
  await strAttr("rooms", "code", 16, true);
  await strAttr("rooms", "phase", 16, true);
  await strAttr("rooms", "hostClientId", 64, true);
  await strAttr("rooms", "luckyClientId", 64, false);
  await intAttr("rooms", "spinSeed", false);
  await intAttr("rooms", "spinStartedAt", false);
  await strAttr("rooms", "challengeType", 16, false);
  await strAttr("rooms", "challengeText", 2000, false);
  await boolAttr("rooms", "requireEndTurnApproval", false, true);
  await boolAttr("rooms", "requireNextTruthApproval", false, true);
  await boolAttr("rooms", "requireNextDareApproval", false, false);
  // Progi zgody (string enum) + auto-start.
  await strAttr("rooms", "endTurnApproval", 16, false, "majority");
  await strAttr("rooms", "nextTruthApproval", 16, false, "majority");
  await strAttr("rooms", "nextDareApproval", 16, false, "off");
  await boolAttr("rooms", "autoStart", false, false);
  // Czas (s) na odpowiedz / wyzwanie; 0 = licznik wylaczony.
  await intAttr("rooms", "truthSeconds", false, 0);
  await intAttr("rooms", "dareSeconds", false, 0);
  // Dobór treści: JSON map modeKey -> poziom 0..3.
  await strAttr("rooms", "contentSelection", 2000, false);
  // Przebieg gry: JSON tablica zakończonych tur (round-history.ts).
  await strAttr("rooms", "history", 6000, false);
  await strAttr("rooms", "pendingAction", 16, false);
  await intAttr("rooms", "createdAt", true);
  await waitForAttributes("rooms", [
    "code", "phase", "hostClientId", "luckyClientId", "spinSeed", "spinStartedAt",
    "challengeType", "challengeText", "requireEndTurnApproval", "requireNextTruthApproval",
    "requireNextDareApproval", "endTurnApproval", "nextTruthApproval", "nextDareApproval",
    "autoStart", "truthSeconds", "dareSeconds", "contentSelection", "history", "pendingAction", "createdAt",
  ]);

  // players
  await ensureCollection("players", "Players");
  await strAttr("players", "roomCode", 16, true);
  await strAttr("players", "clientId", 64, true);
  await strAttr("players", "name", 64, true);
  await strAttr("players", "avatarId", 32, true);
  await strAttr("players", "colorId", 32, true);
  await intAttr("players", "joinedAt", true);
  await waitForAttributes("players", ["roomCode", "clientId", "name", "avatarId", "colorId", "joinedAt"]);
  await ensureIndex("players", "by_room", ["roomCode"]);

  // votes
  await ensureCollection("votes", "Votes");
  await strAttr("votes", "roomCode", 16, true);
  await strAttr("votes", "action", 16, true);
  await strAttr("votes", "clientId", 64, true);
  await boolAttr("votes", "approved", true);
  await waitForAttributes("votes", ["roomCode", "action", "clientId", "approved"]);
  await ensureIndex("votes", "by_room", ["roomCode"]);

  // events — lekka analityka popytu (np. otwarcia kategorii). Fire-and-forget z klienta.
  await ensureCollection("events", "Events");
  await strAttr("events", "type", 32, true);
  await strAttr("events", "key", 64, true);
  await strAttr("events", "clientId", 64, false);
  await intAttr("events", "at", true);
  await waitForAttributes("events", ["type", "key", "clientId", "at"]);
  await ensureIndex("events", "by_type", ["type"]);

  console.log("\nGotowe. Backend Appwrite skonfigurowany.");
}

main().catch((err) => {
  console.error("\nSETUP FAILED:", err.message);
  process.exit(1);
});
