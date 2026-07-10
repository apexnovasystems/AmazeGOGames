import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useAppTheme} from '../../hooks/useAppTheme';
import {StarRow} from '../../components/HUD';
import {LevelDefinition, LevelProgress} from '../../types';

export interface LevelCardProps {
  level: LevelDefinition;
  progress: LevelProgress | undefined;
  unlocked: boolean;
  onPress: (level: LevelDefinition) => void;
}

export const LevelCard = memo(function LevelCard({level, progress, unlocked, onPress}: LevelCardProps) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.95, {duration: 90});
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {duration: 140});
  }, [scale]);

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable
        onPress={() => unlocked && onPress(level)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: unlocked ? theme.colors.surface : theme.colors.glass,
            borderColor: theme.colors.glassBorder,
            borderRadius: theme.radius.md,
          },
        ]}>
        {unlocked ? (
          <>
            <Text style={[styles.orderLabel, {color: theme.colors.textMuted}]}>{level.order + 1}</Text>
            <Text numberOfLines={1} style={[styles.name, {color: theme.colors.textPrimary}]}>
              {level.name}
            </Text>
            <StarRow stars={progress?.stars ?? 0} size={13} />
          </>
        ) : (
          <Icon name="lock" size={22} color={theme.colors.textMuted} />
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 6,
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
