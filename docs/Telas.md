# Telas

6 telas: **Login** + **Pontos**, **Detalhe**, **Formulário**, **VLANs**, **Painel** (estas 5 já logado).
Referência visual definitiva: `Rastreador Conexões Setores/Rastreador de Conexões.html`
e os screenshots em `Rastreador Conexões Setores/screenshots/`.

> ⚠️ A tela de **Ajustes** do protótipo (TweaksPanel) **não existe no app atual**. `accent`/`dark`/`density`
> vivem no store mas não têm UI nem botão de logout — ver [[Arquitetura Frontend#Diferenças intencionais vs. protótipo web]].

## Login (`LoginScreen`)
Logo 88×88, "PatchMap", subtítulo "Rastreador de Conexões de Rede". Campos e-mail
(`usuario@orgao.gov.br`) + senha (com olho mostrar/ocultar) e link "Esqueci a senha". Validação: campos
não vazios. MVP aceita qualquer credencial (delay simulado de 1.1s → `login()`). Rodapé
"PatchMap v1.0 · Gestão de Rede Interna". Produção → `POST /auth/login` ([[API Backend]]).

## Pontos (`ConnectionsListScreen`)
Aba inicial. Header sticky com logo + título "PatchMap / Rastreador de Conexões" e botão de **agrupar por
setor** (ícone lista ↔ prédio). Quatro **StatPills** clicáveis que filtram por status
(Total / Ativos / Problema / Livres — "Livres" = `inativo`). Busca (id, setor, ponto, dispositivo, switch,
swPort, `pp painel porta`, vlan). **Chips de setor** horizontais ("Todos os setores" + um por setor com
contador + "Sem setor"). Lista de **PointRow** (badge `PP{painel}` + nº porta com bolinha de status,
setor/dispositivo, `PP A·15 → CORE Gi1/0/15`, VlanTag, status). No modo agrupado, cada grupo tem cabeçalho
do setor + VlanTag. A **FAB "+"** (em `MainTabs`) abre o formulário. A densidade (`compact`/`regular`/`comfy`)
vem do store (atualmente fixa em `regular`, sem UI).

## Detalhe (`ConnectionDetailScreen`)
Top bar com voltar / título "Ponto de conexão" / **editar** (lápis → Form). Hero com badge grande do ID +
setor + etiqueta da tomada + StatusBadge. Botão **"Mudar status"** abre bottom sheet (Ativo/Inativo/Problema).
**TracePath**: timeline vertical de 4 nós (Tomada → Patch Panel → Switch → VLAN). Cards de info (dispositivo,
VLAN, patch/switch, atualizado) + observações. Botão **excluir ponto** (vermelho, volta para a lista).

## Formulário (`ConnectionFormScreen`) — criar/editar
Top bar com ✕ / título ("Novo ponto" ou "Editar ponto NN") / **Salvar**. Seções: Setor (chips + campo
"novo setor" → auto-preenche VLAN), etiqueta da tomada, dispositivo (chips, "—" = Nenhum), Patch Panel
(segmented com os painéis existentes) + Porta (numérico, **obrigatório > 0** — único campo validado),
Switch + porta switch (auto `Gi1/0/{porta}` se vazia), VLAN (chips, inclui "Sem VLAN"), Status (segmented
colorido com dot), observações. Ao salvar faz `savePoint` e navega para o Detalhe.
Lógica em [[Modelo de Dados#Regras de negócio]].

## VLANs (`VLANsScreen`)
Cabeçalho "VLANs · N pontos configurados". Accordion triplo: **VLAN → Setor → Pontos**. Cada VLAN é um card
com ícone colorido (cor por VLAN), VLAN id + nome, badge de problemas e **MiniBar** (proporção
ativo/problema). Expandir mostra os setores daquela VLAN; expandir um setor mostra os PointRows. Card cinza
"Sem VLAN" no fim (pontos com setor mas sem segmentação).

## Painel (`PanelScreen`)
Cabeçalho com nome do painel atual + "X/Y portas em uso · Switch CORE". Seletor horizontal de painéis +
chip **"+ Novo"** (bottom sheet: identificador até 4 chars uppercase com sugestão da próxima letra, portas
16/24/32/48, switch). Segmented "Por setor" | "Por status". **Rack visual** (card escuro `#1e293b`, cabeçalho
`PATCH PANEL X · NP`): grid de 8 colunas, cada porta com 4 pinos RJ45, número mono, ponto de status no canto,
cor pela borda (setor ou status), fundo preenchido se ocupada. Tocar numa porta → Detalhe. Legenda embaixo
(setores ou status + "Livre").
