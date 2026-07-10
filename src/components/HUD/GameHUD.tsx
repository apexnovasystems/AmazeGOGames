import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface GameHUDProps {
  moveCount: number;
  elapsedMs: number;
  paintedCount: number;
  paintableTotal: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const GameHUD = memo(function GameHUD({moveCount, elapsedMs, paintedCount, paintableTotal}: GameHUDProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <Stat icon="shoe-print" value={String(moveCount)} theme={theme} />
      <Stat icon="timer-outline" value={formatTime(elapsedMs)} theme={theme} />
      <Stat icon="format-paint" value={`${paintedCount}/${paintableTotal}`} theme={theme} />
    </View>
  );
});

function Stat({icon, value, theme}: {icon: string; value: string; theme: ReturnType<typeof useAppTheme>}) {
  return (
    <View
      style={[
        styles.stat,
        {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder, borderRadius: theme.radius.pill},
      ]}>
      <Icon name={icon} size={16} color={theme.colors.textSecondary} />
      <Text style={[styles.value, {color: theme.colors.textPrimary}]}>{value}</Text>
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
