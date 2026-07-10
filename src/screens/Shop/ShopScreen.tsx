import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useProgressStore} from '../../store/useProgressStore';
import {CurrencyBadge} from '../../components/HUD';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export function ShopScreen({navigation}: Props) {
  const theme = useAppTheme();
  const coins = useProgressStore(state => state.coins);

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Icon
            name="chevron-left"
            size={28}
            color={theme.colors.textPrimary}
            onPress={() => navigation.goBack()}
            suppressHighlighting
          />
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Shop</Text>
          <CurrencyBadge icon="hexagon-multiple" value={coins} tint={theme.colors.coin} />
        </View>
        <View style={styles.center}>
          <Icon name="cart-outline" size={40} color={theme.colors.textMuted} />
          <Text style={{color: theme.colors.textMuted, marginTop: 8}}>Coin packs and themes arrive here.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
