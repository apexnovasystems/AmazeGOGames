import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface CurrencyBadgeProps {
  icon: string;
  value: number | string;
  tint?: string;
}

export const CurrencyBadge = memo(function CurrencyBadge({icon, value, tint}: CurrencyBadgeProps) {
  const theme = useAppTheme();
  const color = tint ?? theme.colors.coin;

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder, borderRadius: theme.radius.pill},
      ]}>
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.value, {color: theme.colors.textPrimary}]}>{value}</Text>
    </View>
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
