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
export interface Point {
  id: number;                 // ID DE CONEXÃO
  sector: string | null;      // SETOR (null = livre)
  patchPanel: string;         // PATCH PANEL
  patchPort: number;          // porta no patch panel
  sw: string;                 // SWITCH
  swPort: string;             // porta no switch (Gi1/0/N)
  vlan: number | null;
  vlanName: string | null;
  device: DeviceType | string;
  status: ConnectionStatus;
  point: string | null;       // etiqueta da tomada na parede
  obs: string;
  updatedAt: string;
}

export type Density = 'compact' | 'regular' | 'comfy';
