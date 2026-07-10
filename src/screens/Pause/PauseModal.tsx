import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppModal} from '../../components/Modal';
import {Button} from '../../components/Button';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal = memo(function PauseModal({visible, onResume, onRestart, onExit}: PauseModalProps) {
  const theme = useAppTheme();

  return (
    <AppModal visible={visible} onRequestClose={onResume} dismissOnBackdropPress>
      <View style={styles.content}>
        <Icon name="pause-circle" size={40} color={theme.colors.primary} />
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Paused</Text>
        <Button label="Resume" size="lg" fullWidth onPress={onResume} icon={<Icon name="play" size={18} color={theme.colors.textOnPrimary} />} />
        <Button
          label="Restart Level"
          variant="secondary"
          size="md"
          fullWidth
          onPress={onRestart}
          icon={<Icon name="restart" size={18} color={theme.colors.textOnPrimary} />}
        />
        <Button
          label="Exit to Levels"
          variant="ghost"
          size="md"
          fullWidth
          onPress={onExit}
          icon={<Icon name="exit-run" size={18} color={theme.colors.textPrimary} />}
        />
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
    marginBottom: 6,
  },
});
