import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useProgressStore} from '../../store/useProgressStore';
import {useShopPurchases} from '../../hooks/useShopPurchases';
import {COIN_PACKS, IapSku} from '../../constants/iapProducts';
import {THEME_SKINS, ThemeSkinDefinition} from '../../constants/themeSkins';
import {CurrencyBadge} from '../../components/HUD';
import {Card} from '../../components/Card';
import {Button} from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export function ShopScreen({navigation}: Props) {
  const theme = useAppTheme();
  const coins = useProgressStore(state => state.coins);
  const removeAdsPurchased = useProgressStore(state => state.removeAdsPurchased);
  const ownedThemeIds = useProgressStore(state => state.ownedThemeIds);
  const activeThemeId = useProgressStore(state => state.activeThemeId);
  const purchaseTheme = useProgressStore(state => state.purchaseTheme);
  const setActiveTheme = useProgressStore(state => state.setActiveTheme);

  const {connected, products, buy, restorePurchases} = useShopPurchases();

  const priceFor = (sku: string): string | null => products.find(p => p.id === sku)?.displayPrice ?? null;

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

        <ScrollView contentContainerStyle={styles.content}>
          {!connected && (
            <Text style={[styles.storeNotice, {color: theme.colors.textMuted}]}>
              Store connection unavailable on this device — coin packs and Remove Ads need the Play Store.
            </Text>
          )}

          <SectionLabel theme={theme} label="Remove Ads" />
          <Card style={styles.row}>
            <Icon name="shield-check" size={26} color={theme.colors.success} />
            <View style={styles.rowBody}>
              <Text style={[styles.rowTitle, {color: theme.colors.textPrimary}]}>Remove Ads</Text>
              <Text style={[styles.rowDesc, {color: theme.colors.textMuted}]}>
                No more interstitials, forever.
              </Text>
            </View>
            {removeAdsPurchased ? (
              <Icon name="check-circle" size={22} color={theme.colors.success} />
            ) : (
              <Button
                label={priceFor(IapSku.REMOVE_ADS) ?? 'Buy'}
                size="sm"
                disabled={!connected}
                onPress={() => buy(IapSku.REMOVE_ADS)}
              />
            )}
          </Card>

          <SectionLabel theme={theme} label="Coin Packs" />
          {COIN_PACKS.map(pack => (
            <Card key={pack.sku} style={styles.row}>
              <Icon name="hexagon-multiple" size={26} color={theme.colors.coin} />
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, {color: theme.colors.textPrimary}]}>{pack.coins} Coins</Text>
                {pack.bonusLabel && (
                  <Text style={[styles.rowDesc, {color: theme.colors.secondary}]}>{pack.bonusLabel}</Text>
                )}
              </View>
              <Button
                label={priceFor(pack.sku) ?? 'Buy'}
                size="sm"
                disabled={!connected}
                onPress={() => buy(pack.sku)}
              />
            </Card>
          ))}

          <SectionLabel theme={theme} label="Color Themes" />
          <View style={styles.skinGrid}>
            {THEME_SKINS.map(skin => (
              <ThemeSkinCard
                key={skin.id}
                skin={skin}
                owned={ownedThemeIds.includes(skin.id)}
                active={activeThemeId === skin.id}
                coins={coins}
                theme={theme}
                onPress={() => {
                  if (ownedThemeIds.includes(skin.id)) {
                    setActiveTheme(skin.id);
                  } else {
                    purchaseTheme(skin.id, skin.priceCoins);
                  }
                }}
              />
            ))}
          </View>

          <Button
            label="Restore Purchases"
            variant="ghost"
            size="md"
            fullWidth
            disabled={!connected}
            onPress={() => restorePurchases()}
            style={styles.restoreButton}
            icon={<Icon name="restore" size={18} color={theme.colors.textPrimary} />}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SectionLabel({theme, label}: {theme: ReturnType<typeof useAppTheme>; label: string}) {
  return <Text style={[styles.sectionLabel, {color: theme.colors.textMuted}]}>{label}</Text>;
}

function ThemeSkinCard({
  skin,
  owned,
  active,
  coins,
  theme,
  onPress,
}: {
  skin: ThemeSkinDefinition;
  owned: boolean;
  active: boolean;
  coins: number;
  theme: ReturnType<typeof useAppTheme>;
  onPress: () => void;
}) {
  const canAfford = owned || coins >= skin.priceCoins;

  return (
    <Card
      style={[
        styles.skinCard,
        active && {borderColor: theme.colors.primary, borderWidth: 2},
      ]}>
      <View style={styles.swatchRow}>
        {skin.preview.map((color, i) => (
          <View key={i} style={[styles.swatch, {backgroundColor: color}]} />
        ))}
      </View>
      <Text style={[styles.skinName, {color: theme.colors.textPrimary}]}>{skin.name}</Text>
      <Text style={[styles.skinDesc, {color: theme.colors.textMuted}]} numberOfLines={2}>
        {skin.description}
      </Text>
      <Button
        label={active ? 'Equipped' : owned ? 'Equip' : skin.priceCoins === 0 ? 'Free' : `${skin.priceCoins} coins`}
        size="sm"
        variant={active ? 'secondary' : 'primary'}
        disabled={active || !canAfford}
        fullWidth
        onPress={onPress}
      />
    </Card>
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
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  storeNotice: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 12,
  },
  skinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skinCard: {
    width: '47%',
    gap: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    flex: 1,
    height: 28,
    borderRadius: 6,
  },
  skinName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  skinDesc: {
    fontSize: 11,
    lineHeight: 15,
    minHeight: 30,
  },
  restoreButton: {
    marginTop: 16,
  },
});
