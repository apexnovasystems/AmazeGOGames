import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation/RootNavigator';
import {useSettingsStore} from './src/store/useSettingsStore';
import {AdsService} from './src/services/AdsService';
import {ErrorBoundary} from './src/components/ErrorBoundary';

function App() {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore(state => state.themePreference);
  const resolvedMode = themePreference === 'system' ? systemScheme : themePreference;

  useEffect(() => {
    void AdsService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
