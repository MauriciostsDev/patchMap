// ConnectionDetailScreen.tsx — Detalhe do ponto (port de screen-detail.jsx).

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store';
import { useTheme } from '../theme/useTheme';
import { sans, mono } from '../theme/fonts';
import type { ConnectionStatus } from '../types';
import { STATUS_META, statusColor, withAlpha, DEVICE_ICON } from '../theme/tokens';
import { STATUSES } from '../data/seed';
import { Icon } from '../components/Icon';
import { StatusBadge } from '../components/StatusBadge';
import { TracePath } from '../components/TracePath';

function InfoCell({
  icon,
  label,
  value,
  monoValue,
}: {
  icon?: string;
  label: string;
  value: string;
  monoValue?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Icon name={icon} size={15} color={t.muted} stroke={2} /> : null}
        <Text
          style={{
            fontSize: 11.5,
            fontFamily: sans(700),
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: t.muted,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 15.5,
          fontFamily: monoValue ? mono(600) : sans(600),
          color: t.text,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: t.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function ConnectionDetailScreen({ route, navigation }: Props) {
  const t = useTheme();
  const { id } = route.params;
  const p = useAppStore((s) => s.points.find((pt) => pt.id === id));
  const changePoint = useAppStore((s) => s.changePoint);
  const deletePoint = useAppStore((s) => s.deletePoint);

  const [sheet, setSheet] = useState(false);

  if (!p) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }
  const sc = statusColor(p.status);

  function setStatus(s: ConnectionStatus) {
    changePoint({ ...p!, status: s, updatedAt: '2026-06-10' });
    setSheet(false);
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
          <Icon name="back" size={24} color={t.text} />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 16, fontFamily: sans(600), color: t.text }}>
          Ponto de conexão
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Form', { id: p.id })}
          style={{ width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="edit" size={21} color={t.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 46, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.accentSoft,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: sans(700),
                letterSpacing: 0.5,
                color: t.accent,
                textTransform: 'uppercase',
              }}
            >
              ID
            </Text>
            <Text style={{ fontSize: 30, fontFamily: mono(700), color: t.accent }}>
              {String(p.id).padStart(2, '0')}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 22, fontFamily: sans(700), color: t.text, letterSpacing: -0.3 }}>
              {p.sector || 'Não atribuído'}
            </Text>
            <Text style={{ fontSize: 14, fontFamily: sans(400), color: t.muted, marginTop: 2, marginBottom: 8 }}>
              {p.point ? `Tomada ${p.point}` : 'Tomada sem etiqueta'}
            </Text>
            <StatusBadge status={p.status} />
          </View>
        </View>

        {/* Mudar status */}
        <Pressable
          onPress={() => setSheet(true)}
          style={{
            borderRadius: 12,
            height: 46,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: t.chip,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: sc }} />
          <Text style={{ fontSize: 14.5, fontFamily: sans(600), color: t.text }}>Mudar status</Text>
        </Pressable>

        {/* Trace físico */}
        <View>
          <Text
            style={{
              fontSize: 12.5,
              fontFamily: sans(700),
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: t.muted,
              marginHorizontal: 2,
              marginTop: 4,
              marginBottom: 12,
            }}
          >
            Caminho físico
          </Text>
          <Card>
            <TracePath p={p} />
          </Card>
        </View>

        {/* Info */}
        <Card>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <InfoCell
              icon={DEVICE_ICON[p.device] || 'outlet'}
              label="Dispositivo"
              value={p.device === '—' ? 'Nenhum' : p.device}
            />
            <InfoCell
              icon="vlan"
              label="VLAN"
              value={p.vlan != null ? `${p.vlan} · ${p.vlanName}` : 'Nenhuma'}
              monoValue
            />
          </View>
          <View style={{ height: 1, backgroundColor: t.border, marginVertical: 14 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <InfoCell
              icon="panel"
              label="Patch / Switch"
              value={`PP ${p.patchPanel}·${p.patchPort} → ${p.swPort}`}
              monoValue
            />
            <InfoCell icon="clock" label="Atualizado" value={p.updatedAt} monoValue />
          </View>
        </Card>

        {/* Observações */}
        <Card>
          <Text
            style={{
              fontSize: 11.5,
              fontFamily: sans(700),
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: t.muted,
            }}
          >
            Observações
          </Text>
          <Text
            style={{
              fontSize: 14.5,
              fontFamily: sans(400),
              color: p.obs ? t.text : t.muted,
              marginTop: 6,
              lineHeight: 21,
            }}
          >
            {p.obs || 'Sem observações registradas.'}
          </Text>
        </Card>

        <Pressable
          onPress={() => {
            deletePoint(p.id);
            navigation.goBack();
          }}
          style={{
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
          }}
        >
          <Icon name="trash" size={18} color="#dc2626" />
          <Text style={{ color: '#dc2626', fontSize: 14, fontFamily: sans(600) }}>Excluir ponto</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom sheet de status */}
      <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)}>
        <Pressable
          onPress={() => setSheet(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: t.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 10,
              paddingHorizontal: 16,
              paddingBottom: 22,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 999,
                backgroundColor: t.borderStrong,
                alignSelf: 'center',
                marginBottom: 14,
              }}
            />
            <Text style={{ fontSize: 16, fontFamily: sans(700), color: t.text, marginBottom: 10 }}>
              Mudar status do ponto
            </Text>
            {STATUSES.map((s) => {
              const m = STATUS_META[s];
              const on = p.status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 13,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: on ? withAlpha(m.color, '14') : 'transparent',
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: withAlpha(m.color, '1f'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={m.icon} size={19} color={m.color} stroke={2.4} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 15.5, fontFamily: sans(600), color: t.text }}>
                    {m.label}
                  </Text>
                  {on ? <Icon name="check" size={20} color={m.color} stroke={2.6} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
