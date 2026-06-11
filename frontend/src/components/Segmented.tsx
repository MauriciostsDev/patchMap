// Segmented.tsx — controle segmentado (port de screen-form.jsx).

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { sans } from '../theme/fonts';

export interface SegOption<T> {
  value: T;
  label: string;
  color?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  withDot,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  withDot?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        backgroundColor: t.chip,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              borderRadius: 9,
              paddingVertical: 9,
              paddingHorizontal: 4,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: on ? t.surface : 'transparent',
              ...(on
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.12,
                    shadowRadius: 3,
                    elevation: 2,
                  }
                : {}),
            }}
          >
            {withDot && o.color ? (
              <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: o.color }} />
            ) : null}
            <Text
              style={{
                fontSize: 14,
                fontFamily: sans(600),
                color: on ? o.color || t.text : t.muted,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
