/* data.js — modelo de dados do rastreador de conexões
   Baseado na planilha: SETOR | PATCH PANEL | ID DE CONEXÃO | SWITCH
   Enriquecido com: porta do switch, VLAN por setor, dispositivo, status, ponto e observações.
   Expõe window.SECTORS, window.SEED_POINTS, window.VLANS, window.DEVICES, window.STATUSES. */

// ── Setores e suas VLANs ────────────────────────────────────────────
const SECTORS = [
  { name: 'GSAD',          vlan: 20, vlanName: 'Administrativo' },
  { name: 'GAB',           vlan: 10, vlanName: 'Gabinete' },
  { name: 'GAB Recepção',  vlan: 11, vlanName: 'Recepção' },
  { name: 'Secretaria',    vlan: 30, vlanName: 'Secretaria' },
];

const VLANS = [
  { id: 10, name: 'Gabinete' },
  { id: 11, name: 'Recepção' },
  { id: 20, name: 'Administrativo' },
  { id: 30, name: 'Secretaria' },
  { id: 99, name: 'Convidados' },
];

const DEVICES = ['Desktop', 'Notebook', 'Telefone IP', 'Impressora', 'Access Point', 'Câmera IP', '—'];

const STATUSES = ['ativo', 'inativo', 'problema'];

// ── Mapa de portas do patch panel A (1..32) → setor, da planilha ────
// null = porta livre (não atribuída a setor)
const PORT_SECTOR = {
  8: 'GSAD', 9: 'GSAD', 10: 'GSAD', 11: 'GSAD',
  13: 'GAB', 14: 'GAB', 15: 'GAB', 16: 'GAB', 17: 'GAB',
  18: 'GAB Recepção', 19: 'GAB Recepção', 20: 'GAB Recepção', 21: 'GAB Recepção',
  25: 'Secretaria',
};

// status/dispositivo "realistas" por porta (overrides); resto é inferido
const OVERRIDES = {
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

function sectorMeta(name) {
  return SECTORS.find(s => s.name === name) || null;
}

// gera o ponto/etiqueta da tomada: ex GSAD-01
const sectorCounters = {};
function pointLabel(sector) {
  if (!sector) return null;
  const key = sector;
  sectorCounters[key] = (sectorCounters[key] || 0) + 1;
  const prefix = sector.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 3).toUpperCase();
  return `${prefix}-${String(sectorCounters[key]).padStart(2, '0')}`;
}

const SEED_POINTS = [];
for (let port = 1; port <= 32; port++) {
  const sector = PORT_SECTOR[port] || null;
  const meta = sectorMeta(sector);
  const ov = OVERRIDES[port] || {};
  const status = ov.status || (sector ? 'ativo' : 'inativo');
  SEED_POINTS.push({
    id: port,                              // ID DE CONEXÃO
    sector,                                // SETOR (null = livre)
    patchPanel: 'A',                       // PATCH PANEL
    patchPort: port,                       // porta no patch panel
    sw: 'CORE',                            // SWITCH
    swPort: `Gi1/0/${port}`,               // porta no switch
    vlan: meta ? meta.vlan : null,
    vlanName: meta ? meta.vlanName : null,
    device: sector ? (ov.device || 'Desktop') : '—',
    status,
    point: pointLabel(sector),             // etiqueta da tomada na parede
    obs: ov.obs || '',
    updatedAt: '2026-06-09',
  });
}

const PATCH_PANELS_DEF = [
  { id: 'A', label: 'Painel A', ports: 32, sw: 'CORE' },
];

Object.assign(window, { SECTORS, SEED_POINTS, VLANS, DEVICES, STATUSES, PATCH_PANELS_DEF });
