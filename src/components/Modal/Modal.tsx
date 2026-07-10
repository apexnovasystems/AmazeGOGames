import React, {memo, useEffect} from 'react';
import {Modal as RNModal, Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface AppModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  dismissOnBackdropPress?: boolean;
  children: React.ReactNode;
}

export const AppModal = memo(function AppModal({
  visible,
  onRequestClose,
  dismissOnBackdropPress = true,
  children,
}: AppModalProps) {
  const theme = useAppTheme();
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, {duration: 200, easing: Easing.out(Easing.quad)});
      scale.value = withSpring(1, {damping: 14, stiffness: 160});
    } else {
      backdropOpacity.value = withTiming(0, {duration: 150});
      scale.value = withTiming(0.85, {duration: 150});
    }
  }, [visible, backdropOpacity, scale]);

  const backdropStyle = useAnimatedStyle(() => ({opacity: backdropOpacity.value}));
  const cardStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  return (
    <RNModal transparent visible={visible} animationType="none" onRequestClose={onRequestClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, {backgroundColor: theme.colors.overlay}, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdropPress ? onRequestClose : undefined}
        />
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xl,
              borderColor: theme.colors.glassBorder,
            },
            cardStyle,
          ]}>
          <View>{children}</View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderWidth: 1,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
});
