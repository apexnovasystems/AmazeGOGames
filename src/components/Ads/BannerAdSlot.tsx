import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {useProgressStore} from '../../store/useProgressStore';

// Real production ad unit, used only in release builds (see AdsService.ts
// for why debug builds keep using Google's test ad unit).
const BANNER_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-4112792783713543/1143043899';

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
