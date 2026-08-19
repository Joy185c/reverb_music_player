import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDB } from './src/database/sqlite';
import { initFileSystem } from './src/services/filesystem';
import { setupPlayer } from './src/services/audio/PlayerService';
import { colors } from './src/theme/colors';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initFileSystem();
        await initDB();
        await setupPlayer();
        setIsReady(true);
      } catch (e) {
        console.error('Initialization Error', e);
      }
    };
    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.accent, fontSize: 24, fontWeight: 'bold' }}>REVERB</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
