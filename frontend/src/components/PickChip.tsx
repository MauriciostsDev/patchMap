// PickChip.tsx — chip selecionável de formulário (port de screen-form.jsx).

import React from 'react';
import { Text, Pressable } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { sans } from '../theme/fonts';

export function PickChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 15,
        backgroundColor: active ? t.accent : t.chip,
        borderWidth: active ? 0 : 1,
        borderColor: t.border,
      }}
    >
      <Text style={{ fontSize: 14, fontFamily: sans(600), color: active ? t.accentInk : t.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
