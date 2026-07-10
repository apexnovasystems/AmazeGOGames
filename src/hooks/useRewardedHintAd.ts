import {useCallback, useEffect, useRef} from 'react';
import {TestIds, useRewardedAd} from 'react-native-google-mobile-ads';

// Google's published test rewarded ad unit ID — swap for the real
// production unit before shipping (see AdsService.ts for the same note).
const REWARDED_UNIT_ID = TestIds.REWARDED;

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
