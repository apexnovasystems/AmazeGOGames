import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppModal} from '../../components/Modal';
import {Button} from '../../components/Button';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface FailedModalProps {
  visible: boolean;
  paintedCount: number;
  paintableTotal: number;
  onRetry: () => void;
  onExit: () => void;
}

export const FailedModal = memo(function FailedModal({
  visible,
  paintedCount,
  paintableTotal,
  onRetry,
  onExit,
}: FailedModalProps) {
  const theme = useAppTheme();

  return (
    <AppModal visible={visible} dismissOnBackdropPress={false}>
      <View style={styles.content}>
        <Icon name="timer-off-outline" size={44} color={theme.colors.danger} />
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Time's Up!</Text>
        <Text style={[styles.subtitle, {color: theme.colors.textMuted}]}>
          You painted {paintedCount} of {paintableTotal} tiles. So close — give it another roll.
        </Text>

        <Button
          label="Retry"
          size="lg"
          fullWidth
          onPress={onRetry}
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
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});
