// tokens.ts — Design tokens (port fiel do protótipo: app.jsx buildTheme).

import type { ConnectionStatus } from '../types';

export type ThemeMode = 'light' | 'dark';
export type Density = 'compact' | 'regular' | 'comfy';

export interface Theme {
  bg: string;          // fundo da tela (mais escuro)
  bgElev: string;      // barras fixas (header / bottom nav)
  surface: string;     // cards
  surface2: string;    // superfície interna / chips profundos
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  chip: string;
  accent: string;
  accentInk: string;   // texto/ícone sobre o accent
  accentSoft: string;  // accent translúcido (fundos)
  glow: string;        // cor do brilho do accent
  dark: boolean;
}

// Cor de destaque "console" (teal neon). Opções alternativas mantidas.
export const ACCENT_OPTIONS = ['#2dd4bf', '#38bdf8', '#a78bfa', '#fb923c', '#f472b6'];
export const DEFAULT_ACCENT = '#2dd4bf';

// ── Constrói o tema a partir do accent + modo escuro ────────────────
// O app nasce escuro (estética de console técnico). O modo claro é mantido
// como fallback, mas não há UI para alterná-lo.
export function buildTheme(accent: string, dark: boolean): Theme {
  if (dark) {
    return {
      bg: '#080b11',
      bgElev: '#0c111a',
      surface: '#111824',
      surface2: '#19212f',
      text: '#e8eef5',
      muted: '#76828f',
      border: '#1c2531',
      borderStrong: '#2b3645',
      chip: '#19212f',
      accent,
      accentInk: '#04231f',
      accentSoft: accent + '24',
      glow: accent,
      dark: true,
    };
  }
  return {
    bg: '#f3f5f8',
    bgElev: '#ffffff',
    surface: '#ffffff',
    surface2: '#f1f4f8',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e7ebf0',
    borderStrong: '#cbd5e1',
    chip: '#f1f4f8',
    accent,
    accentInk: '#ffffff',
    accentSoft: accent + '1c',
    glow: accent,
    dark: false,
  };
}

// ── Cores semânticas de status (calibradas para fundo escuro) ───────
export const STATUS_META: Record<
  ConnectionStatus,
  { label: string; color: string; icon: string }
> = {
  ativo: { label: 'Ativo', color: '#22c55e', icon: 'check' },
  inativo: { label: 'Inativo', color: '#64748b', icon: 'close' },
  problema: { label: 'Problema', color: '#f43f5e', icon: 'alert' },
};

export function statusColor(s: ConnectionStatus): string {
  return (STATUS_META[s] || STATUS_META.inativo).color;
}

export function withAlpha(hex: string, a: string): string {
  return hex + a;
}

// ── Mapeamento de ícone por dispositivo ─────────────────────────────
export const DEVICE_ICON: Record<string, string> = {
  Desktop: 'desktop',
  Notebook: 'notebook',
  'Telefone IP': 'phone',
  Impressora: 'printer',
  'Access Point': 'ap',
  'Câmera IP': 'camera',
};

// ── Cores por setor / VLAN (screen-extra.jsx) ───────────────────────
export const SECTOR_COLORS: Record<string, string> = {
  GSAD: '#6366f1', GAB: '#0d9488', 'GAB Recepção': '#d97706', Secretaria: '#db2777',
};

// Paleta de cores oferecida no modal de edição do setor.
export const SECTOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

// Conversão HSL→RGB (0..1, 0..1, 0..1) → [r,g,b] 0..255.
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return [f(0), f(8), f(4)];
}

// Cor estável derivada do nome — fallback quando o setor não tem cor própria
// (ex.: offline). Evita o "tudo azul": setores ficam visualmente distintos.
export function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const [r, g, b] = hslToRgb(h / 360, 0.6, 0.55);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function sectorColor(name: string): string {
  return SECTOR_COLORS[name] || hashColor(name);
}

export const VLAN_COLORS: Record<number, string> = {
  10: '#0d9488', 11: '#d97706', 20: '#6366f1', 30: '#db2777', 99: '#64748b',
};
export function vlanColor(id: number): string {
  return VLAN_COLORS[id] || '#0ea5e9';
}
