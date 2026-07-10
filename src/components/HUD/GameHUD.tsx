import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface GameHUDProps {
  moveCount: number;
  elapsedMs: number;
  /** Countdown limit in ms. 0/undefined means untimed — shows elapsed time instead. */
  timeLimitMs?: number;
  paintedCount: number;
  paintableTotal: number;
}

const LOW_TIME_WARNING_MS = 15000;

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const GameHUD = memo(function GameHUD({moveCount, elapsedMs, timeLimitMs, paintedCount, paintableTotal}: GameHUDProps) {
  const theme = useAppTheme();
  const isCountdown = Boolean(timeLimitMs && timeLimitMs > 0);
  const remainingMs = isCountdown ? Math.max(0, (timeLimitMs as number) - elapsedMs) : elapsedMs;
  const isLow = isCountdown && remainingMs <= LOW_TIME_WARNING_MS;

  return (
    <View style={styles.row}>
      <Stat icon="shoe-print" value={String(moveCount)} theme={theme} />
      <Stat
        icon={isCountdown ? 'timer-sand' : 'timer-outline'}
        value={formatTime(remainingMs)}
        theme={theme}
        tint={isLow ? theme.colors.danger : undefined}
      />
      <Stat icon="format-paint" value={`${paintedCount}/${paintableTotal}`} theme={theme} />
    </View>
  );
});

function Stat({
  icon,
  value,
  theme,
  tint,
}: {
  icon: string;
  value: string;
  theme: ReturnType<typeof useAppTheme>;
  tint?: string;
}) {
  return (
    <View
      style={[
        styles.stat,
        {
          backgroundColor: theme.colors.glass,
          borderColor: tint ?? theme.colors.glassBorder,
          borderRadius: theme.radius.pill,
        },
      ]}>
      <Icon name={icon} size={16} color={tint ?? theme.colors.textSecondary} />
      <Text style={[styles.value, {color: tint ?? theme.colors.textPrimary}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 6,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
});
