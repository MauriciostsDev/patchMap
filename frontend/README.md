# PatchMap — Frontend (Expo)

React Native app para rastreamento de conexões de rede.

## Executar

### No Docker (web + Metro)
```bash
# Na raiz do projeto
docker-compose up frontend
```

Acesse:
- **Web:** http://localhost:19006
- **Metro (para device):** http://localhost:19000

### No host (desenvolvimento local)
```bash
cd frontend
npm install
npm start
```

Depois abra o app **Expo Go** no celular e escaneie o QR code.

## Login (mock)

Aceita **qualquer** e-mail e senha (ex: `admin@patchmap.com` / `123456`).

## Telas

1. **Login** — Autenticação (mock)
2. **Pontos** — Lista de pontos com busca, filtros de status e chips de setor
3. **Detalhe** — Rota física completa (Tomada → Patch Panel → Switch → VLAN)
4. **Formulário** — Criar/editar ponto
5. **VLANs** — Accordion VLAN → Setor → Pontos
6. **Painel** — Rack visual do patch panel (portas por setor/status)

> A tela de **Ajustes** (tema/accent/densidade/logout) do protótipo ainda não foi portada — esses
> valores existem no store mas sem UI.

## Dados

Seed de exemplo: **32 pontos** no Patch Panel **A** (32 portas, switch **CORE**), **4 setores**
(GSAD, GAB, GAB Recepção, Secretaria) e **5 VLANs** (10, 11, 20, 30, 99).  
Fonte: [`src/data/seed.ts`](src/data/seed.ts)
