# Setores e VLANs

Como funcionam os **setores editáveis** (nome + cor) e as **VLANs como grupos de
setores**. Decisão tomada com o usuário: **cada setor pertence a no máximo uma
VLAN** (FK), e a **edição do setor acontece em modais** (a aba VLANs cuida só dos
grupos).

## Modelo (backend [patchMapApi](https://github.com/MauriciostsDev/patchMapApi))

- `Sector.color` (hex, ex.: `#6366f1`) — cor própria, editável.
- `Sector.vlan` → FK para `VLAN` (`null` = sem grupo). A **VLAN é o grupo** de
  setores (`VLAN.sectors` = reverse FK). Migration `0003`.
- API gravável: `PATCH /sectors/:id` (nome/cor/`vlanId`); `POST/PATCH/DELETE
  /vlans/`. O `VLANSerializer` aceita/retorna **`sectorIds`** (composição do
  grupo) e gera `id` `v<n>` no POST.
- Seed atribui **cores distintas** (paleta HSL) aos 26 setores; VLANs começam
  vazias (o usuário cria e agrupa no app).

## Frontend

**Cores por setor.** A store carrega `sectors` (com `color`/`vlanId`) e expõe
`sectorColorOf(name)` → cor própria do backend, com fallback estável
`hashColor(name)` (offline). Usado no **Painel** (portas e legenda), nas **linhas
da lista** (ponto colorido) e nos **cabeçalhos de setor agrupado**. Isso corrige
o "tudo azul".

**Editar setor** (`components/SectorEditModal.tsx`). Abre ao **tocar num setor**:
- na **legenda do Painel**,
- nos **cabeçalhos de setor** (lista agrupada),
- nos chips de **"Setores sem VLAN"** (aba VLANs).
Edita **nome + cor** (paleta) → `store.updateSector` → `PATCH /sectors/:id`.

**Aba VLANs** (`screens/VLANsScreen.tsx`) — agora é o gerenciador de grupos:
- Lista cada VLAN com seus **setores (chips coloridos)** e contagem de pontos.
- **+ Nova VLAN** e tocar numa VLAN abrem `components/VlanEditModal.tsx`:
  número + nome + **seleção de setores** (multi-select), além de **excluir**.
- Seção **"Setores sem VLAN"** lista os não agrupados.

Sincronização: `createVlan`/`updateVlan`/`deleteVlan`/`updateSector` na store
(otimista + chamada à API). Ver [[Integração Frontend-Backend]].

## Estado / o que verificar (contexto p/ continuar)

- ✅ Backend: modelo + API + seed com cores — **validado via API** (criar VLAN com
  `sectorIds`, PATCH de cor/nome, DELETE).
- ✅ `tsc --noEmit` limpo em todo o frontend.
- ✅ **Lista** com cores distintas por setor — confirmado no emulador.
- ⏳ **Falta confirmar visualmente no emulador**: a **aba VLANs** (criar VLAN +
  agrupar setores), o **modal de edição de setor** (nome/cor) e as **cores no
  Painel** após o reseed. O código está type-checado; faltou só o screenshot
  dessas telas (a navegação por tap no emulador estava difícil de automatizar).
- 🔜 Possíveis melhorias: refletir a VLAN do setor no campo `vlan` da conexão
  (hoje independentes); cor da VLAN; permitir um setor em várias VLANs (M2M).

Relacionado: [[Seed de Dados]], [[Modelo de Dados]], [[API Backend]],
[[Integração Frontend-Backend]].
