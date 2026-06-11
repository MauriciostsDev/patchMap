// useTheme.ts — tema reativo derivado dos tweaks do store.

import { useAppStore } from '../store';
import { buildTheme, type Theme } from './tokens';

export function useTheme(): Theme {
  const accent = useAppStore((s) => s.accent);
  const dark = useAppStore((s) => s.dark);
  return buildTheme(accent, dark);
}
