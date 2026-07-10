import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import {useAppTheme} from '../hooks/useAppTheme';

import {SplashScreen} from '../screens/Splash/SplashScreen';
import {HomeScreen} from '../screens/Home/HomeScreen';
import {LevelSelectScreen} from '../screens/LevelSelect/LevelSelectScreen';
import {GameScreen} from '../screens/Game/GameScreen';
import {SettingsScreen} from '../screens/Settings/SettingsScreen';
import {ShopScreen} from '../screens/Shop/ShopScreen';
import {DailyChallengeScreen} from '../screens/DailyChallenge/DailyChallengeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useAppTheme();

  const navTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      primary: theme.colors.primary,
      text: theme.colors.textPrimary,
      border: theme.colors.glassBorder,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {backgroundColor: theme.colors.background},
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} options={{animation: 'slide_from_bottom'}} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{animation: 'slide_from_right'}} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{animation: 'slide_from_right'}} />
        <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} options={{animation: 'slide_from_bottom'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
