import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useAchievementsStore} from '../../store/useAchievementsStore';
import {useStatsStore} from '../../store/useStatsStore';
import {useProgressStore} from '../../store/useProgressStore';
import {useDailyChallengeStore} from '../../store/useDailyChallengeStore';
import {ACHIEVEMENTS, AchievementDefinition, AchievementMetric} from '../../constants/achievements';
import {Card} from '../../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

function useMetricValues(): Record<AchievementMetric, number> {
  const levelsCompleted = useStatsStore(state => state.levelsCompleted);
  const perfectClears = useStatsStore(state => state.perfectClears);
  const totalMoves = useStatsStore(state => state.totalMoves);
  const totalStars = useProgressStore(state => state.totalStars);
  const dailyStreak = useDailyChallengeStore(state => state.streak);

  return {levelsCompleted, perfectClears, totalMoves, totalStars, dailyStreak};
}

export function AchievementsScreen({navigation}: Props) {
  const theme = useAppTheme();
  const unlockedIds = useAchievementsStore(state => state.unlockedIds);
  const metrics = useMetricValues();
  const unlockedCount = unlockedIds.length;

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
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Achievements</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.subtitle, {color: theme.colors.textMuted}]}>
          {unlockedCount} / {ACHIEVEMENTS.length} unlocked
        </Text>

        <FlatList
          data={ACHIEVEMENTS}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <AchievementRow
              def={item}
              unlocked={unlockedIds.includes(item.id)}
              value={metrics[item.metric]}
              theme={theme}
            />
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

function AchievementRow({
  def,
  unlocked,
  value,
  theme,
}: {
  def: AchievementDefinition;
  unlocked: boolean;
  value: number;
  theme: ReturnType<typeof useAppTheme>;
}) {
  const progress = Math.min(1, value / def.target);

  return (
    <Card style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: unlocked ? theme.colors.primary : theme.colors.glass,
            borderColor: theme.colors.glassBorder,
            borderRadius: theme.radius.md,
          },
        ]}>
        <Icon name={def.icon} size={24} color={unlocked ? theme.colors.textOnPrimary : theme.colors.textMuted} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowName, {color: theme.colors.textPrimary}]}>{def.name}</Text>
        <Text style={[styles.rowDesc, {color: theme.colors.textMuted}]}>{def.description}</Text>
        {!unlocked && (
          <View style={[styles.progressTrack, {backgroundColor: theme.colors.glass}]}>
            <View
              style={[
                styles.progressFill,
                {width: `${progress * 100}%`, backgroundColor: theme.colors.primary},
              ]}
            />
          </View>
        )}
      </View>
      {unlocked ? (
        <Icon name="check-circle" size={22} color={theme.colors.success} />
      ) : (
        <View style={styles.rewardBadge}>
          <Icon name="hexagon-multiple" size={14} color={theme.colors.coin} />
          <Text style={[styles.rewardBadgeText, {color: theme.colors.textSecondary}]}>{def.coinsReward}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerSpacer: {width: 28},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
