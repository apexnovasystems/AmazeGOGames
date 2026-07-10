import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useAchievementsStore} from '../../store/useAchievementsStore';
import {ACHIEVEMENTS} from '../../constants/achievements';

const VISIBLE_MS = 2600;

/** Mounted once near the navigation root — slides down whenever a new achievement unlocks. */
export function AchievementToast() {
  const theme = useAppTheme();
  const justUnlocked = useAchievementsStore(state => state.justUnlocked);
  const dismissToast = useAchievementsStore(state => state.dismissToast);
  const translateY = useSharedValue(-120);

  useEffect(() => {
    if (!justUnlocked) {
      return;
    }
    translateY.value = withSequence(
      withTiming(0, {duration: 320, easing: Easing.out(Easing.back(1.2))}),
      withDelay(VISIBLE_MS, withTiming(-120, {duration: 260, easing: Easing.in(Easing.cubic)})),
    );
    const timeout = setTimeout(dismissToast, VISIBLE_MS + 400);
    return () => clearTimeout(timeout);
  }, [justUnlocked, translateY, dismissToast]);

  const animatedStyle = useAnimatedStyle(() => ({transform: [{translateY: translateY.value}]}));

  if (!justUnlocked) {
    return null;
  }
  const def = ACHIEVEMENTS.find(a => a.id === justUnlocked);
  if (!def) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <View
        style={[
          styles.card,
          {backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.glassBorder, borderRadius: theme.radius.md},
        ]}>
        <View style={[styles.iconWrap, {backgroundColor: theme.colors.primary}]}>
          <Icon name={def.icon} size={22} color={theme.colors.textOnPrimary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.eyebrow, {color: theme.colors.textMuted}]}>Achievement Unlocked</Text>
          <Text style={[styles.name, {color: theme.colors.textPrimary}]}>{def.name}</Text>
        </View>
        <View style={styles.rewardWrap}>
          <Icon name="hexagon-multiple" size={16} color={theme.colors.coin} />
          <Text style={[styles.rewardText, {color: theme.colors.textPrimary}]}>+{def.coinsReward}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
  },
  rewardWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
