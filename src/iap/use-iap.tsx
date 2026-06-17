import { useIAP } from "expo-iap";
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";

import { deriveEntitlements, type Entitlements } from "@/iap/entitlements";
import { ALL_PRODUCT_IDS } from "@/iap/products";

interface IapApi {
  ready: boolean;
  entitlements: Entitlements;
  /** product ID -> sformatowana cena lokalna ze StoreKitu (np. "19,99 zł"). */
  priceFor: (productId: string) => string | null;
  purchase: (productId: string) => void;
  restore: () => void;
}

const IapContext = createContext<IapApi | null>(null);

/** Wywołuje useIAP TYLKO tu (globalne listenery). Wystawia entitlementy + akcje całej apce. */
export function IapProvider({ children }: { children: ReactNode }) {
  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    getAvailablePurchases,
    requestPurchase,
    finishTransaction,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      // Brak walidacji serwerowej (StoreKit 2 weryfikuje on-device). Finalizujemy i odświeżamy.
      await finishTransaction({ purchase, isConsumable: false });
      await getAvailablePurchases();
    },
    onPurchaseError: () => {
      // Anulowanie / błąd: nic nie odblokowujemy; UI pozostaje zablokowane.
    },
  });

  useEffect(() => {
    if (connected) {
      void fetchProducts({ skus: [...ALL_PRODUCT_IDS], type: "in-app" });
      void getAvailablePurchases();
    }
  }, [connected, fetchProducts, getAvailablePurchases]);

  const entitlements = useMemo(
    () => deriveEntitlements(availablePurchases.map((p) => p.productId)),
    [availablePurchases]
  );

  const priceFor = useCallback(
    (productId: string) => products.find((p) => p.id === productId)?.displayPrice ?? null,
    [products]
  );

  const purchase = useCallback(
    (productId: string) => {
      void requestPurchase({ request: { apple: { sku: productId } }, type: "in-app" });
    },
    [requestPurchase]
  );

  const restore = useCallback(() => {
    void restorePurchases().then(() => getAvailablePurchases());
  }, [restorePurchases, getAvailablePurchases]);

  const value = useMemo<IapApi>(
    () => ({ ready: connected, entitlements, priceFor, purchase, restore }),
    [connected, entitlements, priceFor, purchase, restore]
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}

export function useIap(): IapApi {
  const ctx = useContext(IapContext);
  if (!ctx) {
    throw new Error("useIap musi być wewnątrz <IapProvider>");
  }
  return ctx;
}
