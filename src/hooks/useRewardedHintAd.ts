import {useCallback, useEffect, useRef} from 'react';
import {TestIds, useRewardedAd} from 'react-native-google-mobile-ads';

// Real production ad unit, used only in release builds (see AdsService.ts
// for why debug builds keep using Google's test ad unit).
const REWARDED_UNIT_ID = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4112792783713543/1157119241';

/** Loads a rewarded ad and calls `onEarned` once, exactly when the user actually earns the reward. */
export function useRewardedHintAd(onEarned: () => void) {
  const {isLoaded, isEarnedReward, isClosed, load, show} = useRewardedAd(REWARDED_UNIT_ID);
  const consumedRef = useRef(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isEarnedReward && !consumedRef.current) {
      consumedRef.current = true;
      onEarned();
    }
  }, [isEarnedReward, onEarned]);

  useEffect(() => {
    if (isClosed) {
      consumedRef.current = false;
      load();
    }
  }, [isClosed, load]);

  const watch = useCallback(() => {
    if (isLoaded) {
      show();
    }
  }, [isLoaded, show]);

  return {isLoaded, watch};
}
