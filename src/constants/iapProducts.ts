/**
 * In-app product SKUs. These must be created in the Google Play Console
 * under the app's Monetize > Products screen before purchases will resolve
 * on a real device — react-native-iap only talks to whatever the store
 * already knows about.
 */
export const IapSku = {
  COINS_SMALL: 'com.paintroll.game.coins_small',
  COINS_MEDIUM: 'com.paintroll.game.coins_medium',
  COINS_LARGE: 'com.paintroll.game.coins_large',
  REMOVE_ADS: 'com.paintroll.game.remove_ads',
} as const;

export interface CoinPackDefinition {
  sku: string;
  coins: number;
  bonusLabel?: string;
}

export const COIN_PACKS: CoinPackDefinition[] = [
  {sku: IapSku.COINS_SMALL, coins: 300},
  {sku: IapSku.COINS_MEDIUM, coins: 800, bonusLabel: '+15% bonus'},
  {sku: IapSku.COINS_LARGE, coins: 2000, bonusLabel: '+30% bonus'},
];

export const ALL_IAP_SKUS: string[] = [...COIN_PACKS.map(p => p.sku), IapSku.REMOVE_ADS];
