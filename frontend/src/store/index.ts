// store/index.ts — Store Zustand + persistência AsyncStorage.
// Port do protótipo (app.jsx): auth, pontos, painéis e tweaks de tema.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Point, PanelDef } from '../types';
import { SEED_POINTS, PATCH_PANELS_DEF, SECTORS } from '../data/seed';
import type { Density } from '../theme/tokens';
import { DEFAULT_ACCENT } from '../theme/tokens';

interface AppState {
  // Auth
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  // Dados
  points: Point[];
  panels: PanelDef[];

  // CRUD
  addPanel: (def: PanelDef) => void;
  savePoint: (np: Point) => void;
  changePoint: (np: Point) => void;
  deletePoint: (id: number) => void;

  // Setores conhecidos (seed + os usados nos pontos)
  allSectors: () => string[];

  // Tweaks de tema
  accent: string;
  dark: boolean;
  density: Density;
  setAccent: (v: string) => void;
  setDark: (v: boolean) => void;
  setDensity: (v: Density) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Autenticação ────────────────────────────────────────────
      isLoggedIn: false,
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),

      // ── Dados ───────────────────────────────────────────────────
      points: SEED_POINTS,
      panels: PATCH_PANELS_DEF,

      // ── Adicionar painel ────────────────────────────────────────
      addPanel: (def) =>
        set((state) => {
          const maxId = Math.max(0, ...state.points.map((p) => p.id));
          const newPoints: Point[] = Array.from({ length: def.ports }, (_, i) => ({
            id: maxId + i + 1,
            sector: null,
            patchPanel: def.id,
            patchPort: i + 1,
            sw: def.sw,
            swPort: `Gi1/0/${i + 1}`,
            vlan: null,
            vlanName: null,
            device: '—',
            status: 'inativo',
            point: null,
            obs: '',
            updatedAt: '2026-06-10',
          }));
          return { panels: [...state.panels, def], points: [...state.points, ...newPoints] };
        }),

      // ── CRUD pontos ─────────────────────────────────────────────
      savePoint: (np) =>
        set((state) => {
          const exists = state.points.some((p) => p.id === np.id);
          return {
            points: exists
              ? state.points.map((p) => (p.id === np.id ? np : p))
              : [...state.points, np],
          };
        }),
      changePoint: (np) =>
        set((state) => ({ points: state.points.map((p) => (p.id === np.id ? np : p)) })),
      deletePoint: (id) =>
        set((state) => ({ points: state.points.filter((p) => p.id !== id) })),

      allSectors: () => {
        const pts = get().points;
        return [
          ...new Set([
            ...SECTORS.map((s) => s.name),
            ...pts.map((p) => p.sector).filter(Boolean) as string[],
          ]),
        ];
      },

      // ── Tweaks de tema ──────────────────────────────────────────
      accent: DEFAULT_ACCENT,
      dark: false,
      density: 'regular',
      setAccent: (v) => set({ accent: v }),
      setDark: (v) => set({ dark: v }),
      setDensity: (v) => set({ density: v }),
    }),
    {
      name: 'patchmap.store.v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
