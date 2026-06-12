// SyncBadge.tsx — indicador compacto do estado de sincronização com o backend.
// Mostra: sincronizando · N pendentes · erro · tudo sincronizado. Toque = sincronizar.

import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans } from '../theme/fonts';
import { Icon } from './Icon';

export function SyncBadge() {
  const t = useTheme();
  const syncing = useAppStore((s) => s.syncing);
  const lastSyncError = useAppStore((s) => s.lastSyncError);
  const pending = useAppStore((s) => s.pendingCount());
  const loadFromServer = useAppStore((s) => s.loadFromServer);

  let icon = 'check';
  let color = '#16a34a';
  let label = 'Sincronizado';

  if (syncing) {
    label = 'Sincronizando…';
    color = t.accent;
  } else if (pending > 0) {
    icon = 'clock';
    color = '#d97706';
    label = `${pending} pendente${pending > 1 ? 's' : ''}`;
  } else if (lastSyncError) {
    icon = 'alert';
    color = '#dc2626';
    label = 'Offline';
  }

  return (
    <Pressable
      onPress={() => !syncing && loadFromServer()}
      hitSlop={6}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 999,
        backgroundColor: color + '1c',
      }}
    >
      {syncing ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Icon name={icon} size={13} color={color} stroke={2.4} />
      )}
      <Text style={{ fontSize: 11.5, fontFamily: sans(600), color }}>{label}</Text>
    </Pressable>
  );
}
