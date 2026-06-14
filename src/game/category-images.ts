// Obrazy głównych kategorii (generowane przez higgsfield, skompresowane do JPEG ~900px).
// Klucz = modeKey. Brak wpisu => karta użyje gradientu fallback.

import type { ImageSourcePropType } from "react-native";

export const CATEGORY_IMAGES: Record<string, ImageSourcePropType | undefined> = {
  classic: require("../../assets/categories/classic.jpg"),
  teen: require("../../assets/categories/teen.jpg"),
  couples: require("../../assets/categories/couples.jpg"),
  "couples-hot": require("../../assets/categories/couples-hot.jpg"),
  "18-party": require("../../assets/categories/18-party.jpg"),
  "18-hot-group": require("../../assets/categories/18-hot-group.jpg"),
  "18-very-hot": require("../../assets/categories/18-very-hot.jpg"),
};
