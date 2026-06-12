// ConnectionsListScreen.tsx — Tela "Pontos": lista + busca (port de screen-list.jsx).

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import type { ConnectionStatus, Point } from '../types';
import { SECTORS } from '../data/seed';
import { Icon } from '../components/Icon';
import { PointRow } from '../components/PointRow';
import { VlanTag } from '../components/VlanTag';
import { SyncBadge } from '../components/SyncBadge';

function StatPill({
  label,
  value,
  color,
  active,
  onPress,
}: {
  label: string;
  value: number;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: active ? t.surface : 'transparent',
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? t.accent : t.border,
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 11,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {color ? (
          <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
        ) : null}
        <Text style={{ fontSize: 21, fontFamily: mono(700), color: t.text }}>{value}</Text>
      </View>
      <Text style={{ fontSize: 11.5, fontFamily: sans(500), color: t.muted, marginTop: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Chip({
  label,
  active,
  onPress,
  count,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: active ? t.accent : t.chip,
        borderWidth: active ? 0 : 1,
        borderColor: t.border,
      }}
    >
      <Text style={{ fontSize: 13.5, fontFamily: sans(600), color: active ? t.accentInk : t.text }}>
        {label}
      </Text>
      {count != null ? (
        <Text
          style={{
            fontSize: 11.5,
            fontFamily: mono(700),
            color: active ? t.accentInk : t.text,
            opacity: active ? 0.85 : 0.6,
          }}
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function ConnectionsListScreen({ onOpen }: { onOpen: (id: number) => void }) {
  const t = useTheme();
  const points = useAppStore((s) => s.points);
  const density = useAppStore((s) => s.density);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ConnectionStatus | 'todos'>('todos');
  const [sector, setSector] = useState<string>('todos');
  const [group, setGroup] = useState(false);

  const counts = useMemo(
    () => ({
      total: points.length,
      ativo: points.filter((p) => p.status === 'ativo').length,
      problema: points.filter((p) => p.status === 'problema').length,
      inativo: points.filter((p) => p.status === 'inativo').length,
    }),
    [points]
  );

  const sectorNames = useMemo(() => {
    const set = [...new Set(points.map((p) => p.sector).filter(Boolean) as string[])];
    return set.sort();
  }, [points]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return points.filter((p) => {
      if (status !== 'todos' && p.status !== status) return false;
      if (sector === '__none' && p.sector) return false;
      if (sector !== 'todos' && sector !== '__none' && p.sector !== sector) return false;
      if (!term) return true;
      const hay = [
        String(p.id),
        p.sector,
        p.point,
        p.device,
        p.swPort,
        p.sw,
        `pp ${p.patchPanel} ${p.patchPort}`,
        p.vlan ? `vlan ${p.vlan}` : '',
        p.vlanName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    });
  }, [points, q, status, sector]);

  const grouped = useMemo(() => {
    if (!group) return null;
    const map: Record<string, Point[]> = {};
    filtered.forEach((p) => {
      const k = p.sector || 'Não atribuído';
      (map[k] = map[k] || []).push(p);
    });
    return Object.keys(map)
      .sort(
        (a, b) =>
          Number(a === 'Não atribuído') - Number(b === 'Não atribuído') || a.localeCompare(b)
      )
      .map((k) => [k, map[k]] as const);
  }, [filtered, group]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      stickyHeaderIndices={[0]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header sticky */}
      <View
        style={{
          backgroundColor: t.bg,
          paddingTop: 14,
          paddingHorizontal: 15,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <Image
              source={require('../../assets/icon.png')}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 21, fontFamily: sans(800), color: t.text, letterSpacing: -0.5 }}
              >
                PatchMap
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted }}>
                  Rastreador de Conexões
                </Text>
                <SyncBadge />
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => setGroup((g) => !g)}
            style={{
              borderRadius: 10,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: group ? t.accent : t.chip,
              borderWidth: group ? 0 : 1,
              borderColor: t.border,
            }}
          >
            <Icon name={group ? 'building' : 'list'} size={20} color={group ? t.accentInk : t.text} />
          </Pressable>
        </View>

        {/* Resumo / filtros rápidos */}
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
          <StatPill label="Total" value={counts.total} active={status === 'todos'} onPress={() => setStatus('todos')} />
          <StatPill
            label="Ativos"
            value={counts.ativo}
            color="#16a34a"
            active={status === 'ativo'}
            onPress={() => setStatus((s) => (s === 'ativo' ? 'todos' : 'ativo'))}
          />
          <StatPill
            label="Problema"
            value={counts.problema}
            color="#dc2626"
            active={status === 'problema'}
            onPress={() => setStatus((s) => (s === 'problema' ? 'todos' : 'problema'))}
          />
          <StatPill
            label="Livres"
            value={counts.inativo}
            color="#64748b"
            active={status === 'inativo'}
            onPress={() => setStatus((s) => (s === 'inativo' ? 'todos' : 'inativo'))}
          />
        </View>

        {/* Busca */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            marginTop: 11,
            backgroundColor: t.surface,
            borderRadius: 12,
            paddingHorizontal: 13,
            height: 44,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Icon name="search" size={19} color={t.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar setor, ID, VLAN, switch…"
            placeholderTextColor={t.muted}
            style={{ flex: 1, fontSize: 15, color: t.text, fontFamily: sans(400), padding: 0 }}
          />
          {q ? (
            <Pressable onPress={() => setQ('')} hitSlop={8} style={{ padding: 4 }}>
              <Icon name="close" size={17} color={t.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* Chips de setor */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 11 }}
          contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
          keyboardShouldPersistTaps="handled"
        >
          <Chip label="Todos os setores" active={sector === 'todos'} onPress={() => setSector('todos')} />
          {sectorNames.map((s) => (
            <Chip
              key={s}
              label={s}
              count={points.filter((p) => p.sector === s).length}
              active={sector === s}
              onPress={() => setSector(s)}
            />
          ))}
          <Chip
            label="Sem setor"
            count={points.filter((p) => !p.sector).length}
            active={sector === '__none'}
            onPress={() => setSector('__none')}
          />
        </ScrollView>
      </View>

      {/* Lista */}
      {filtered.length === 0 ? (
        <View style={{ paddingVertical: 60, paddingHorizontal: 24, alignItems: 'center' }}>
          <Icon name="search" size={34} color={t.borderStrong} />
          <Text style={{ marginTop: 12, fontSize: 15, fontFamily: sans(600), color: t.text }}>
            Nenhum ponto encontrado
          </Text>
          <Text style={{ fontSize: 13.5, fontFamily: sans(400), color: t.muted, marginTop: 3 }}>
            Ajuste a busca ou os filtros.
          </Text>
        </View>
      ) : group && grouped ? (
        grouped.map(([name, rows]) => {
          const meta = SECTORS.find((s) => s.name === name);
          return (
            <View key={name}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  paddingHorizontal: 16,
                  paddingBottom: 7,
                  backgroundColor: t.bg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: sans(700),
                      color: t.text,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {name}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: mono(700), color: t.muted }}>
                    {rows.length}
                  </Text>
                </View>
                {meta ? <VlanTag vlan={meta.vlan} /> : null}
              </View>
              {rows.map((p) => (
                <PointRow key={p.id} p={p} density={density} onOpen={onOpen} />
              ))}
            </View>
          );
        })
      ) : (
        filtered.map((p) => <PointRow key={p.id} p={p} density={density} onOpen={onOpen} />)
      )}

      <View style={{ height: 90 }} />
    </ScrollView>
  );
}
