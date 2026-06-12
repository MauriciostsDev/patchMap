// App.tsx — Ponto de entrada: carrega fontes e monta a navegação.

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store';
import { fontAssets } from './src/theme/fonts';
import { buildTheme } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const dark = useAppStore((s) => s.dark);
  const accent = useAppStore((s) => s.accent);
  const restoreSession = useAppStore((s) => s.restoreSession);
  const theme = buildTheme(accent, dark);

  // Boot: valida se o token JWT persistido ainda existe (senão, volta ao login).
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
