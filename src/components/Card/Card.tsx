import React, {memo} from 'react';
import {StyleSheet, View, ViewStyle, StyleProp} from 'react-native';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

/**
 * Glassmorphism surface: translucent tinted background + soft border +
 * shadow, built from plain Views so it stays free of extra native deps.
 */
export const Card = memo(function Card({children, style, padded = true}: CardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.glass,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.glassBorder,
          shadowColor: theme.colors.shadow,
        },
        style,
      ]}>
      <View style={padded ? styles.padded : undefined}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 3,
  },
  padded: {
    padding: 16,
  },
});
