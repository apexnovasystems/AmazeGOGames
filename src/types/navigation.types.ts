export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  LevelSelect: {packId?: string} | undefined;
  Game: {levelId: string};
  Settings: undefined;
  Shop: undefined;
  DailyChallenge: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
