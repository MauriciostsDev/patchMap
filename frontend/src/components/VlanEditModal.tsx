// VlanEditModal.tsx — cria/edita uma VLAN (grupo) e escolhe seus setores.

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView, Alert } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import { Icon } from './Icon';
import type { VlanDTO } from '../api';

export function VlanEditModal({
  open,
  vlan,
  onClose,
}: {
  open: boolean;
  vlan: VlanDTO | null; // null + open => criar
  onClose: () => void;
}) {
  const t = useTheme();
  const sectors = useAppStore((s) => s.sectors);
  const colorOf = useAppStore((s) => s.sectorColorOf);
  const createVlan = useAppStore((s) => s.createVlan);
  const updateVlan = useAppStore((s) => s.updateVlan);
  const deleteVlan = useAppStore((s) => s.deleteVlan);

  const isEdit = !!vlan;
  const [num, setNum] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setNum(vlan ? String(vlan.vlanId) : '');
      setName(vlan ? vlan.name : '');
      setSelected(vlan ? [...vlan.sectorIds] : []);
    }
  }, [open, vlan?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const vlanNum = parseInt(num, 10);
  const valid = Number.isFinite(vlanNum) && vlanNum > 0 && !!name.trim();

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function save() {
    if (!valid) return;
    if (isEdit && vlan) {
      updateVlan(vlan.id, { vlanId: vlanNum, name: name.trim(), sectorIds: selected });
    } else {
      createVlan({ vlanId: vlanNum, name: name.trim(), sectorIds: selected });
    }
    onClose();
  }

  function remove() {
    if (!vlan) return;
    Alert.alert(
      'Excluir VLAN',
      `Tem certeza que deseja excluir a VLAN ${vlan.vlanId} — ${vlan.name}? Os setores voltam a ficar sem VLAN. Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteVlan(vlan.id);
            onClose();
          },
        },
      ],
    );
  }

  const label = (s: string) => (
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
      {s}
    </Text>
  );
  const input = {
    backgroundColor: t.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15.5,
    color: t.text,
    fontFamily: sans(500),
    borderWidth: 1,
    borderColor: t.border,
  } as const;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
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
            paddingBottom: 24,
            maxHeight: '88%',
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
            {isEdit ? 'Editar VLAN' : 'Nova VLAN'}
          </Text>

          {/* Número + nome */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ width: 110 }}>
              {label('VLAN nº')}
              <TextInput
                value={num}
                onChangeText={(v) => setNum(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={t.muted}
                style={[input, { fontFamily: mono(700), textAlign: 'center' }]}
              />
            </View>
            <View style={{ flex: 1 }}>
              {label('Nome')}
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Administrativo"
                placeholderTextColor={t.muted}
                style={input}
              />
            </View>
          </View>

          {/* Setores do grupo */}
          {label(`Setores no grupo (${selected.length})`)}
          <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4 }}>
              {sectors.map((s) => {
                const on = selected.includes(s.id);
                const c = s.color || colorOf(s.name);
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => toggle(s.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 999,
                      paddingVertical: 7,
                      paddingHorizontal: 12,
                      backgroundColor: on ? c + '22' : t.chip,
                      borderWidth: 1.5,
                      borderColor: on ? c : t.border,
                    }}
                  >
                    <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: c }} />
                    <Text
                      style={{
                        fontSize: 13.5,
                        fontFamily: sans(on ? 700 : 500),
                        color: t.text,
                      }}
                    >
                      {s.name}
                    </Text>
                    {on ? <Icon name="check" size={13} color={c} stroke={3} /> : null}
                  </Pressable>
                );
              })}
              {sectors.length === 0 ? (
                <Text style={{ fontSize: 13.5, fontFamily: sans(400), color: t.muted }}>
                  Sincronize para listar os setores.
                </Text>
              ) : null}
            </View>
          </ScrollView>

          {/* Ações */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {isEdit ? (
              <Pressable
                onPress={remove}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#dc262618',
                }}
              >
                <Icon name="trash" size={20} color="#dc2626" />
              </Pressable>
            ) : null}
            <Pressable
              onPress={save}
              disabled={!valid}
              style={{
                flex: 1,
                borderRadius: 13,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: valid ? t.accent : t.chip,
              }}
            >
              <Text
                style={{
                  color: valid ? t.accentInk : t.muted,
                  fontSize: 15.5,
                  fontFamily: sans(700),
                }}
              >
                {isEdit ? 'Salvar' : 'Criar VLAN'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
