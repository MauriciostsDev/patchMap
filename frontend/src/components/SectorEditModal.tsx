// SectorEditModal.tsx — edita nome e cor de um setor (abre ao tocar no setor).

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans } from '../theme/fonts';
import { SECTOR_PALETTE } from '../theme/tokens';
import { Icon } from './Icon';

export function SectorEditModal({
  name,
  onClose,
}: {
  name: string | null;
  onClose: () => void;
}) {
  const t = useTheme();
  const sectors = useAppStore((s) => s.sectors);
  const colorOf = useAppStore((s) => s.sectorColorOf);
  const updateSector = useAppStore((s) => s.updateSector);

  const sector = sectors.find((s) => s.name === name);
  const [draftName, setDraftName] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (sector) {
      setDraftName(sector.name);
      setColor(sector.color || colorOf(sector.name));
    }
  }, [sector?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = name != null;
  const editable = !!sector; // só dá p/ editar setores carregados do backend

  function save() {
    if (sector) {
      updateSector(sector.id, { name: draftName.trim() || sector.name, color });
    }
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="building" size={18} color={color} />
            </View>
            <Text style={{ fontSize: 17, fontFamily: sans(700), color: t.text }}>Editar setor</Text>
          </View>

          {!editable ? (
            <Text style={{ fontSize: 13.5, fontFamily: sans(400), color: t.muted, marginBottom: 12 }}>
              Faça login e sincronize para editar este setor.
            </Text>
          ) : null}

          {/* Nome */}
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
            Nome
          </Text>
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            editable={editable}
            placeholderTextColor={t.muted}
            style={{
              backgroundColor: t.bg,
              borderRadius: 12,
              paddingHorizontal: 14,
              height: 48,
              fontSize: 15.5,
              color: t.text,
              fontFamily: sans(500),
              borderWidth: 1,
              borderColor: t.border,
              marginBottom: 18,
            }}
          />

          {/* Cor */}
          <Text
            style={{
              fontSize: 12,
              fontFamily: sans(700),
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: t.muted,
              marginBottom: 10,
            }}
          >
            Cor
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
            {SECTOR_PALETTE.map((c) => {
              const on = c.toLowerCase() === color.toLowerCase();
              return (
                <Pressable
                  key={c}
                  onPress={() => editable && setColor(c)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: c,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: on ? 3 : 0,
                    borderColor: t.surface,
                    shadowColor: on ? c : 'transparent',
                    shadowOpacity: on ? 0.6 : 0,
                    shadowRadius: 6,
                    elevation: on ? 3 : 0,
                  }}
                >
                  {on ? <Icon name="check" size={16} color="#fff" stroke={3} /> : null}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={save}
            disabled={!editable}
            style={{
              borderRadius: 13,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: editable ? t.accent : t.chip,
            }}
          >
            <Text
              style={{
                color: editable ? t.accentInk : t.muted,
                fontSize: 15.5,
                fontFamily: sans(700),
              }}
            >
              Salvar
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
