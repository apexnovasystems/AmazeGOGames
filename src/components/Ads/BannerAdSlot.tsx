import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {useProgressStore} from '../../store/useProgressStore';

// Google's published test banner ad unit ID — swap for the real production
// unit before shipping (see AdsService.ts for the same note).
const BANNER_UNIT_ID = TestIds.BANNER;

/** Anchored adaptive banner. Renders nothing once Remove Ads is purchased, or if the ad fails to fill. */
export function BannerAdSlot() {
  const removeAdsPurchased = useProgressStore(state => state.removeAdsPurchased);
  const [failed, setFailed] = useState(false);

  if (removeAdsPurchased || failed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});
