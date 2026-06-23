import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Linking, Modal, Text, View } from "react-native";

import { NeonButton } from "@/components/neon-button";
import { mainCategoryByKey, mainDesc, mainName } from "@/game/main-categories";
import { isCategoryUnlocked } from "@/iap/entitlements";
import { CATEGORY_PRODUCT_ID, PRO_PRODUCT_ID, type PremiumCategory } from "@/iap/products";
import { useIap } from "@/iap/use-iap";
import { neon } from "@/theme/colors";

const PRIVACY_URL = "https://butelka-legal.aleksander-kolabogroup.workers.dev/privacy";

export function Paywall({ category, onClose }: { category: PremiumCategory; onClose: () => void }) {
  const { entitlements, priceFor, purchase, restore } = useIap();
  const cat = mainCategoryByKey(category);
  const catLabel = cat ? mainName(cat) : "";
  const singlePrice = priceFor(CATEGORY_PRODUCT_ID[category]);
  const proPrice = priceFor(PRO_PRODUCT_ID);

  // Gdy kategoria zostanie odblokowana (zakup/restore) — zamknij paywall.
  useEffect(() => {
    if (isCategoryUnlocked(category, entitlements)) {
      onClose();
    }
  }, [category, entitlements, onClose]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(4,2,10,0.82)" }}>
        <View
          className="gap-4 rounded-t-3xl p-5"
          style={{
            backgroundColor: neon.surface,
            borderColor: "rgba(192,132,252,0.4)",
            borderTopWidth: 1,
          }}
        >
          <View className="items-center gap-1.5">
            <Ionicons color={neon.purpleBright} name="sparkles" size={28} />
            <Text className="text-xl font-extrabold text-foreground">Odblokuj {catLabel}</Text>
            <Text className="text-center text-sm leading-5 text-muted">
              {cat ? mainDesc(cat) : ""}
            </Text>
          </View>

          <NeonButton
            label={proPrice ? `PRO — wszystko za ${proPrice}` : "PRO — wszystko"}
            onPress={() => purchase(PRO_PRODUCT_ID)}
            variant="violet"
          />
          <NeonButton
            label={singlePrice ? `Tylko ${catLabel} — ${singlePrice}` : `Odblokuj ${catLabel}`}
            onPress={() => purchase(CATEGORY_PRODUCT_ID[category])}
            variant="pink"
          />
          <NeonButton label="Przywróć zakupy" onPress={restore} variant="ghost" />

          <View className="flex-row items-center justify-center gap-4">
            <Text className="text-xs text-muted" onPress={onClose}>
              Może później
            </Text>
            <Text
              className="text-xs text-muted"
              onPress={() => void Linking.openURL(PRIVACY_URL)}
              style={{ textDecorationLine: "underline" }}
            >
              Prywatność
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
