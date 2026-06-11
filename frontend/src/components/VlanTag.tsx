// VlanTag.tsx — tag de VLAN (port de components.jsx).

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';

export function VlanTag({
  vlan,
  name,
}: {
  vlan: number | null;
  name?: string | null;
}) {
  const t = useTheme();

  if (vlan == null) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 4,
          paddingHorizontal: 9,
          borderRadius: 7,
          backgroundColor: t.chip,
          borderWidth: 1,
          borderColor: t.border,
          borderStyle: 'dashed',
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: sans(600), color: t.muted }}>sem VLAN</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 7,
        backgroundColor: t.accentSoft,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontSize: 12, fontFamily: mono(700), color: t.accent }}>VLAN {vlan}</Text>
      {name ? (
        <Text style={{ fontSize: 12, fontFamily: sans(500), color: t.accent, opacity: 0.85 }}>
          · {name}
        </Text>
      ) : null}
    </View>
  );
}
