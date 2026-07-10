import {useEffect} from 'react';
import {useIAP} from 'react-native-iap';
import {ALL_IAP_SKUS, COIN_PACKS, IapSku} from '../constants/iapProducts';
import {useProgressStore} from '../store/useProgressStore';

/** Wires react-native-iap's purchase lifecycle to PaintRoll's coin/remove-ads state. */
export function useShopPurchases() {
  const addCoins = useProgressStore(state => state.addCoins);
  const setRemoveAdsPurchased = useProgressStore(state => state.setRemoveAdsPurchased);

  const {connected, products, fetchProducts, requestPurchase, finishTransaction, restorePurchases} = useIAP({
    onPurchaseSuccess: purchase => {
      const pack = COIN_PACKS.find(p => p.sku === purchase.productId);
      if (pack) {
        addCoins(pack.coins);
        void finishTransaction({purchase, isConsumable: true});
      } else if (purchase.productId === IapSku.REMOVE_ADS) {
        setRemoveAdsPurchased();
        void finishTransaction({purchase, isConsumable: false});
      }
    },
    onPurchaseError: error => {
      console.warn('[IAP] purchase error', error.message);
    },
    onError: error => {
      console.warn('[IAP] error', error.message);
    },
  });

  useEffect(() => {
    if (connected) {
      void fetchProducts({skus: ALL_IAP_SKUS, type: 'in-app'});
    }
  }, [connected, fetchProducts]);

  const buy = (sku: string) => {
    void requestPurchase({request: {google: {skus: [sku]}}, type: 'in-app'}).catch(error => {
      console.warn('[IAP] requestPurchase failed', error);
    });
  };

  return {connected, products, buy, restorePurchases};
}
