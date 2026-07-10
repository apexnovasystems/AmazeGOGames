import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../hooks/useAppTheme';

export interface StarRowProps {
  stars: 0 | 1 | 2 | 3;
  size?: number;
}

export const StarRow = memo(function StarRow({stars, size = 16}: StarRowProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      {[0, 1, 2].map(i => (
        <Icon
          key={i}
          name={i < stars ? 'star' : 'star-outline'}
          size={size}
          color={i < stars ? theme.colors.star : theme.colors.starEmpty}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
