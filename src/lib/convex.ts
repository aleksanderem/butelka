import { ConvexReactClient } from "convex/react";

const url = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!url) {
  throw new Error(
    "Brak EXPO_PUBLIC_CONVEX_URL — uruchom `npx convex dev`, aby wygenerować .env.local."
  );
}

export const convexClient = new ConvexReactClient(url);
