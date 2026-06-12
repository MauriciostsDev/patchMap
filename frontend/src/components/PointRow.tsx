// PointRow.tsx — linha de ponto na lista (port de screen-list.jsx).

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Point, Density } from '../types';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import { statusColor, DEVICE_ICON } from '../theme/tokens';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';
import { VlanTag } from './VlanTag';

export function PointRow({
  p,
  density,
  onOpen,
}: {
  p: Point;
  density: Density;
  onOpen: (id: number) => void;
}) {
  const t = useTheme();
  const colorOf = useAppStore((s) => s.sectorColorOf);
  const compact = density === 'compact';
  const comfy = density === 'comfy';
  const sc = statusColor(p.status);

  return (
    <Pressable
      onPress={() => onOpen(p.id)}
      style={{
        width: '100%',
        backgroundColor: t.surface,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: compact ? 9 : comfy ? 15 : 12,
        paddingHorizontal: compact ? 14 : comfy ? 16 : 15,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      {/* ID + Patch Panel */}
      <View
        style={{
          width: compact ? 40 : 46,
          height: compact ? 42 : 50,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.chip,
          borderWidth: 1,
          borderColor: t.border,
          gap: 1,
        }}
      >
        <Text
          style={{
            fontSize: compact ? 9 : 10,
            fontFamily: mono(700),
            color: t.muted,
            letterSpacing: 0.5,
          }}
        >
          PP{p.patchPanel}
        </Text>
        <Text style={{ fontSize: compact ? 14 : 17, fontFamily: mono(700), color: t.text }}>
          {String(p.id).padStart(2, '0')}
        </Text>
        <View
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: sc,
            borderWidth: 2,
            borderColor: t.surface,
          }}
        />
      </View>

      {/* corpo */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          {p.sector ? (
            <View
              style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: colorOf(p.sector) }}
            />
          ) : null}
          {p.device !== '—' && DEVICE_ICON[p.device] ? (
            <Icon name={DEVICE_ICON[p.device]} size={15} color={t.muted} stroke={2} />
          ) : null}
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: comfy ? 16 : 15,
              fontFamily: sans(600),
              color: p.sector ? t.text : t.muted,
              fontStyle: p.sector ? 'normal' : 'italic',
            }}
          >
            {p.sector || 'Não atribuído'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 2,
          }}
        >
          <Text style={{ fontSize: 12.5, fontFamily: mono(400), color: t.muted }}>
            PP {p.patchPanel}·{p.patchPort}
          </Text>
          <Icon name="arrow" size={12} color={t.borderStrong} stroke={2.5} />
          <Text style={{ fontSize: 12.5, fontFamily: mono(400), color: t.muted }}>
            {p.sw} {p.swPort}
          </Text>
        </View>
        {!compact ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <VlanTag vlan={p.vlan} name={comfy ? p.vlanName : null} />
          </View>
        ) : null}
      </View>

      {/* status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {compact ? (
          <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: sc }} />
        ) : (
          <StatusBadge status={p.status} size="sm" />
        )}
        <Icon name="chevron" size={18} color={t.borderStrong} />
      </View>
    </Pressable>
  );
}
