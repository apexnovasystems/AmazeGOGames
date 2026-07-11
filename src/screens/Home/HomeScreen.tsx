import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useProgressStore} from '../../store/useProgressStore';
import {Button} from '../../components/Button';
import {CurrencyBadge} from '../../components/HUD';
import {BannerAdSlot} from '../../components/Ads/BannerAdSlot';
import {LevelLoader} from '../../engine/LevelLoader';
import {SoundService} from '../../services/SoundService';
import {MusicService} from '../../services/MusicService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  const theme = useAppTheme();
  const coins = useProgressStore(state => state.coins);
  const totalStars = useProgressStore(state => state.totalStars);
  const currentLevelId = useProgressStore(state => state.currentLevelId);

  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withDelay(
      200,
      withRepeat(withTiming(1, {duration: 1800, easing: Easing.inOut(Easing.sin)}), -1, true),
    );
  }, [floatY]);

  useEffect(() => {
    SoundService.preloadAll();
    MusicService.start();
  }, []);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{translateY: floatY.value * -10}],
  }));

  const nextLevel = currentLevelId ? LevelLoader.getLevelById(currentLevelId) : undefined;
  const playTarget = nextLevel ?? LevelLoader.getFirstLevel();

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <CurrencyBadge icon="hexagon-multiple" value={coins} tint={theme.colors.coin} />
          <CurrencyBadge icon="star" value={totalStars} tint={theme.colors.star} />
          <View style={styles.topBarSpacer} />
          <Icon
            name="trophy-outline"
            size={24}
            color={theme.colors.textPrimary}
            onPress={() => navigation.navigate('Achievements')}
            suppressHighlighting
            style={styles.topBarIcon}
          />
          <Icon
            name="cog"
            size={26}
            color={theme.colors.textPrimary}
            onPress={() => navigation.navigate('Settings')}
            suppressHighlighting
          />
        </View>

        <View style={styles.hero}>
          <Animated.View style={floatStyle}>
            <View
              style={[
                styles.ballHero,
                {backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary},
              ]}
            />
          </Animated.View>
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>
            Paint<Text style={{color: theme.colors.primary}}>Roll</Text>
          </Text>
          <Text style={[styles.tagline, {color: theme.colors.textMuted}]}>
            Roll the ball. Paint every tile. Outsmart the grid.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={nextLevel ? `Continue — ${nextLevel.name}` : 'Play'}
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Game', {levelId: playTarget.id})}
            icon={<Icon name="play" size={20} color={theme.colors.textOnPrimary} />}
          />
          <View style={styles.row}>
            <Button
              label="Levels"
              variant="secondary"
              size="md"
              style={styles.rowItem}
              onPress={() => navigation.navigate('LevelSelect')}
              icon={<Icon name="view-grid" size={18} color={theme.colors.textOnPrimary} />}
            />
            <Button
              label="Daily"
              variant="secondary"
              size="md"
              style={styles.rowItem}
              onPress={() => navigation.navigate('DailyChallenge')}
              icon={<Icon name="calendar-star" size={18} color={theme.colors.textOnPrimary} />}
            />
          </View>
          <View style={styles.shopWrap}>
            <Button
              label="Shop"
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => navigation.navigate('Shop')}
              icon={<Icon name="cart" size={18} color={theme.colors.textPrimary} />}
            />
            <View style={[styles.comingSoonBadge, {backgroundColor: theme.colors.accent}]} pointerEvents="none">
              <Text style={styles.comingSoonText}>SOON</Text>
            </View>
          </View>
        </View>

        <BannerAdSlot />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topBarSpacer: {flex: 1},
  topBarIcon: {marginRight: 4},
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ballHero: {
    width: 84,
    height: 84,
    borderRadius: 42,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  rowItem: {
    flex: 1,
  },
  shopWrap: {
    position: 'relative',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
