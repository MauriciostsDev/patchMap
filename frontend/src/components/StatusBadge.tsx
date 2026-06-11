// StatusBadge.tsx — badge de status (port de components.jsx).

import React from 'react';
import { View, Text } from 'react-native';
import type { ConnectionStatus } from '../types';
import { STATUS_META, withAlpha } from '../theme/tokens';
import { sans } from '../theme/fonts';

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: ConnectionStatus;
  size?: 'sm' | 'md';
}) {
  const m = STATUS_META[status] || STATUS_META.inativo;
  const padV = size === 'sm' ? 3 : 5;
  const padH = size === 'sm' ? 8 : 11;
  const fs = size === 'sm' ? 11.5 : 13;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: padV,
        paddingHorizontal: padH,
        borderRadius: 999,
        backgroundColor: withAlpha(m.color, '1f'),
        alignSelf: 'flex-start',
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: m.color }} />
      <Text style={{ fontSize: fs, fontFamily: sans(600), color: m.color }}>{m.label}</Text>
    </View>
  );
}
