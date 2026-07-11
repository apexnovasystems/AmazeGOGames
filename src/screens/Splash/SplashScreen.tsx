import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';

const apexNovaLogo = require('../../assets/branding/apexnova-logo-transparent.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const DOT_COUNT = 5;

export function SplashScreen({navigation}: Props) {
  const theme = useAppTheme();
  const ballTranslateX = useSharedValue(-90);
  const ballScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const dotsProgress = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    ballScale.value = withTiming(1, {duration: 400, easing: Easing.out(Easing.exp)});
    ballTranslateX.value = withTiming(90, {
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
    });
    logoOpacity.value = withDelay(400, withTiming(1, {duration: 500}));
    dotsProgress.value = withDelay(
      700,
      withRepeat(withTiming(1, {duration: 900, easing: Easing.linear}), -1, false),
    );
    footerOpacity.value = withDelay(900, withTiming(1, {duration: 600}));

    const timer = setTimeout(() => {
      runOnJS(navigation.replace)('Home');
    }, 1900);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{translateX: ballTranslateX.value}, {scale: ballScale.value}],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{translateY: (1 - logoOpacity.value) * 12}],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.trackWrapper}>
            <View style={[styles.track, {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder}]} />
            <Animated.View
              style={[
                styles.ball,
                {backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary},
                ballStyle,
              ]}
            />
          </View>

          <Animated.View style={logoStyle}>
            <Text style={[styles.title, {color: theme.colors.textPrimary}]}>
              Paint<Text style={{color: theme.colors.primary}}>Roll</Text>
            </Text>
            <Text style={[styles.subtitle, {color: theme.colors.textMuted}]}>swipe. roll. paint everything.</Text>
          </Animated.View>

          <View style={styles.dotsRow}>
            {Array.from({length: DOT_COUNT}).map((_, index) => (
              <LoadingDot key={index} index={index} progress={dotsProgress} color={theme.colors.primary} />
            ))}
          </View>
        </View>

        <Animated.View style={[styles.footer, footerStyle]}>
          <Text style={[styles.poweredBy, {color: theme.colors.textMuted}]}>Powered by</Text>
          <Image source={apexNovaLogo} style={styles.footerLogo} resizeMode="contain" />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function LoadingDot({
  index,
  progress,
  color,
}: {
  index: number;
  progress: SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const phase = (progress.value + index / DOT_COUNT) % 1;
    const pulse = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
    return {
      opacity: 0.3 + pulse * 0.7,
      transform: [{scale: 0.7 + pulse * 0.5}],
    };
  });
  return <Animated.View style={[styles.dot, {backgroundColor: color}, style]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  footer: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  poweredBy: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  footerLogo: {
    width: 150,
    height: 77,
  },
  trackWrapper: {
    width: 220,
    height: 36,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'center',
  },
  ball: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
