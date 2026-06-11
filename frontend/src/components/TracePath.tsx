// TracePath.tsx — cadeia física Tomada → Patch Panel → Switch → VLAN (port de components.jsx).

import React from 'react';
import { View, Text } from 'react-native';
import type { Point } from '../types';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import { Icon } from './Icon';

function TraceNode({
  icon,
  kicker,
  title,
  sub,
  accent,
  monoTitle,
  last,
}: {
  icon: string;
  kicker: string;
  title: string;
  sub?: string;
  accent?: boolean;
  monoTitle?: boolean;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'stretch' }}>
      <View style={{ alignItems: 'center', width: 42 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: accent ? t.accentSoft : t.chip,
            borderWidth: 1,
            borderColor: accent ? 'transparent' : t.border,
          }}
        >
          <Icon name={icon} size={20} stroke={2} color={accent ? t.accent : t.text} />
        </View>
        {!last && (
          <View
            style={{
              flex: 1,
              width: 2,
              backgroundColor: t.border,
              marginTop: 4,
              marginBottom: 4,
              minHeight: 18,
            }}
          />
        )}
      </View>
      <View style={{ paddingBottom: last ? 0 : 18, flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontFamily: sans(700),
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: t.muted,
          }}
        >
          {kicker}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: monoTitle ? mono(600) : sans(600),
            color: t.text,
            marginTop: 2,
          }}
        >
          {title}
        </Text>
        {sub ? (
          <Text style={{ fontSize: 13.5, fontFamily: sans(400), color: t.muted, marginTop: 1 }}>
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function TracePath({ p }: { p: Point }) {
  return (
    <View>
      <TraceNode
        icon="outlet"
        kicker="Tomada / Ponto"
        title={p.point || 'Não etiquetado'}
        sub={
          p.sector
            ? `${p.sector} · ${p.device !== '—' ? p.device : 'sem dispositivo'}`
            : 'Setor não atribuído'
        }
      />
      <TraceNode
        icon="panel"
        kicker="Patch Panel"
        title={`Painel ${p.patchPanel} · Porta ${p.patchPort}`}
        sub="Rack do servidor"
        monoTitle
      />
      <TraceNode
        icon="switch"
        kicker="Switch"
        title={`${p.sw} · ${p.swPort}`}
        sub="Switch de núcleo"
        monoTitle
      />
      <TraceNode
        icon="vlan"
        kicker="VLAN"
        accent
        last
        title={p.vlan != null ? `VLAN ${p.vlan}` : 'Sem VLAN'}
        sub={p.vlanName || 'porta não segmentada'}
        monoTitle
      />
    </View>
  );
}
