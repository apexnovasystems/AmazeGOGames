import React, {memo, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface CurrencyBadgeProps {
  icon: string;
  value: number | string;
  tint?: string;
}

const COUNT_UP_DURATION_MS = 450;

export const CurrencyBadge = memo(function CurrencyBadge({icon, value, tint}: CurrencyBadgeProps) {
  const theme = useAppTheme();
  const color = tint ?? theme.colors.coin;
  const scale = useSharedValue(1);
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const from = previousValue.current;
    if (typeof value !== 'number' || typeof from !== 'number' || value === from) {
      setDisplayValue(value);
      previousValue.current = value;
      return undefined;
    }

    scale.value = withSequence(withTiming(1.2, {duration: 110}), withTiming(1, {duration: 200}));

    const start = Date.now();
    let raf: ReturnType<typeof requestAnimationFrame>;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / COUNT_UP_DURATION_MS);
      setDisplayValue(Math.round(from + (value - from) * t));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        previousValue.current = value;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, scale]);

  const animatedStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder, borderRadius: theme.radius.pill},
        animatedStyle,
      ]}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.value, {color: theme.colors.textPrimary}]}>{displayValue}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});
