# Modelo de Dados

> **Contrato compartilhado.** Estes tipos são a fronteira entre [[Arquitetura Frontend|frontend]] e
> [[API Backend|backend]]. Mudou aqui? Atualize os dois lados e esta nota. O código vive em
> `frontend/src/types.ts` e `frontend/src/data/seed.ts`.

## Entidades

> Nomes neste doc (conceituais / backend) ↔ tipos do frontend (`types.ts`):
> `ConnectionPoint` = **`Point`**, `VLAN` = **`Vlan`**, `PatchPanel` = **`PanelDef`**, `Sector` = `Sector`.

```typescript
type ConnectionStatus = 'ativo' | 'inativo' | 'problema';
type DeviceType =
  | 'Desktop' | 'Notebook' | 'Telefone IP' | 'Impressora'
  | 'Access Point' | 'Câmera IP' | '—';

interface ConnectionPoint {
  id: number;               // ID único (= porta do patch panel no MVP)
  sector: string | null;    // Nome do setor, null = não atribuído
  patchPanel: string;       // ID do patch panel, ex: "A"
  patchPort: number;        // Número da porta no patch panel (1..N)
  sw: string;               // Nome do switch, ex: "CORE"
  swPort: string;           // Porta do switch, ex: "Gi1/0/15"
  vlan: number | null;      // ID da VLAN, null = sem VLAN
  vlanName: string | null;  // Nome da VLAN
  device: DeviceType | string;  // Tipo de dispositivo (aceita valor livre)
  status: ConnectionStatus;
  point: string | null;     // Etiqueta da tomada, ex: "GAB-03"
  obs: string;              // Observações livres
  updatedAt: string;        // ISO date "YYYY-MM-DD"
}

interface VLAN   { id: number; name: string; }
interface Sector { name: string; vlan: number; vlanName: string; }
interface PatchPanel { id: string; label: string; ports: number; sw: string; }
```

## Seed

Dados de demonstração pré-carregados (de uma planilha real). Patch Panel **A**, 32 portas, switch **CORE**.

| Portas | Setor         | VLAN | Status padrão |
|--------|---------------|------|---------------|
| 8–11   | GSAD          | 20   | ativo (10 = problema) |
| 13–17  | GAB           | 10   | ativo (16 = problema) |
| 18–21  | GAB Recepção  | 11   | ativo |
| 25     | Secretaria    | 30   | ativo |
| resto  | — (livre)     | —    | inativo |

**VLANs:** 10 Gabinete · 11 Recepção · 20 Administrativo · 30 Secretaria · 99 Convidados.

A etiqueta da tomada (`point`) é gerada por setor: `GAB-01`, `GAB-02`, `GSA-01`… (prefixo = 3 primeiras
letras do setor, contador por setor).

## Regras de negócio

- **Selecionar setor preenche VLAN automaticamente** (via tabela `Sector → vlan/vlanName`).
- **`swPort` auto:** se vazio ao salvar, vira `Gi1/0/{patchPort}`.
- **Validação de porta:** `patchPort` deve ser inteiro `> 0`. É o único campo obrigatório do formulário.
- **`id` no MVP = `patchPort`** ao criar (offline). Ao editar, o `id` é imutável.
- **Criar painel** gera `ports` novos `ConnectionPoint` vazios (`id` continuando do maior existente,
  `patchPort` 1..N, status `inativo`, sem setor/vlan).
- **Cores derivadas** (não persistidas): cor do setor e cor da VLAN são lookups fixos — ver [[Design Tokens#Cores de domínio]].

## Persistência local (AsyncStorage)

O `persist` do Zustand grava **todo o store numa única chave**:

```
patchmap.store.v1   { isLoggedIn, points, panels, accent, dark, density }
```

(Não há campo `font`.) O store inteiro — auth, dados e tweaks de tema — é serializado junto.

> ⚠️ No protótipo original as chaves usavam o prefixo `rastreador.*` (uma por assunto). No app RN foi
> padronizada **uma única chave** `patchmap.store.v1` (alinhado ao [[API Backend]] e ao `IMPLEMENTACAO_FRONTEND.md`).
