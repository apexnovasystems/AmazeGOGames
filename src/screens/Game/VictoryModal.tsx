import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppModal} from '../../components/Modal';
import {Button} from '../../components/Button';
import {StarRow} from '../../components/HUD';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface VictoryModalProps {
  visible: boolean;
  stars: 0 | 1 | 2 | 3;
  moveCount: number;
  coinsEarned: number;
  timeBonus: number;
  hasNextLevel: boolean;
  onNext: () => void;
  onReplay: () => void;
  onExit: () => void;
}

export const VictoryModal = memo(function VictoryModal({
  visible,
  stars,
  moveCount,
  coinsEarned,
  timeBonus,
  hasNextLevel,
  onNext,
  onReplay,
  onExit,
}: VictoryModalProps) {
  const theme = useAppTheme();

  return (
    <AppModal visible={visible} dismissOnBackdropPress={false}>
      <View style={styles.content}>
        <Icon name="trophy" size={44} color={theme.colors.star} />
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Level Complete!</Text>
        <StarRow stars={stars} size={30} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="shoe-print" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.statValue, {color: theme.colors.textPrimary}]}>{moveCount} moves</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="hexagon-multiple" size={18} color={theme.colors.coin} />
            <Text style={[styles.statValue, {color: theme.colors.textPrimary}]}>+{coinsEarned}</Text>
          </View>
        </View>

        {timeBonus > 0 && (
          <View style={[styles.bonusPill, {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder}]}>
            <Icon name="lightning-bolt" size={14} color={theme.colors.warning} />
            <Text style={[styles.bonusText, {color: theme.colors.textPrimary}]}>+{timeBonus} speed bonus</Text>
          </View>
        )}

        {hasNextLevel && (
          <Button
            label="Next Level"
            size="lg"
            fullWidth
            onPress={onNext}
            icon={<Icon name="arrow-right-bold" size={18} color={theme.colors.textOnPrimary} />}
          />
        )}
        <Button
          label="Replay"
          variant="secondary"
          size="md"
          fullWidth
          onPress={onReplay}
          icon={<Icon name="restart" size={18} color={theme.colors.textOnPrimary} />}
        />
        <Button label="Levels" variant="ghost" size="md" fullWidth onPress={onExit} />
      </View>
    </AppModal>
  );
});

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginVertical: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bonusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: -6,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
