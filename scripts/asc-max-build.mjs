// Wypisuje najwyższy numer builda (CFBundleVersion) obecny w App Store Connect.
// Służy jako podpowiedź dla scripts/ios-local.sh (numer kolejnego builda musi być wyższy).
// Klucz API czytany z ~/.appstoreconnect/private_keys/ (gitignored, nie w repo).
import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const KEY_ID = "552HR92J68";
const ISSUER = "bb339c95-6558-4dd4-ac28-aab0076dc370";
const APP = "6780188325";
const P8 = readFileSync(`${process.env.HOME}/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8`, "utf8");

const b64 = (b) => Buffer.from(b).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const now = Math.floor(Date.now() / 1000);
const head = b64(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }));
const pay = b64(JSON.stringify({ iss: ISSUER, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }));
const sig = b64(crypto.sign("SHA256", Buffer.from(head + "." + pay), { key: P8, dsaEncoding: "ieee-p1363" }));
const token = `${head}.${pay}.${sig}`;

const res = await fetch(
  `https://api.appstoreconnect.apple.com/v1/apps/${APP}/builds?limit=200&fields[builds]=version`,
  { headers: { Authorization: "Bearer " + token } }
);
const json = await res.json();
const nums = (json.data || []).map((b) => parseInt(b.attributes.version, 10)).filter((n) => !Number.isNaN(n));
console.log(nums.length ? Math.max(...nums) : 0);
