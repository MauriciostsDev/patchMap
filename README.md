# PatchMap 🗺️

**Rastreador de Conexões de Rede** — App mobile para equipes de TI gerenciarem conexões de cabos (patch panels, switches, dispositivos) em tempo real, no campo.

## 🧭 Navegação do Projeto

**Você é uma IA tocando este projeto pela primeira vez?**  
👉 Leia **[`docs/00 - Índice.md`](docs/00%20-%20Índice.md)** — a vault Obsidian tem todo o contexto: arquitetura, decisões, contratos de dados, roadmap.

## 🚀 Status Atual

- ✅ **Fase 1 — Mock do Frontend (concluída)**
  - React Native (Expo) + TypeScript
  - 6 telas funcionais (Login, Lista, Detalhe, Formulário, VLANs, Painel, Ajustes)
  - Store Zustand + persistência AsyncStorage
  - Tema claro/escuro + 4 cores de acento + densidade ajustável
  - 34 conexões seed (10 setores, 7 patch panels, 5 switches)
  - **100% funcional offline**

- ✅ **Fase 2 — Backend Django + PostgreSQL (concluída)**
  - API REST com Django REST Framework (campos camelCase, mesmo contrato do frontend)
  - Autenticação JWT (login + refresh)
  - CRUD completo de conexões + recursos de topologia (read-only)
  - Seed idempotente (port do `seed.ts`) e admin do Django
  - Ver [`backend/README.md`](backend/README.md)

- ✅ **Fase 3 — Integração frontend ↔ backend (MVP concluído)**
  - Login real via `/auth/login` (JWT + refresh + restauração de sessão)
  - Camada `src/api/` + mapper DTO normalizado ↔ `Point` plano
  - Store carrega topologia + 34 pontos do backend; CRUD sincroniza
  - Fila offline (`dirty` + `pendingDeletes`) + indicador de sync na UI
  - Frontend migrado p/ **Expo SDK 53 (RN 0.79)** — dev build alinhado a 16 KB
  - Detalhes: [`docs/Integração Frontend-Backend.md`](docs/Integra%C3%A7%C3%A3o%20Frontend-Backend.md)

## 🛠️ Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React Native (Expo SDK 53 / RN 0.79) + TypeScript |
| **Estado** | Zustand + AsyncStorage |
| **Navegação** | React Navigation (Stack + Bottom Tabs) |
| **Backend** | Django 5.1 + DRF + JWT |
| **Banco** | PostgreSQL 16 |
| **Infra** | Docker + docker-compose |

## 📦 Executar o Projeto

👉 **Guia completo e atualizado:** [`EXECUTAR.md`](EXECUTAR.md)

Resumo:

```powershell
# Backend (Django + DRF + JWT, SQLite por padrão)
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_data
.\.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000

# Frontend (Expo SDK 53 — development build, NÃO Expo Go)
cd frontend
npm install
npx expo run:android   # com o emulador aberto
```

- **API:** http://localhost:8000/ · **Admin:** http://localhost:8000/admin/
- **App:** abre no emulador; login **`admin@patchmap.com` / `123456`**

> ⚠️ O emulador (Android 15+) usa páginas de **16 KB**; o **Expo Go não é
> compatível**. Use o **dev build** (`npx expo run:android`). Detalhes em
> [`EXECUTAR.md`](EXECUTAR.md).

### Credenciais
- **App e Admin (JWT):** `admin@patchmap.com` / `123456` — autenticação real.

## 📂 Estrutura

```
patchmap/
├── docs/                    # 🧠 Vault Obsidian (contexto para IAs)
│   ├── 00 - Índice.md       # ← COMECE AQUI
│   ├── Visão Geral.md
│   ├── Modelo de Dados.md
│   ├── Arquitetura Frontend.md
│   ├── Telas.md
│   ├── Design Tokens.md
│   ├── API Backend.md
│   ├── Docker e Execução.md
│   ├── Roadmap.md
│   └── decisoes/            # ADRs (Architecture Decision Records)
│
├── frontend/                # React Native (Expo)
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── data/            # Seed de dados
│   │   ├── navigation/      # Stack + Tabs
│   │   ├── screens/         # 6 telas
│   │   ├── store/           # Zustand
│   │   ├── theme/           # Design tokens
│   │   └── types.ts         # TypeScript types
│   ├── App.tsx
│   ├── package.json
│   └── Dockerfile
│
├── backend/                 # Django + DRF
│   ├── config/              # projeto (settings, urls, wsgi)
│   ├── network/             # app: models, serializers, views, seed_data
│   ├── Dockerfile · entrypoint.sh · requirements.txt
│   └── README.md
├── docker-compose.yml
└── README.md
```

## 🎨 Features

### Telas
1. **Login** — Autenticação real via `/auth/login` (JWT)
2. **Lista de Conexões** — Busca, filtros por status, agrupamento por setor
3. **Detalhe** — Rota completa (Setor → Patch Panel → Switch → VLAN)
4. **Formulário** — Criar/editar conexões
5. **VLANs** — Lista de redes virtuais
6. **Painel** — Cards de métricas (total, ativas, inativas, problemas)
7. **Ajustes** — Tema, cor de acento, densidade, logout

### Temas
- **Modos:** Claro / Escuro
- **Accent:** Azul, Verde, Roxo, Laranja
- **Densidade:** Confortável / Compacta

### Dados (seed)
- 10 setores (3 prédios)
- 7 patch panels (157 portas)
- 5 switches (136 portas)
- 6 VLANs
- 34 conexões ativas

## 🧪 Próximos Passos

1. **Pickers do Formulário** — repointar setor/VLAN para a topologia viva (hoje usam o seed)
2. **Surfacing de campos ricos** — `building`/`floor`/`MAC`/`IP` nas telas de detalhe
3. **Conectividade** — NetInfo p/ disparar `syncPending` ao reconectar
4. **Busca avançada** — Filtros por prédio, VLAN, tipo de dispositivo
5. **Histórico** — Auditoria de alterações

Contrato e detalhes da API: [`docs/API Backend.md`](docs/API%20Backend.md) e [`backend/README.md`](backend/README.md).

## 📖 Documentação

Toda a documentação vive na **vault Obsidian** (`docs/`). Se você é uma IA tocando o projeto:

1. Leia [`docs/00 - Índice.md`](docs/00%20-%20Índice.md)
2. Consulte a nota relevante para sua tarefa
3. **Atualize as notas** quando tomar decisões ou mudar contratos
4. Use links `[[nota]]` para conectar informações

## 📄 Licença

MIT
