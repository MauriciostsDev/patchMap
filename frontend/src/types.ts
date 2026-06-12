// types.ts — contrato de dados do PatchMap.
// Port fiel de data.js do protótipo (modelo plano: 1 ponto = 1 porta).

export type ConnectionStatus = 'ativo' | 'inativo' | 'problema';

export type DeviceType =
  | 'Desktop'
  | 'Notebook'
  | 'Telefone IP'
  | 'Impressora'
  | 'Access Point'
  | 'Câmera IP'
  | '—';

export interface Sector {
  name: string;
  vlan: number;
  vlanName: string;
}

export interface Vlan {
  id: number;
  name: string;
}

export interface PanelDef {
  id: string;
  label: string;
  ports: number;
  sw: string;
}

// Ponto de conexão — equivale a uma porta do patch panel.
// Modelo "plano" usado pela UI. Quando vem do backend, é traduzido pelo mapper
// (api/mappers.ts) que resolve os FKs e preenche os campos ricos (deviceName,
// macAddress, ipAddress, identifier) + os *Id para a escrita de volta.
export interface Point {
  id: number;                 // ID DE CONEXÃO (sufixo numérico do serverId)
  serverId?: string;          // PK no backend ('c12'); ausente = só local (offline)
  sector: string | null;      // SETOR — nome (resolvido de sectorId)
  patchPanel: string;         // PATCH PANEL — label/nome (resolvido)
  patchPort: number;          // porta no patch panel
  sw: string;                 // SWITCH — nome (resolvido)
  swPort: string;             // porta no switch (Gi1/0/N)
  vlan: number | null;        // número da VLAN (ex.: 10)
  vlanName: string | null;
  device: DeviceType | string;// = deviceType
  status: ConnectionStatus;
  point: string | null;       // etiqueta da tomada na parede (= identifier)
  obs: string;                // = notes
  updatedAt: string;          // = lastUpdate (YYYY-MM-DD)

  // ── Campos ricos do backend (opcionais p/ compat. com o seed offline) ──
  identifier?: string;        // 'GAB-01'
  deviceName?: string;        // 'DESK-GAB-01'
  macAddress?: string;
  ipAddress?: string | null;
  // FKs (string) — fonte de verdade p/ a escrita de volta no backend.
  sectorId?: string | null;
  patchPanelId?: string;
  switchId?: string;
  switchPort?: number;
  vlanRef?: string | null;    // id da VLAN ('v1')

  dirty?: boolean;            // alterado offline, aguardando sincronização
}

export type Density = 'compact' | 'regular' | 'comfy';
