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
    throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  }
  return json;
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
  const body = { key, size, required };
  if (!required && def !== undefined) body.default = def;
  const r = await api("POST", `/databases/${DB_ID}/collections/${col}/attributes/string`, body);
  console.log(`  [${col}] string ${key}: ${r.exists ? "istnieje" : "ok"}`);
}

async function intAttr(col, key, required, def) {
  const body = { key, required };
  if (!required && def !== undefined) body.default = def;
  const r = await api("POST", `/databases/${DB_ID}/collections/${col}/attributes/integer`, body);
  console.log(`  [${col}] integer ${key}: ${r.exists ? "istnieje" : "ok"}`);
}

async function boolAttr(col, key, required, def) {
  const body = { key, required };
  if (!required && def !== undefined) body.default = def;
  const r = await api("POST", `/databases/${DB_ID}/collections/${col}/attributes/boolean`, body);
  console.log(`  [${col}] boolean ${key}: ${r.exists ? "istnieje" : "ok"}`);
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
  await strAttr("rooms", "pendingAction", 16, false);
  await intAttr("rooms", "createdAt", true);
  await waitForAttributes("rooms", [
    "code", "phase", "hostClientId", "luckyClientId", "spinSeed", "spinStartedAt",
    "challengeType", "challengeText", "requireEndTurnApproval", "requireNextTruthApproval",
    "requireNextDareApproval", "pendingAction", "createdAt",
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

  console.log("\nGotowe. Backend Appwrite skonfigurowany.");
}

main().catch((err) => {
  console.error("\nSETUP FAILED:", err.message);
  process.exit(1);
});
