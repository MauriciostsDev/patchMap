// MainTabs.tsx — contêiner de abas (Pontos / VLANs / Painel) com bottom nav + FAB.
// Port da navegação de app.jsx (NavBtn, FAB e bottom nav só aparecem nas abas).

import React, { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useTheme } from '../theme/useTheme';
import { sans } from '../theme/fonts';
import { Icon } from '../components/Icon';
import { ConnectionsListScreen } from '../screens/ConnectionsListScreen';
import { VLANsScreen } from '../screens/VLANsScreen';
import { PanelScreen } from '../screens/PanelScreen';

type Tab = 'pontos' | 'vlans' | 'painel';

function NavBtn({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 8 }}
    >
      <View
        style={{
          width: 56,
          height: 30,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? t.accentSoft : 'transparent',
        }}
      >
        <Icon name={icon} size={22} color={active ? t.accent : t.muted} stroke={active ? 2.3 : 2} />
      </View>
      <Text
        style={{
          fontSize: 11.5,
          fontFamily: active ? sans(700) : sans(500),
          color: active ? t.accent : t.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'Tabs'>;

export function MainTabs({ navigation }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('pontos');
  const [navHeight, setNavHeight] = useState(64);

  // useCallback: prop estável p/ o PointRow memoizado não re-renderizar à toa.
  const onOpen = useCallback((id: number) => navigation.navigate('Detail', { id }), [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {tab === 'pontos' && <ConnectionsListScreen onOpen={onOpen} />}
        {tab === 'vlans' && <VLANsScreen />}
        {tab === 'painel' && <PanelScreen onOpen={onOpen} />}
      </SafeAreaView>

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('Form', {})}
        style={{
          position: 'absolute',
          right: 16,
          bottom: navHeight + 16,
          width: 60,
          height: 60,
          borderRadius: 20,
          backgroundColor: t.accent,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#ffffff22',
          shadowColor: t.accent,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 22,
          elevation: 10,
        }}
      >
        <Icon name="plus" size={28} color={t.accentInk} stroke={2.6} />
      </Pressable>

      {/* Bottom nav */}
      <View
        onLayout={(e) => setNavHeight(e.nativeEvent.layout.height)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingTop: 6,
          paddingBottom: 6 + insets.bottom,
          backgroundColor: t.bgElev,
          borderTopWidth: 1,
          borderTopColor: t.border,
        }}
      >
        <NavBtn icon="list" label="Pontos" active={tab === 'pontos'} onPress={() => setTab('pontos')} />
        <NavBtn icon="vlan" label="VLANs" active={tab === 'vlans'} onPress={() => setTab('vlans')} />
        <NavBtn icon="panel" label="Painel" active={tab === 'painel'} onPress={() => setTab('painel')} />
      </View>
    </View>
  );
}
