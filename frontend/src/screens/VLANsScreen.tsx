// VLANsScreen.tsx — VLAN = grupo de setores. Lista as VLANs com seus setores,
// permite criar/editar VLAN (escolhendo os setores) e editar cada setor.

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import { withAlpha } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { VlanEditModal } from '../components/VlanEditModal';
import { SectorEditModal } from '../components/SectorEditModal';
import type { VlanDTO } from '../api';

function SectorChip({
  name,
  color,
  onPress,
}: {
  name: string;
  color: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: withAlpha(color, '1f'),
        borderWidth: 1,
        borderColor: withAlpha(color, '55'),
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
      <Text style={{ fontSize: 12.5, fontFamily: sans(600), color: t.text }}>{name}</Text>
    </Pressable>
  );
}

export function VLANsScreen() {
  const t = useTheme();
  const sectors = useAppStore((s) => s.sectors);
  const vlans = useAppStore((s) => s.vlans);
  const points = useAppStore((s) => s.points);
  const colorOf = useAppStore((s) => s.sectorColorOf);

  const [vlanModal, setVlanModal] = useState<{ open: boolean; vlan: VlanDTO | null }>({
    open: false,
    vlan: null,
  });
  const [editSector, setEditSector] = useState<string | null>(null);

  const membersOf = (vlanId: string) => sectors.filter((s) => s.vlanId === vlanId);
  const unassigned = sectors.filter((s) => !s.vlanId);
  const pointsIn = (names: string[]) =>
    points.filter((p) => p.sector && names.includes(p.sector)).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          paddingTop: 16,
          paddingHorizontal: 16,
          paddingBottom: 6,
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontSize: 24, fontFamily: sans(700), color: t.text, letterSpacing: -0.4 }}>
            VLANs
          </Text>
          <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted, marginTop: 1 }}>
            {vlans.length} {vlans.length === 1 ? 'grupo' : 'grupos'} · {sectors.length} setores
          </Text>
        </View>
        <Pressable
          onPress={() => setVlanModal({ open: true, vlan: null })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 999,
            paddingVertical: 9,
            paddingHorizontal: 14,
            backgroundColor: t.accent,
          }}
        >
          <Icon name="plus" size={16} color={t.accentInk} stroke={2.5} />
          <Text style={{ fontSize: 13.5, fontFamily: sans(700), color: t.accentInk }}>Nova VLAN</Text>
        </Pressable>
      </View>

      <View style={{ paddingTop: 8, paddingHorizontal: 14, paddingBottom: 100, gap: 10 }}>
        {/* Estado vazio */}
        {vlans.length === 0 ? (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: t.border,
              borderStyle: 'dashed',
              paddingVertical: 28,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
          >
            <Icon name="vlan" size={30} color={t.borderStrong} />
            <Text style={{ marginTop: 10, fontSize: 15, fontFamily: sans(700), color: t.text }}>
              Nenhuma VLAN ainda
            </Text>
            <Text
              style={{
                fontSize: 13.5,
                fontFamily: sans(400),
                color: t.muted,
                marginTop: 3,
                textAlign: 'center',
              }}
            >
              Crie uma VLAN e agrupe os setores que fazem parte dela.
            </Text>
          </View>
        ) : null}

        {/* VLANs */}
        {vlans.map((v) => {
          const members = membersOf(v.id);
          const pts = pointsIn(members.map((m) => m.name));
          return (
            <Pressable
              key={v.id}
              onPress={() => setVlanModal({ open: true, vlan: v })}
              style={{
                backgroundColor: t.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: t.border,
                padding: 15,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: withAlpha(t.accent, '1f'),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="vlan" size={22} color={t.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 13, fontFamily: mono(700), color: t.accent }}>
                      VLAN {v.vlanId}
                    </Text>
                    <Text style={{ fontSize: 15.5, fontFamily: sans(700), color: t.text }}>{v.name}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted, marginTop: 2 }}>
                    {members.length} {members.length === 1 ? 'setor' : 'setores'} · {pts}{' '}
                    {pts === 1 ? 'ponto' : 'pontos'}
                  </Text>
                </View>
                <Icon name="edit" size={17} color={t.borderStrong} />
              </View>

              {members.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                  {members.map((m) => (
                    <SectorChip key={m.id} name={m.name} color={m.color || colorOf(m.name)} />
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 12.5, fontFamily: sans(400), color: t.muted, marginTop: 10 }}>
                  Toque para adicionar setores a esta VLAN.
                </Text>
              )}
            </Pressable>
          );
        })}

        {/* Setores sem VLAN */}
        {unassigned.length > 0 ? (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: t.border,
              padding: 15,
              marginTop: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Icon name="outlet" size={18} color={t.muted} />
              <Text style={{ fontSize: 14.5, fontFamily: sans(700), color: t.text }}>
                Setores sem VLAN
              </Text>
              <Text style={{ fontSize: 12.5, fontFamily: mono(700), color: t.muted }}>
                {unassigned.length}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {unassigned.map((s) => (
                <SectorChip
                  key={s.id}
                  name={s.name}
                  color={s.color || colorOf(s.name)}
                  onPress={() => setEditSector(s.name)}
                />
              ))}
            </View>
            <Text style={{ fontSize: 12, fontFamily: sans(400), color: t.muted, marginTop: 10 }}>
              Toque num setor para editar nome/cor, ou crie uma VLAN para agrupá-los.
            </Text>
          </View>
        ) : null}
      </View>

      <VlanEditModal
        open={vlanModal.open}
        vlan={vlanModal.vlan}
        onClose={() => setVlanModal({ open: false, vlan: null })}
      />
      <SectorEditModal name={editSector} onClose={() => setEditSector(null)} />
    </ScrollView>
  );
}
