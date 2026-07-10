import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation/RootNavigator';
import {useSettingsStore} from './src/store/useSettingsStore';

function App() {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore(state => state.themePreference);
  const resolvedMode = themePreference === 'system' ? systemScheme : themePreference;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
