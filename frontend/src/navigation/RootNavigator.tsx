// RootNavigator.tsx — Navegação raiz: login gate → stack (Tabs / Detail / Form).

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import { ConnectionDetailScreen } from '../screens/ConnectionDetailScreen';
import { ConnectionFormScreen } from '../screens/ConnectionFormScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const t = useTheme();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const dark = useAppStore((s) => s.dark);

  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: t.bg,
      card: t.surface,
      text: t.text,
      border: t.border,
      primary: t.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {!isLoggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={MainTabs} />
          <Stack.Screen name="Detail" component={ConnectionDetailScreen} />
          <Stack.Screen name="Form" component={ConnectionFormScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
