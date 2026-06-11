// PanelScreen.tsx — Painel multi-rack visual (port de screen-extra.jsx PanelScreen).

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import type { Point } from '../types';
import { STATUSES } from '../data/seed';
import { STATUS_META, statusColor, withAlpha, sectorColor } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { Segmented } from '../components/Segmented';

function Port({
  p,
  colorBy,
  width,
  onOpen,
}: {
  p: Point;
  colorBy: 'setor' | 'status';
  width: number;
  onOpen: (id: number) => void;
}) {
  const sc = statusColor(p.status);
  const base = colorBy === 'status' ? sc : p.sector ? sectorColor(p.sector) : '#64748b';
  const filled = !!p.sector || p.status === 'problema';
  return (
    <Pressable
      onPress={() => onOpen(p.id)}
      style={{
        width,
        borderRadius: 7,
        paddingTop: 7,
        paddingBottom: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        minHeight: 46,
        backgroundColor: filled ? withAlpha(base, '30') : 'rgba(148,163,184,0.12)',
        borderWidth: 1.5,
        borderColor: filled ? base : 'rgba(148,163,184,0.4)',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 1.5 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 2,
              height: 6,
              borderRadius: 1,
              backgroundColor: filled ? base : 'rgba(148,163,184,0.6)',
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 13, fontFamily: mono(700), color: filled ? base : '#94a3b8' }}>
        {String(p.patchPort).padStart(2, '0')}
      </Text>
      <View
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 7,
          height: 7,
          borderRadius: 999,
          backgroundColor: sc,
        }}
      />
    </Pressable>
  );
}

export function PanelScreen({ onOpen }: { onOpen: (id: number) => void }) {
  const t = useTheme();
  const points = useAppStore((s) => s.points);
  const panels = useAppStore((s) => s.panels);
  const addPanel = useAppStore((s) => s.addPanel);

  const [colorBy, setColorBy] = useState<'setor' | 'status'>('setor');
  const [selectedId, setSelectedId] = useState<string>(() => panels[0]?.id || 'A');
  const [addSheet, setAddSheet] = useState(false);
  const [newPanel, setNewPanel] = useState<{ id: string; ports: number; sw: string }>({
    id: '',
    ports: 24,
    sw: 'CORE',
  });
  const [nameErr, setNameErr] = useState(false);
  const [rackWidth, setRackWidth] = useState(0);

  useEffect(() => {
    if (!panels.find((p) => p.id === selectedId) && panels.length > 0) {
      setSelectedId(panels[0].id);
    }
  }, [panels]);

  const currentDef =
    panels.find((p) => p.id === selectedId) ||
    panels[0] || { id: 'A', label: 'Painel A', ports: 32, sw: 'CORE' };
  const panel = points
    .filter((p) => p.patchPanel === selectedId)
    .sort((a, b) => a.patchPort - b.patchPort);
  const used = panel.filter((p) => p.sector).length;
  const sectorsInPanel = [...new Set(panel.map((p) => p.sector).filter(Boolean) as string[])];

  const nextLetter = useMemo(() => {
    const ids = panels.map((p) => p.id).filter((id) => /^[A-Z]$/.test(id)).sort();
    if (!ids.length) return 'B';
    const last = ids[ids.length - 1];
    return last < 'Z' ? String.fromCharCode(last.charCodeAt(0) + 1) : 'A2';
  }, [panels]);

  function openAdd() {
    setNewPanel({ id: nextLetter, ports: 24, sw: 'CORE' });
    setNameErr(false);
    setAddSheet(true);
  }

  function confirmAdd() {
    const id = newPanel.id.trim().toUpperCase();
    if (!id || panels.find((p) => p.id === id)) {
      setNameErr(true);
      return;
    }
    addPanel({ id, label: `Painel ${id}`, ports: newPanel.ports, sw: newPanel.sw || 'CORE' });
    setSelectedId(id);
    setAddSheet(false);
  }

  const cellW = rackWidth > 0 ? (rackWidth - 6 * 7) / 8 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 6 }}>
          <Text style={{ fontSize: 24, fontFamily: sans(700), color: t.text, letterSpacing: -0.4 }}>
            {currentDef.label}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted, marginTop: 1 }}>
            {used}/{panel.length} portas em uso · Switch {currentDef.sw}
          </Text>
        </View>

        {/* Seletor de painéis */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingTop: 4 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}
        >
          {panels.map((def) => {
            const on = selectedId === def.id;
            return (
              <Pressable
                key={def.id}
                onPress={() => setSelectedId(def.id)}
                style={{
                  borderRadius: 999,
                  paddingVertical: 7,
                  paddingHorizontal: 16,
                  backgroundColor: on ? t.accent : t.chip,
                  borderWidth: on ? 0 : 1,
                  borderColor: t.border,
                }}
              >
                <Text style={{ fontSize: 13.5, fontFamily: sans(600), color: on ? t.accentInk : t.text }}>
                  {def.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={openAdd}
            style={{
              borderRadius: 999,
              paddingVertical: 7,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: t.chip,
              borderWidth: 1,
              borderColor: t.border,
            }}
          >
            <Icon name="plus" size={15} color={t.muted} />
            <Text style={{ fontSize: 13.5, fontFamily: sans(600), color: t.muted }}>Novo</Text>
          </Pressable>
        </ScrollView>

        {/* Segmented view */}
        <View style={{ paddingTop: 10, paddingHorizontal: 14 }}>
          <Segmented
            options={[
              { value: 'setor', label: 'Por setor' },
              { value: 'status', label: 'Por status' },
            ]}
            value={colorBy}
            onChange={setColorBy}
          />
        </View>

        {/* Rack visual */}
        <View
          style={{
            marginTop: 14,
            marginHorizontal: 14,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#1e293b',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 11,
              paddingHorizontal: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: '#22d3ee',
                  shadowColor: '#22d3ee',
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              />
              <Text style={{ fontSize: 13, fontFamily: mono(700), color: '#e2e8f0', letterSpacing: 0.5 }}>
                PATCH PANEL {selectedId} · {currentDef.ports}P
              </Text>
            </View>
            <Text style={{ fontSize: 11.5, fontFamily: mono(400), color: '#94a3b8' }}>1U</Text>
          </View>
          <View style={{ padding: 12 }} onLayout={(e) => setRackWidth(e.nativeEvent.layout.width - 24)}>
            {panel.length === 0 ? (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <Text style={{ color: '#64748b', fontSize: 14, fontFamily: sans(400) }}>
                  Nenhuma porta cadastrada
                </Text>
              </View>
            ) : cellW > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {panel.map((p) => (
                  <Port key={p.id} p={p} colorBy={colorBy} width={cellW} onOpen={onOpen} />
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {/* Legenda */}
        <View style={{ paddingVertical: 16, paddingHorizontal: 18 }}>
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: sans(700),
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: t.muted,
              marginBottom: 9,
            }}
          >
            {colorBy === 'status' ? 'Status' : 'Setores'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 9, columnGap: 16 }}>
            {colorBy === 'status'
              ? STATUSES.map((s) => (
                  <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View
                      style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: STATUS_META[s].color }}
                    />
                    <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.text }}>
                      {STATUS_META[s].label}
                    </Text>
                  </View>
                ))
              : sectorsInPanel.map((s) => (
                  <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <View
                      style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: sectorColor(s) }}
                    />
                    <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.text }}>{s}</Text>
                  </View>
                ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <View
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  backgroundColor: 'rgba(148,163,184,0.3)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(148,163,184,0.6)',
                }}
              />
              <Text style={{ fontSize: 13, fontFamily: sans(400), color: t.muted }}>Livre</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12.5, fontFamily: sans(400), color: t.muted, marginTop: 14, lineHeight: 19 }}>
            O ponto colorido no canto de cada porta indica o status. Toque para ver os detalhes.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom sheet: criar painel */}
      <Modal visible={addSheet} transparent animationType="fade" onRequestClose={() => setAddSheet(false)}>
        <Pressable
          onPress={() => setAddSheet(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.42)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: t.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 10,
              paddingHorizontal: 16,
              paddingBottom: 28,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                backgroundColor: t.borderStrong,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />
            <Text style={{ fontSize: 17, fontFamily: sans(700), color: t.text, marginBottom: 18 }}>
              Novo Patch Panel
            </Text>

            {/* Identificador */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: sans(700),
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: t.muted,
                  marginBottom: 7,
                }}
              >
                Identificador
              </Text>
              <TextInput
                value={newPanel.id}
                onChangeText={(v) => {
                  setNewPanel((p) => ({ ...p, id: v.toUpperCase() }));
                  setNameErr(false);
                }}
                maxLength={4}
                placeholder={nextLetter}
                placeholderTextColor={t.muted}
                style={{
                  backgroundColor: t.bg,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  fontSize: 17,
                  color: t.text,
                  fontFamily: mono(700),
                  borderWidth: nameErr ? 1.5 : 1,
                  borderColor: nameErr ? '#dc2626' : t.border,
                }}
              />
              {nameErr ? (
                <Text style={{ fontSize: 12, fontFamily: sans(400), color: '#dc2626', marginTop: 5 }}>
                  ID inválido ou já existente.
                </Text>
              ) : null}
            </View>

            {/* Número de portas */}
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: sans(700),
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: t.muted,
                  marginBottom: 7,
                }}
              >
                Número de portas
              </Text>
              <Segmented
                options={[
                  { value: 16, label: '16' },
                  { value: 24, label: '24' },
                  { value: 32, label: '32' },
                  { value: 48, label: '48' },
                ]}
                value={newPanel.ports}
                onChange={(v) => setNewPanel((p) => ({ ...p, ports: v }))}
              />
            </View>

            {/* Switch */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: sans(700),
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: t.muted,
                  marginBottom: 7,
                }}
              >
                Switch
              </Text>
              <TextInput
                value={newPanel.sw}
                onChangeText={(v) => setNewPanel((p) => ({ ...p, sw: v }))}
                placeholder="CORE"
                placeholderTextColor={t.muted}
                style={{
                  backgroundColor: t.bg,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  fontSize: 15.5,
                  color: t.text,
                  fontFamily: sans(400),
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              />
            </View>

            <Pressable
              onPress={confirmAdd}
              style={{
                borderRadius: 13,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: t.accent,
              }}
            >
              <Text style={{ color: t.accentInk, fontSize: 15.5, fontFamily: sans(700) }}>
                Criar painel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
