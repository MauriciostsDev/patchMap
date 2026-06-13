// ConnectionFormScreen.tsx — Cadastrar / editar ponto (port de screen-form.jsx).

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import type { ConnectionStatus } from '../types';
import { SECTORS, VLANS, DEVICES, STATUSES } from '../data/seed';
import { STATUS_META } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PickChip } from '../components/PickChip';
import { Segmented } from '../components/Segmented';

interface FormState {
  id: number | '';
  sector: string;
  patchPanel: string;
  patchPort: string;
  sw: string;
  swPort: string;
  vlan: number | null;
  vlanName: string | null;
  device: string;
  status: ConnectionStatus;
  point: string;
  obs: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

export function ConnectionFormScreen({ route, navigation }: Props) {
  const t = useTheme();
  const id = route.params?.id;
  const initial = useAppStore((s) => (id != null ? s.points.find((p) => p.id === id) : undefined));
  const sectors = useAppStore((s) => s.allSectors());
  const panels = useAppStore((s) => s.panels);
  const savePoint = useAppStore((s) => s.savePoint);

  const isEdit = !!initial;
  const [f, setF] = useState<FormState>(() =>
    initial
      ? {
          id: initial.id,
          sector: initial.sector || '',
          patchPanel: initial.patchPanel,
          patchPort: String(initial.patchPort),
          sw: initial.sw,
          swPort: initial.swPort,
          vlan: initial.vlan,
          vlanName: initial.vlanName,
          device: initial.device,
          status: initial.status,
          point: initial.point || '',
          obs: initial.obs,
        }
      : {
          id: '',
          sector: '',
          patchPanel: 'A',
          patchPort: '',
          sw: 'CORE',
          swPort: '',
          vlan: null,
          vlanName: null,
          device: 'Desktop',
          status: 'ativo',
          point: '',
          obs: '',
        }
  );
  const [newSector, setNewSector] = useState('');
  const [touched, setTouched] = useState(false);

  const set = (k: keyof FormState, v: any) => setF((prev) => ({ ...prev, [k]: v }));

  function pickSector(name: string) {
    const meta = SECTORS.find((s) => s.name === name);
    setF((prev) => ({
      ...prev,
      sector: name,
      vlan: meta ? meta.vlan : prev.vlan,
      vlanName: meta ? meta.vlanName : prev.vlanName,
    }));
  }

  function pickVlan(v: number) {
    const meta = VLANS.find((x) => x.id === v);
    setF((prev) => ({ ...prev, vlan: v, vlanName: meta ? meta.name : null }));
  }

  const portNum = parseInt(f.patchPort, 10);
  const valid = !isNaN(portNum) && portNum > 0;

  function save() {
    setTouched(true);
    if (!valid) return;
    const sw = f.swPort || `Gi1/0/${portNum}`;
    const today = new Date().toISOString().slice(0, 10);
    const np = {
      // Preserva os campos ricos/FKs do ponto original (serverId, sectorId,
      // switchId, vlanRef, ...) para que a edição sincronize com o backend.
      ...(initial ?? {}),
      id: isEdit ? (f.id as number) : portNum,
      sector: f.sector || null,
      patchPanel: f.patchPanel,
      patchPort: portNum,
      sw: f.sw,
      swPort: sw,
      vlan: f.vlan,
      vlanName: f.vlanName,
      device: f.device || '—',
      status: f.status,
      point: f.point || null,
      identifier: f.point || initial?.identifier || `P-${portNum}`,
      obs: f.obs,
      updatedAt: today,
    };
    savePoint(np);
    navigation.replace('Detail', { id: np.id });
  }

  const inputStyle = {
    width: '100%' as const,
    backgroundColor: t.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15.5,
    color: t.text,
    fontFamily: sans(400),
    borderWidth: 1,
    borderColor: t.border,
  };

  function Label({ children, hint }: { children: string; hint?: string }) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 12.5,
            fontFamily: sans(700),
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: t.muted,
          }}
        >
          {children}
        </Text>
        {hint ? <Text style={{ fontSize: 12, fontFamily: sans(400), color: t.muted }}>{hint}</Text> : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          padding: 8,
          backgroundColor: t.bg,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={23} color={t.text} />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 16, fontFamily: sans(600), color: t.text }}>
          {isEdit ? `Editar ponto ${String(f.id).padStart(2, '0')}` : 'Novo ponto'}
        </Text>
        <Pressable
          onPress={save}
          style={{
            borderRadius: 999,
            paddingVertical: 9,
            paddingHorizontal: 18,
            marginRight: 4,
            backgroundColor: t.accent,
          }}
        >
          <Text style={{ color: t.accentInk, fontSize: 14.5, fontFamily: sans(700) }}>Salvar</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 46, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Setor */}
        <View>
          <Label hint="VLAN preenchida automaticamente">Setor</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sectors.map((s) => (
              <PickChip key={s} label={s} active={f.sector === s} onPress={() => pickSector(s)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TextInput
              value={newSector}
              onChangeText={setNewSector}
              placeholder="+ Novo setor"
              placeholderTextColor={t.muted}
              style={[inputStyle, { flex: 1 }]}
            />
            <Pressable
              disabled={!newSector.trim()}
              onPress={() => {
                pickSector(newSector.trim());
                setNewSector('');
              }}
              style={{
                borderRadius: 12,
                paddingHorizontal: 18,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: newSector.trim() ? t.accent : t.chip,
              }}
            >
              <Text
                style={{
                  fontSize: 14.5,
                  fontFamily: sans(600),
                  color: newSector.trim() ? t.accentInk : t.muted,
                }}
              >
                Usar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Etiqueta da tomada */}
        <View>
          <Label>Etiqueta da tomada</Label>
          <TextInput
            value={f.point}
            onChangeText={(v) => set('point', v)}
            placeholder="Ex: GSA-05"
            placeholderTextColor={t.muted}
            style={inputStyle}
          />
        </View>

        {/* Dispositivo */}
        <View>
          <Label>Dispositivo conectado</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DEVICES.map((d) => (
              <PickChip
                key={d}
                label={d === '—' ? 'Nenhum' : d}
                active={f.device === d}
                onPress={() => set('device', d)}
              />
            ))}
          </View>
        </View>

        {/* Patch panel + porta */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Label>Patch Panel</Label>
            <Segmented
              options={(panels && panels.length ? panels : [{ id: 'A' }]).map((p) => ({
                value: p.id,
                label: p.id,
              }))}
              value={f.patchPanel}
              onChange={(v) => set('patchPanel', v)}
            />
          </View>
          <View style={{ width: 120 }}>
            <Label>Porta</Label>
            <TextInput
              value={f.patchPort}
              onChangeText={(v) => set('patchPort', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="1–48"
              placeholderTextColor={t.muted}
              style={[
                inputStyle,
                {
                  fontFamily: mono(700),
                  textAlign: 'center',
                  borderWidth: touched && !valid ? 1.5 : 1,
                  borderColor: touched && !valid ? '#f43f5e' : t.border,
                },
              ]}
            />
          </View>
        </View>
        {touched && !valid ? (
          <Text style={{ fontSize: 12.5, fontFamily: sans(400), color: '#f43f5e', marginTop: -12 }}>
            Informe o número da porta do patch panel.
          </Text>
        ) : null}

        {/* Switch + porta */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Label>Switch</Label>
            <TextInput
              value={f.sw}
              onChangeText={(v) => set('sw', v)}
              placeholder="CORE"
              placeholderTextColor={t.muted}
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Label hint="auto">Porta switch</Label>
            <TextInput
              value={f.swPort}
              onChangeText={(v) => set('swPort', v)}
              placeholder={valid ? `Gi1/0/${portNum}` : 'Gi1/0/…'}
              placeholderTextColor={t.muted}
              style={[inputStyle, { fontFamily: mono(400) }]}
            />
          </View>
        </View>

        {/* VLAN */}
        <View>
          <Label>VLAN</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <PickChip
              label="Sem VLAN"
              active={f.vlan == null}
              onPress={() => setF((prev) => ({ ...prev, vlan: null, vlanName: null }))}
            />
            {VLANS.map((v) => (
              <PickChip
                key={v.id}
                label={`${v.id} · ${v.name}`}
                active={f.vlan === v.id}
                onPress={() => pickVlan(v.id)}
              />
            ))}
          </View>
        </View>

        {/* Status */}
        <View>
          <Label>Status</Label>
          <Segmented
            options={STATUSES.map((s) => ({
              value: s,
              label: STATUS_META[s].label,
              color: STATUS_META[s].color,
            }))}
            value={f.status}
            onChange={(v) => set('status', v)}
            withDot
          />
        </View>

        {/* Observações */}
        <View>
          <Label>Observações</Label>
          <TextInput
            value={f.obs}
            onChangeText={(v) => set('obs', v)}
            placeholder="Anote algo útil para a manutenção…"
            placeholderTextColor={t.muted}
            multiline
            numberOfLines={3}
            style={[
              inputStyle,
              { height: 90, paddingTop: 12, paddingBottom: 12, lineHeight: 21, textAlignVertical: 'top' },
            ]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
