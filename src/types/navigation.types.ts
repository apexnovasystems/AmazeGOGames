export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  LevelSelect: {packId?: string} | undefined;
  Game: {levelId: string; isDaily?: boolean};
  Settings: undefined;
  Shop: undefined;
  DailyChallenge: undefined;
  Achievements: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
