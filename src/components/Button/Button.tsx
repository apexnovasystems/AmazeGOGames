import React, {memo, useCallback} from 'react';
import {Pressable, StyleSheet, Text, ViewStyle, Vibration, StyleProp} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming, Easing} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useSettingsStore} from '../../store/useSettingsStore';
import {SoundService} from '../../services/SoundService';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const sizeMap: Record<ButtonSize, {paddingVertical: number; paddingHorizontal: number; fontSize: number}> = {
  sm: {paddingVertical: 8, paddingHorizontal: 16, fontSize: 14},
  md: {paddingVertical: 14, paddingHorizontal: 24, fontSize: 16},
  lg: {paddingVertical: 18, paddingHorizontal: 32, fontSize: 18},
};

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  style,
  testID,
}: ButtonProps) {
  const theme = useAppTheme();
  const vibrationEnabled = useSettingsStore(state => state.vibrationEnabled);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.94, {duration: 90, easing: Easing.out(Easing.quad)});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {duration: 140, easing: Easing.out(Easing.back(2))});
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }
    if (vibrationEnabled) {
      Vibration.vibrate(12);
    }
    SoundService.play('click');
    onPress();
  }, [disabled, onPress, vibrationEnabled]);

  const sizing = sizeMap[size];
  const colors = theme.colors;

  const gradientColors: [string, string] = (() => {
    switch (variant) {
      case 'secondary':
        return [colors.secondary, colors.primaryLight];
      case 'danger':
        return [colors.danger, colors.accent];
      case 'ghost':
        return [colors.glass, colors.glass];
      case 'primary':
      default:
        return [colors.primary, colors.primaryDark];
    }
  })();

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{disabled}}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={gradientColors}
          style={[
            styles.base,
            {
              paddingVertical: sizing.paddingVertical,
              paddingHorizontal: sizing.paddingHorizontal,
              borderRadius: theme.radius.lg,
              opacity: disabled ? 0.5 : 1,
              borderWidth: variant === 'ghost' ? 1 : 0,
              borderColor: colors.glassBorder,
            },
          ]}>
          {icon}
          <Text
            style={[
              styles.label,
              {
                fontSize: sizing.fontSize,
                color: variant === 'ghost' ? colors.textPrimary : colors.textOnPrimary,
                marginLeft: icon ? 8 : 0,
              },
            ]}>
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontWeight: '700',
  },
});
