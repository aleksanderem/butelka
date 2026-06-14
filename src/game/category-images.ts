// Obrazy głównych kategorii (generowane przez higgsfield, JPEG ~900px).
// Klucz = modeGroup (V3). Brak wpisu => karta użyje gradientu fallback.

import type { ImageSourcePropType } from "react-native";

export const CATEGORY_IMAGES: Record<string, ImageSourcePropType | undefined> = {
  classic: require("../../assets/categories/classic.jpg"),
  teen: require("../../assets/categories/teen.jpg"),
  party: require("../../assets/categories/18-party.jpg"),
  couple: require("../../assets/categories/couples.jpg"),
  group_hot: require("../../assets/categories/18-hot-group.jpg"),
  couple_hot: require("../../assets/categories/couples-hot.jpg"),
};
