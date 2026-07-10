import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useProgressStore} from '../../store/useProgressStore';
import {useDailyChallengeStore} from '../../store/useDailyChallengeStore';
import {DailyChallengeEngine} from '../../engine/DailyChallengeEngine';
import {GameConfig} from '../../constants/gameConfig';
import {Card} from '../../components/Card';
import {Button} from '../../components/Button';
import {StarRow} from '../../components/HUD';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyChallenge'>;

export function DailyChallengeScreen({navigation}: Props) {
  const theme = useAppTheme();
  const todayKey = DailyChallengeEngine.todayKey();
  const level = DailyChallengeEngine.getLevelForDate(todayKey);
  const streak = useDailyChallengeStore(state => state.streak);
  const completedToday = useDailyChallengeStore(state => state.isCompletedToday());
  const levelProgress = useProgressStore(state => state.getLevelProgress(level.id));
  const totalReward = level.coinsReward + GameConfig.DAILY_CHALLENGE_COIN_REWARD;

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
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Daily Challenge</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Card style={styles.streakCard}>
            <Icon name="fire" size={26} color={theme.colors.accent} />
            <Text style={[styles.streakValue, {color: theme.colors.textPrimary}]}>{streak}</Text>
            <Text style={[styles.streakLabel, {color: theme.colors.textMuted}]}>
              day streak{streak === 1 ? '' : 's'}
            </Text>
          </Card>

          <Card style={styles.levelCard}>
            <Icon name="calendar-star" size={40} color={theme.colors.primary} />
            <Text style={[styles.levelName, {color: theme.colors.textPrimary}]}>{level.name}</Text>
            <Text style={[styles.levelMeta, {color: theme.colors.textMuted}]}>
              {level.rows}×{level.cols} grid · {level.difficulty}
            </Text>
            {levelProgress && levelProgress.stars > 0 && (
              <StarRow stars={levelProgress.stars} size={20} />
            )}
            <View style={[styles.rewardPill, {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder}]}>
              <Icon name="hexagon-multiple" size={16} color={theme.colors.coin} />
              <Text style={[styles.rewardText, {color: theme.colors.textPrimary}]}>+{totalReward} coins today</Text>
            </View>
          </Card>

          <Button
            label={completedToday ? 'Come back tomorrow' : 'Play Daily Challenge'}
            size="lg"
            fullWidth
            disabled={completedToday}
            onPress={() => navigation.navigate('Game', {levelId: level.id, isDaily: true})}
            icon={
              <Icon
                name={completedToday ? 'check-circle' : 'play'}
                size={20}
                color={theme.colors.textOnPrimary}
              />
            }
          />
          {completedToday && (
            <Text style={[styles.completedNote, {color: theme.colors.textMuted}]}>
              You've claimed today's reward. A new challenge unlocks at midnight UTC.
            </Text>
          )}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerSpacer: {width: 28},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  streakCard: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 16,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  levelName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  levelMeta: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
  },
  completedNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
