export type AchievementMetric = 'levelsCompleted' | 'perfectClears' | 'totalStars' | 'totalMoves' | 'dailyStreak';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  metric: AchievementMetric;
  target: number;
  coinsReward: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-clear',
    name: 'First Splash',
    description: 'Complete your first level.',
    icon: 'flag-checkered',
    metric: 'levelsCompleted',
    target: 1,
    coinsReward: 20,
  },
  {
    id: 'six-levels',
    name: 'Roller',
    description: 'Complete 6 levels.',
    icon: 'checkbox-multiple-marked-outline',
    metric: 'levelsCompleted',
    target: 6,
    coinsReward: 40,
  },
  {
    id: 'all-levels',
    name: 'Grand Painter',
    description: 'Complete every level in Origins.',
    icon: 'trophy',
    metric: 'levelsCompleted',
    target: 12,
    coinsReward: 150,
  },
  {
    id: 'first-perfect',
    name: 'Flawless',
    description: 'Earn 3 stars on a level.',
    icon: 'star-circle',
    metric: 'perfectClears',
    target: 1,
    coinsReward: 30,
  },
  {
    id: 'five-perfect',
    name: 'Perfectionist',
    description: 'Earn 3 stars on 5 levels.',
    icon: 'star-circle-outline',
    metric: 'perfectClears',
    target: 5,
    coinsReward: 80,
  },
  {
    id: 'star-collector',
    name: 'Star Collector',
    description: 'Earn 20 stars total.',
    icon: 'star',
    metric: 'totalStars',
    target: 20,
    coinsReward: 100,
  },
  {
    id: 'star-hoarder',
    name: 'Star Hoarder',
    description: 'Earn all 36 stars.',
    icon: 'shimmer',
    metric: 'totalStars',
    target: 36,
    coinsReward: 200,
  },
  {
    id: 'daily-3',
    name: 'Habit Forming',
    description: 'Reach a 3-day daily streak.',
    icon: 'calendar-check',
    metric: 'dailyStreak',
    target: 3,
    coinsReward: 40,
  },
  {
    id: 'daily-7',
    name: 'Dedicated',
    description: 'Reach a 7-day daily streak.',
    icon: 'calendar-star',
    metric: 'dailyStreak',
    target: 7,
    coinsReward: 100,
  },
  {
    id: 'marathon',
    name: 'Marathon Roller',
    description: 'Make 500 total moves.',
    icon: 'shoe-print',
    metric: 'totalMoves',
    target: 500,
    coinsReward: 50,
  },
];
