// store/index.ts — Store Zustand + persistência AsyncStorage.
// Port do protótipo (app.jsx): auth, pontos, painéis e tweaks de tema.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Point, PanelDef } from '../types';
import { SEED_POINTS, PATCH_PANELS_DEF, SECTORS } from '../data/seed';
import type { Density } from '../theme/tokens';
import { DEFAULT_ACCENT, sectorColor } from '../theme/tokens';
import * as api from '../api';
import type { AuthUser, Topology } from '../api';

interface AppState {
  // Auth
  isLoggedIn: boolean;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Dados
  points: Point[];
  panels: PanelDef[];

  // Sincronização com o backend
  topology: Topology | null;
  syncing: boolean;
  lastSyncError: string | null;
  pendingDeletes: string[];          // serverIds excluídos offline, p/ reenvio
  loadFromServer: () => Promise<void>;
  syncPending: () => Promise<void>;  // reenvia pontos dirty + deletes pendentes
  pendingCount: () => number;

  // CRUD
  addPanel: (def: PanelDef) => void;
  savePoint: (np: Point) => void;
  changePoint: (np: Point) => void;
  deletePoint: (id: number) => void;
  _syncPoint: (np: Point) => Promise<void>;

  // Setores conhecidos (seed + os usados nos pontos)
  allSectors: () => string[];

  // ── Setores (cor/edição) e VLANs (grupos de setores) ──────────────
  sectors: api.SectorDTO[];
  vlans: api.VlanDTO[];
  sectorColorOf: (name: string | null | undefined) => string;
  updateSector: (id: string, patch: Partial<api.SectorDTO>) => void;
  createVlan: (data: { vlanId: number; name: string; sectorIds: string[] }) => Promise<void>;
  updateVlan: (id: string, data: { name?: string; vlanId?: number; sectorIds?: string[] }) => Promise<void>;
  deleteVlan: (id: string) => Promise<void>;

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
      user: null,
      signIn: async (email, password) => {
        const user = await api.login(email, password);
        set({ isLoggedIn: true, user });
        // Carrega dados reais logo após autenticar (não bloqueia o login).
        get().loadFromServer();
      },
      signOut: async () => {
        await api.logout();
        set({ isLoggedIn: false, user: null });
      },
      // Boot: reconcilia o isLoggedIn persistido com a presença de token real
      // e, havendo sessão, sincroniza com o backend.
      restoreSession: async () => {
        const ok = await api.hasSession();
        if (!ok) {
          set({ isLoggedIn: false, user: null });
          return;
        }
        get().loadFromServer();
      },

      // ── Dados ───────────────────────────────────────────────────
      points: SEED_POINTS,
      panels: PATCH_PANELS_DEF,

      // ── Sincronização ───────────────────────────────────────────
      topology: null,
      syncing: false,
      lastSyncError: null,
      pendingDeletes: [],
      pendingCount: () =>
        get().points.filter((p) => p.dirty).length + get().pendingDeletes.length,
      // Carrega topologia + pontos do backend e os mapeia p/ o modelo plano.
      // Primeiro envia o que estiver pendente (offline), depois puxa o servidor.
      // Em falha (offline), mantém o que já está no store (seed/persistido).
      loadFromServer: async () => {
        set({ syncing: true, lastSyncError: null });
        try {
          const topology = await api.getTopology();
          set({ topology });
          await get().syncPending(); // empurra alterações offline antes do pull
          const dtos = await api.getPoints();
          const fresh = dtos.map((d) => api.pointFromDTO(d, topology));
          // Preserva pontos locais ainda dirty (não sobrescreve o que não subiu).
          const dirty = get().points.filter((p) => p.dirty);
          const merged = [
            ...fresh.filter((f) => !dirty.some((d) => d.serverId === f.serverId)),
            ...dirty,
          ];
          // Painéis vêm da topologia; deriva o switch de cada um pelos seus pontos.
          const panels = topology.panels.map((pp) => {
            const def = api.panelDefFromDTO(pp);
            const sw = merged.find((p) => p.patchPanel === def.id && p.sw)?.sw;
            return sw ? { ...def, sw } : def;
          });
          set({
            points: merged,
            panels,
            sectors: topology.sectors,
            vlans: topology.vlans,
            syncing: false,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Falha ao sincronizar.';
          set({ syncing: false, lastSyncError: msg });
        }
      },
      // Reenvia deletes pendentes e pontos marcados como dirty.
      syncPending: async () => {
        const { pendingDeletes, isLoggedIn } = get();
        if (!isLoggedIn) return;
        // 1) deletes pendentes
        const remaining: string[] = [];
        for (const serverId of pendingDeletes) {
          try {
            await api.deletePointApi(serverId);
          } catch {
            remaining.push(serverId);
          }
        }
        set({ pendingDeletes: remaining });
        // 2) pontos dirty
        const dirtyPoints = get().points.filter((p) => p.dirty);
        for (const p of dirtyPoints) await get()._syncPoint(p);
      },

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
      // Estratégia: atualização otimista no store + sincronização em segundo
      // plano com o backend. Em falha (offline/validação), mantém o estado
      // local e registra lastSyncError. (Fila offline robusta = incremento 3.)
      savePoint: (np) => {
        set((state) => {
          const exists = state.points.some((p) => p.id === np.id);
          return {
            points: exists
              ? state.points.map((p) => (p.id === np.id ? np : p))
              : [...state.points, np],
          };
        });
        get()._syncPoint(np);
      },
      changePoint: (np) => {
        set((state) => ({ points: state.points.map((p) => (p.id === np.id ? np : p)) }));
        get()._syncPoint(np);
      },
      deletePoint: (id) => {
        const target = get().points.find((p) => p.id === id);
        set((state) => ({ points: state.points.filter((p) => p.id !== id) }));
        if (target?.serverId) {
          api.deletePointApi(target.serverId).catch((e) => {
            // Falhou (offline): enfileira p/ reenvio em syncPending.
            set((state) => ({
              pendingDeletes: [...state.pendingDeletes, target.serverId!],
              lastSyncError: e instanceof Error ? e.message : 'Falha ao excluir.',
            }));
          });
        }
      },

      // Resolve os FKs faltantes (sectorId/switchId/patchPanelId/vlanRef) a
      // partir da topologia carregada e envia POST/PUT ao backend.
      _syncPoint: async (np) => {
        const { topology, isLoggedIn } = get();
        // offline puro: marca dirty p/ reenvio posterior.
        if (!isLoggedIn || !topology) {
          set((state) => ({
            points: state.points.map((p) => (p.id === np.id ? { ...p, dirty: true } : p)),
          }));
          return;
        }
        const enriched: Point = {
          ...np,
          sectorId:
            np.sectorId ??
            topology.sectors.find((s) => s.name === np.sector)?.id ??
            null,
          switchId:
            np.switchId ?? topology.switches.find((s) => s.name === np.sw)?.id,
          patchPanelId:
            np.patchPanelId ??
            topology.panels.find(
              (p) => p.id.replace(/^pp/i, '').toUpperCase() === np.patchPanel,
            )?.id,
          vlanRef:
            np.vlanRef ??
            (np.vlan != null
              ? topology.vlans.find((v) => v.vlanId === np.vlan)?.id ?? null
              : null),
        };
        // Backend exige sector/switch/patchPanel: sem resolução, fica só local.
        if (!enriched.sectorId || !enriched.switchId || !enriched.patchPanelId) {
          set((state) => ({
            points: state.points.map((p) => (p.id === np.id ? { ...p, dirty: true } : p)),
            lastSyncError: 'Ponto salvo localmente (setor/switch/painel não reconhecidos pelo servidor).',
          }));
          return;
        }
        try {
          const body = api.pointToDTO(enriched);
          const dto = np.serverId
            ? await api.updatePoint(np.serverId, body)
            : await api.createPoint(body);
          const saved = api.pointFromDTO(dto, topology); // sem dirty
          // Reconcilia o registro local com o que o backend devolveu (id/serverId).
          set((state) => ({
            points: state.points.map((p) => (p.id === np.id ? saved : p)),
            lastSyncError: null,
          }));
        } catch (e) {
          // Falha de rede/servidor: mantém local e marca dirty p/ reenvio.
          set((state) => ({
            points: state.points.map((p) => (p.id === np.id ? { ...p, dirty: true } : p)),
            lastSyncError: e instanceof Error ? e.message : 'Falha ao salvar.',
          }));
        }
      },

      allSectors: () => {
        const pts = get().points;
        return [
          ...new Set([
            ...get().sectors.map((s) => s.name),
            ...SECTORS.map((s) => s.name),
            ...pts.map((p) => p.sector).filter(Boolean) as string[],
          ]),
        ];
      },

      // ── Setores (cor/edição) e VLANs (grupos) ───────────────────
      sectors: [],
      vlans: [],
      // Cor do setor: usa a cor própria (backend) ou um fallback estável.
      sectorColorOf: (name) => {
        if (!name) return '#64748b';
        const s = get().sectors.find((x) => x.name === name);
        return s?.color || sectorColor(name);
      },
      // Edita um setor (nome/cor/vlan): otimista local + PATCH no backend.
      updateSector: (id, patch) => {
        set((state) => ({
          sectors: state.sectors.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }));
        if (get().isLoggedIn) {
          api.updateSectorApi(id, patch).catch((e) => {
            set({ lastSyncError: e instanceof Error ? e.message : 'Falha ao salvar setor.' });
          });
        }
      },
      // Cria uma VLAN com os setores selecionados.
      createVlan: async ({ vlanId, name, sectorIds }) => {
        try {
          const dto = await api.createVlanApi({ vlanId, name, sectorIds });
          set((state) => ({
            vlans: [...state.vlans, dto],
            // reflete a vinculação dos setores localmente
            sectors: state.sectors.map((s) =>
              sectorIds.includes(s.id) ? { ...s, vlanId: dto.id } : s,
            ),
          }));
        } catch (e) {
          set({ lastSyncError: e instanceof Error ? e.message : 'Falha ao criar VLAN.' });
        }
      },
      // Edita uma VLAN (nome/número/composição de setores).
      updateVlan: async (id, data) => {
        try {
          const dto = await api.updateVlanApi(id, data);
          set((state) => ({
            vlans: state.vlans.map((v) => (v.id === id ? dto : v)),
            sectors: state.sectors.map((s) => {
              const inVlan = dto.sectorIds.includes(s.id);
              if (inVlan) return { ...s, vlanId: id };
              if (s.vlanId === id) return { ...s, vlanId: null }; // saiu do grupo
              return s;
            }),
          }));
        } catch (e) {
          set({ lastSyncError: e instanceof Error ? e.message : 'Falha ao salvar VLAN.' });
        }
      },
      deleteVlan: async (id) => {
        const prev = get().vlans;
        set((state) => ({
          vlans: state.vlans.filter((v) => v.id !== id),
          sectors: state.sectors.map((s) => (s.vlanId === id ? { ...s, vlanId: null } : s)),
        }));
        try {
          await api.deleteVlanApi(id);
        } catch (e) {
          set({ vlans: prev, lastSyncError: e instanceof Error ? e.message : 'Falha ao excluir VLAN.' });
        }
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

// Token expirado e refresh falhou → derruba a sessão na UI.
api.setUnauthorizedHandler(() => {
  useAppStore.setState({ isLoggedIn: false, user: null });
});
