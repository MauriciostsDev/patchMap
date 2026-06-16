// api/resources.ts — endpoints REST dos recursos do PatchMap.

import { request } from './client';
import type {
  ConnectionPointDTO,
  SectorDTO,
  PatchPanelDTO,
  SwitchDTO,
  VlanDTO,
  Topology,
} from './dto';

export const getPoints = () => request<ConnectionPointDTO[]>('/points/');
export const getSectors = () => request<SectorDTO[]>('/sectors/');
export const getPanels = () => request<PatchPanelDTO[]>('/panels/');
export const getSwitches = () => request<SwitchDTO[]>('/switches/');
export const getVlans = () => request<VlanDTO[]>('/vlans/');

// Carrega toda a topologia em paralelo (setores, painéis, switches, VLANs).
export async function getTopology(): Promise<Topology> {
  const [sectors, panels, switches, vlans] = await Promise.all([
    getSectors(),
    getPanels(),
    getSwitches(),
    getVlans(),
  ]);
  return { sectors, panels, switches, vlans };
}

// ── Escrita (usado no incremento 2b) ──────────────────────────────────
export const createPoint = (body: Partial<ConnectionPointDTO>) =>
  request<ConnectionPointDTO>('/points/', { method: 'POST', body });

export const updatePoint = (id: string, body: Partial<ConnectionPointDTO>) =>
  request<ConnectionPointDTO>(`/points/${id}/`, { method: 'PUT', body });

export const deletePointApi = (id: string) =>
  request<null>(`/points/${id}/`, { method: 'DELETE' });

// ── Patch panels ──────────────────────────────────────────────────────
export const deletePanelApi = (id: string) =>
  request<null>(`/panels/${id}/`, { method: 'DELETE' });

// ── Setores (edição: nome/cor/vlan) ───────────────────────────────────
export const updateSectorApi = (id: string, body: Partial<SectorDTO>) =>
  request<SectorDTO>(`/sectors/${id}/`, { method: 'PATCH', body });

// ── VLANs (grupos de setores) ─────────────────────────────────────────
export const createVlanApi = (body: Partial<VlanDTO> & { sectorIds?: string[] }) =>
  request<VlanDTO>('/vlans/', { method: 'POST', body });

export const updateVlanApi = (id: string, body: Partial<VlanDTO> & { sectorIds?: string[] }) =>
  request<VlanDTO>(`/vlans/${id}/`, { method: 'PATCH', body });

export const deleteVlanApi = (id: string) =>
  request<null>(`/vlans/${id}/`, { method: 'DELETE' });
