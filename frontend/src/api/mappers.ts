// api/mappers.ts — tradução entre o DTO normalizado do backend e o Point plano
// que a UI consome. Resolve os FKs (sectorId, switchId, vlanId) para os nomes
// que as telas exibem, e preserva os *Id para a escrita de volta.

import type { Point, PanelDef } from '../types';
import type { ConnectionPointDTO, PatchPanelDTO, Topology, VlanDTO } from './dto';

// Sufixo numérico do id do backend ('c12' → 12) para usar como id/key na UI.
export function serverIdToNum(serverId: string): number {
  const n = parseInt(serverId.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

// Código curto do patch panel p/ o badge da UI ('pp1' → '1'). Usado tanto no
// mapper de pontos quanto na lista de painéis, p/ que o filtro da PanelScreen case.
export function panelCode(panelId: string): string {
  return panelId.replace(/^pp/i, '').toUpperCase() || panelId;
}

// PatchPanelDTO → PanelDef (modelo da UI). `id` = panelCode p/ casar com
// point.patchPanel; `sw` fica vazio (o backend não liga painel↔switch).
export function panelDefFromDTO(dto: PatchPanelDTO): PanelDef {
  return { id: panelCode(dto.id), label: dto.name, ports: dto.ports, sw: '' };
}

export function pointFromDTO(dto: ConnectionPointDTO, topo: Topology): Point {
  const sector = topo.sectors.find((s) => s.id === dto.sectorId) || null;
  const panel = topo.panels.find((p) => p.id === dto.patchPanelId) || null;
  const sw = topo.switches.find((s) => s.id === dto.switchId) || null;
  const vlan: VlanDTO | null = dto.vlanId
    ? topo.vlans.find((v) => v.id === dto.vlanId) || null
    : null;

  return {
    id: serverIdToNum(dto.id),
    serverId: dto.id,
    sector: sector?.name ?? null,
    patchPanel: panel ? panelCode(panel.id) : dto.patchPanelId,
    patchPort: dto.port,
    sw: sw?.name ?? dto.switchId,
    swPort: `Gi1/0/${dto.switchPort}`,
    vlan: vlan?.vlanId ?? null,
    vlanName: vlan?.name ?? null,
    device: dto.deviceType,
    status: dto.status,
    point: dto.identifier,
    obs: dto.notes ?? '',
    updatedAt: dto.lastUpdate,

    // campos ricos + FKs p/ escrita
    identifier: dto.identifier,
    deviceName: dto.deviceName,
    macAddress: dto.macAddress,
    ipAddress: dto.ipAddress,
    sectorId: dto.sectorId,
    patchPanelId: dto.patchPanelId,
    switchId: dto.switchId,
    switchPort: dto.switchPort,
    vlanRef: dto.vlanId,
  };
}

// Point → corpo do POST/PUT. Usa os *Id quando presentes (ponto veio do backend);
// extrai switchPort do swPort 'Gi1/0/N' quando necessário.
export function pointToDTO(p: Point): Partial<ConnectionPointDTO> {
  const switchPort =
    p.switchPort ?? (parseInt(String(p.swPort).replace(/\D/g, ''), 10) || 0);
  // '—' (sem dispositivo) não é um deviceType válido no backend → 'Outro'.
  const deviceType = !p.device || p.device === '—' ? 'Outro' : String(p.device);
  const body: Partial<ConnectionPointDTO> = {
    identifier: p.identifier ?? p.point ?? `P-${p.id}`,
    port: p.patchPort,
    switchPort,
    deviceType,
    deviceName: p.deviceName ?? '',
    macAddress: p.macAddress ?? '',
    ipAddress: p.ipAddress ?? null,
    status: p.status,
    notes: p.obs ?? '',
  };
  if (p.serverId) body.id = p.serverId;
  if (p.sectorId) body.sectorId = p.sectorId;
  if (p.patchPanelId) body.patchPanelId = p.patchPanelId;
  if (p.switchId) body.switchId = p.switchId;
  body.vlanId = p.vlanRef ?? null;
  return body;
}
