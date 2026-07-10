import mobileAds, {AdEventType, InterstitialAd, TestIds} from 'react-native-google-mobile-ads';
import {AdConfig} from '../constants/gameConfig';
import {useProgressStore} from '../store/useProgressStore';

// Google's published test ad unit IDs. Swap for the real production ad
// units (from the AdMob console) before shipping — same as the test
// Application ID already wired into AndroidManifest.xml.
const INTERSTITIAL_UNIT_ID = TestIds.INTERSTITIAL;

class AdsServiceImpl {
  private initialized = false;
  private interstitial: InterstitialAd | null = null;
  private interstitialLoaded = false;
  private completionsSinceInterstitial = 0;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    try {
      await mobileAds().initialize();
      this.loadInterstitial();
    } catch (error) {
      console.warn('[AdsService] initialize failed', error);
    }
  }

  private loadInterstitial(): void {
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });
    ad.addAdEventListener(AdEventType.LOADED, () => {
      this.interstitialLoaded = true;
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      this.interstitialLoaded = false;
      this.loadInterstitial();
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      this.interstitialLoaded = false;
    });
    ad.load();
    this.interstitial = ad;
  }

  /** Call once per level completion. Shows an interstitial every N completions. */
  notifyLevelCompleted(): void {
    if (useProgressStore.getState().removeAdsPurchased) {
      return;
    }
    this.completionsSinceInterstitial += 1;
    if (this.completionsSinceInterstitial >= AdConfig.INTERSTITIAL_EVERY_N_LEVELS) {
      this.completionsSinceInterstitial = 0;
      this.showInterstitial();
    }
  }

  private showInterstitial(): void {
    if (this.interstitial && this.interstitialLoaded) {
      this.interstitial.show();
    }
  }
}

export const AdsService = new AdsServiceImpl();
