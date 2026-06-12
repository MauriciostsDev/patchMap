// api/dto.ts — formato exato dos recursos do backend (camelCase do DRF).
// Ver backend/network/serializers.py.

export interface SectorDTO {
  id: string;
  name: string;
  building: string;
  floor: string;
  color: string;
  vlanId: string | null;
}

export interface PatchPanelDTO {
  id: string;
  name: string;
  location: string;
  ports: number;
}

export interface SwitchDTO {
  id: string;
  name: string;
  model: string;
  location: string;
  ports: number;
  ip: string;
}

export interface VlanDTO {
  id: string;
  vlanId: number;
  name: string;
  subnet: string;
  description: string;
  sectorIds: string[];
}

export interface ConnectionPointDTO {
  id: string;
  identifier: string;
  sectorId: string;
  patchPanelId: string;
  port: number;
  switchId: string;
  switchPort: number;
  deviceType: string;
  deviceName: string;
  macAddress: string;
  ipAddress: string | null;
  vlanId: string | null;
  status: 'ativo' | 'inativo' | 'problema';
  notes: string;
  lastUpdate: string;
}

// Conjunto de topologia carregado junto dos pontos.
export interface Topology {
  sectors: SectorDTO[];
  panels: PatchPanelDTO[];
  switches: SwitchDTO[];
  vlans: VlanDTO[];
}
