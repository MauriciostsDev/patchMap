// seed.ts — modelo de dados inicial (port fiel de data.js do protótipo).
// Baseado na planilha: SETOR | PATCH PANEL | ID DE CONEXÃO | SWITCH.
// Enriquecido com: porta do switch, VLAN por setor, dispositivo, status, ponto e observações.

import type { Point, Sector, Vlan, PanelDef, ConnectionStatus, DeviceType } from '../types';

// ── Setores e suas VLANs ────────────────────────────────────────────
export const SECTORS: Sector[] = [
  { name: 'GSAD', vlan: 20, vlanName: 'Administrativo' },
  { name: 'GAB', vlan: 10, vlanName: 'Gabinete' },
  { name: 'GAB Recepção', vlan: 11, vlanName: 'Recepção' },
  { name: 'Secretaria', vlan: 30, vlanName: 'Secretaria' },
];

export const VLANS: Vlan[] = [
  { id: 10, name: 'Gabinete' },
  { id: 11, name: 'Recepção' },
  { id: 20, name: 'Administrativo' },
  { id: 30, name: 'Secretaria' },
  { id: 99, name: 'Convidados' },
];

export const DEVICES: (DeviceType | string)[] = [
  'Desktop', 'Notebook', 'Telefone IP', 'Impressora', 'Access Point', 'Câmera IP', '—',
];

export const STATUSES: ConnectionStatus[] = ['ativo', 'inativo', 'problema'];

// ── Mapa de portas do patch panel A (1..32) → setor, da planilha ────
// não listado = porta livre (não atribuída a setor)
const PORT_SECTOR: Record<number, string> = {
  8: 'GSAD', 9: 'GSAD', 10: 'GSAD', 11: 'GSAD',
  13: 'GAB', 14: 'GAB', 15: 'GAB', 16: 'GAB', 17: 'GAB',
  18: 'GAB Recepção', 19: 'GAB Recepção', 20: 'GAB Recepção', 21: 'GAB Recepção',
  25: 'Secretaria',
};

// status/dispositivo "realistas" por porta (overrides); resto é inferido
const OVERRIDES: Record<number, { status?: ConnectionStatus; device?: string; obs?: string }> = {
  10: { status: 'problema', device: 'Telefone IP', obs: 'Sem link. Verificar crimpagem do cabo na tomada.' },
  16: { status: 'problema', device: 'Desktop', obs: 'Intermitente — possível cabo rompido no forro.' },
  13: { device: 'Telefone IP' },
  14: { device: 'Desktop' },
  15: { device: 'Notebook' },
  17: { device: 'Access Point', obs: 'AP de teto, sala de reunião do gabinete.' },
  8:  { device: 'Desktop' },
  9:  { device: 'Desktop' },
  11: { device: 'Impressora', obs: 'Impressora multifuncional compartilhada.' },
  18: { device: 'Desktop' },
  19: { device: 'Desktop' },
  20: { device: 'Impressora' },
  21: { device: 'Câmera IP', obs: 'Câmera da recepção.' },
  25: { device: 'Desktop' },
  3:  { status: 'inativo', obs: 'Porta livre reservada para expansão.' },
};

function sectorMeta(name: string | null): Sector | null {
  return SECTORS.find((s) => s.name === name) || null;
}

// gera o ponto/etiqueta da tomada: ex GSAD-01
function buildSeed(): Point[] {
  const sectorCounters: Record<string, number> = {};
  function pointLabel(sector: string | null): string | null {
    if (!sector) return null;
    const key = sector;
    sectorCounters[key] = (sectorCounters[key] || 0) + 1;
    const prefix = sector.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 3).toUpperCase();
    return `${prefix}-${String(sectorCounters[key]).padStart(2, '0')}`;
  }

  const points: Point[] = [];
  for (let port = 1; port <= 32; port++) {
    const sector = PORT_SECTOR[port] || null;
    const meta = sectorMeta(sector);
    const ov = OVERRIDES[port] || {};
    const status: ConnectionStatus = ov.status || (sector ? 'ativo' : 'inativo');
    points.push({
      id: port,
      sector,
      patchPanel: 'A',
      patchPort: port,
      sw: 'CORE',
      swPort: `Gi1/0/${port}`,
      vlan: meta ? meta.vlan : null,
      vlanName: meta ? meta.vlanName : null,
      device: sector ? (ov.device || 'Desktop') : '—',
      status,
      point: pointLabel(sector),
      obs: ov.obs || '',
      updatedAt: '2026-06-09',
    });
  }
  return points;
}

export const SEED_POINTS: Point[] = buildSeed();

export const PATCH_PANELS_DEF: PanelDef[] = [
  { id: 'A', label: 'Painel A', ports: 32, sw: 'CORE' },
];
