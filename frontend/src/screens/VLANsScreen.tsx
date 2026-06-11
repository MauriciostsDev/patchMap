// VLANsScreen.tsx — Accordion VLAN → Setor → Pontos (port de screen-extra.jsx).

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import type { Point } from '../types';
import { VLANS } from '../data/seed';
import { withAlpha, vlanColor, sectorColor } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PointRow } from '../components/PointRow';

function MiniBar({ rows }: { rows: Point[] }) {
  const t = useTheme();
  const total = rows.length || 1;
  const pct = (s: string) => (rows.filter((r) => r.status === s).length / total) * 100;
  return (
    <View
      style={{
        flexDirection: 'row',
        height: 6,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: t.border,
      }}
    >
      <View style={{ width: `${pct('ativo')}%`, backgroundColor: '#16a34a' }} />
      <View style={{ width: `${pct('problema')}%`, backgroundColor: '#dc2626' }} />
    </View>
  );
}

export function VLANsScreen({ onOpen }: { onOpen: (id: number) => void }) {
  const t = useTheme();
  const points = useAppStore((s) => s.points);
  const density = useAppStore((s) => s.density);

  const [openVlan, setOpenVlan] = useState<number | null>(null);
  const [openSector, setOpenSector] = useState<string | null>(null);

  const vlanData = useMemo(() => {
    return VLANS.map((v) => {
      const vpts = points.filter((p) => p.vlan === v.id);
      const sectorNames = [...new Set(vpts.map((p) => p.sector).filter(Boolean) as string[])];
      return {
        ...v,
        points: vpts,
        sectors: sectorNames.map((name) => ({
          name,
          points: vpts.filter((p) => p.sector === name).sort((a, b) => a.id - b.id),
        })),
      };
    });
  }, [points]);

  const unassigned = useMemo(() => points.filter((p) => p.vlan == null && p.sector), [points]);
  const totalCfg = points.filter((p) => p.vlan != null).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 6 }}>
        <Text style={{ fontSize: 24, fontFamily: sans(700), color: t.text, letterSpacing: -0.4 }}>
          VLANs
        </Text>
        <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted, marginTop: 1 }}>
          {VLANS.length} VLANs · {totalCfg} pontos configurados
        </Text>
      </View>

      <View style={{ paddingTop: 8, paddingHorizontal: 14, paddingBottom: 100, gap: 10 }}>
        {vlanData.map((v) => {
          const isOpen = openVlan === v.id;
          const prob = v.points.filter((p) => p.status === 'problema').length;
          const col = vlanColor(v.id);

          return (
            <View
              key={v.id}
              style={{
                backgroundColor: t.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: t.border,
                overflow: 'hidden',
              }}
            >
              {/* Cabeçalho da VLAN */}
              <Pressable
                onPress={() => {
                  setOpenVlan(isOpen ? null : v.id);
                  if (isOpen) setOpenSector(null);
                }}
                style={{ padding: 15 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: withAlpha(col, '1f'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="vlan" size={22} color={col} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 13, fontFamily: mono(700), color: col }}>VLAN {v.id}</Text>
                      <Text style={{ fontSize: 15.5, fontFamily: sans(700), color: t.text }}>{v.name}</Text>
                      {prob > 0 ? (
                        <View
                          style={{
                            backgroundColor: withAlpha('#dc2626', '1f'),
                            paddingVertical: 2,
                            paddingHorizontal: 7,
                            borderRadius: 999,
                          }}
                        >
                          <Text style={{ fontSize: 11.5, fontFamily: sans(700), color: '#dc2626' }}>
                            {prob} prob.
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted, marginTop: 2 }}>
                      {v.sectors.length} {v.sectors.length === 1 ? 'setor' : 'setores'} ·{' '}
                      {v.points.length} {v.points.length === 1 ? 'ponto' : 'pontos'}
                    </Text>
                  </View>
                  <Icon
                    name="chevron"
                    size={20}
                    color={t.borderStrong}
                    style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
                  />
                </View>
                {v.points.length > 0 ? (
                  <View style={{ marginTop: 12 }}>
                    <MiniBar rows={v.points} />
                  </View>
                ) : null}
              </Pressable>

              {/* Setores dentro da VLAN */}
              {isOpen ? (
                <View style={{ borderTopWidth: 1, borderTopColor: t.border }}>
                  {v.sectors.length === 0 ? (
                    <View style={{ paddingVertical: 18, paddingHorizontal: 16, alignItems: 'center' }}>
                      <Text style={{ color: t.muted, fontSize: 14, fontFamily: sans(400) }}>
                        Nenhum ponto configurado nesta VLAN
                      </Text>
                    </View>
                  ) : (
                    v.sectors.map((sec) => {
                      const secKey = `${v.id}:${sec.name}`;
                      const secOpen = openSector === secKey;
                      const secCol = sectorColor(sec.name);
                      const secProb = sec.points.filter((p) => p.status === 'problema').length;
                      return (
                        <View key={sec.name} style={{ borderBottomWidth: 1, borderBottomColor: t.border }}>
                          <Pressable
                            onPress={() => setOpenSector(secOpen ? null : secKey)}
                            style={{
                              backgroundColor: t.bg,
                              paddingVertical: 11,
                              paddingRight: 16,
                              paddingLeft: 20,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <View
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 9,
                                backgroundColor: withAlpha(secCol, '1f'),
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon name="building" size={17} color={secCol} />
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                                <Text style={{ fontSize: 14.5, fontFamily: sans(600), color: t.text }}>
                                  {sec.name}
                                </Text>
                                {secProb > 0 ? (
                                  <View
                                    style={{
                                      backgroundColor: withAlpha('#dc2626', '1f'),
                                      paddingVertical: 2,
                                      paddingHorizontal: 6,
                                      borderRadius: 999,
                                    }}
                                  >
                                    <Text style={{ fontSize: 11, fontFamily: sans(700), color: '#dc2626' }}>
                                      {secProb}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                              <Text style={{ fontSize: 12.5, fontFamily: sans(400), color: t.muted }}>
                                {sec.points.length} {sec.points.length === 1 ? 'ponto' : 'pontos'}
                              </Text>
                            </View>
                            <Icon
                              name="chevron"
                              size={17}
                              color={t.borderStrong}
                              style={{ transform: [{ rotate: secOpen ? '90deg' : '0deg' }] }}
                            />
                          </Pressable>
                          {secOpen
                            ? sec.points.map((p) => (
                                <PointRow key={p.id} p={p} density={density} onOpen={onOpen} />
                              ))
                            : null}
                        </View>
                      );
                    })
                  )}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Pontos sem VLAN */}
        {unassigned.length > 0 ? (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: t.border,
              padding: 15,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: t.chip,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="outlet" size={22} color={t.muted} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontFamily: sans(700), color: t.muted }}>Sem VLAN</Text>
              <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted, marginTop: 1 }}>
                {unassigned.length} {unassigned.length === 1 ? 'ponto sem' : 'pontos sem'} segmentação
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
