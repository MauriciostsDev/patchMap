# PatchMap 🗺️

**Rastreador de Conexões de Rede** — app mobile (Android) para equipes de TI
rastrearem conexões de cabos (patch panels, switches, dispositivos) em campo,
pelo celular. Substitui a planilha física do patch panel.

```
Tomada (GAB-03) → Patch Panel A, Porta 15 → Switch CORE, Gi1/0/15 → VLAN 10
```

> 🧠 **Contexto completo num só arquivo:** [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md).
> Se você é uma IA tocando o projeto, **leia esse arquivo** — ele consolida tudo
> (arquitetura, modelo de dados, API, design, deploy). A pasta `docs/` é histórica.

---

## Status: pronto para deploy ✅

- **Frontend** (Expo / React Native) — 6 telas, design escuro "console técnico",
  login real (JWT), CRUD sincronizado com o backend + fila offline.
- **Backend** (Django + DRF) — auth JWT, CRUD, seed com dados reais (SETHAS),
  **testado** (smoke test de todos os endpoints). Repo próprio:
  [`patchMapApi`](https://github.com/MauriciostsDev/patchMapApi).

São **dois repositórios** (clone lado a lado): `patchMap` (este — frontend + docs)
e `patchMapApi` (backend).

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native + Expo SDK 53 (RN 0.79, React 19) + TypeScript |
| Estado | Zustand + AsyncStorage (offline-first) |
| Backend | Django 5.1 + DRF + JWT + WhiteNoise |
| Banco | PostgreSQL 16 (prod) / SQLite (dev) |
| Servidor | Gunicorn (prod) · Docker Compose |

---

## Rodar em desenvolvimento

**1. Backend** (no repo `patchMapApi`):
```bash
git clone https://github.com/MauriciostsDev/patchMapApi.git && cd patchMapApi
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
# API: http://localhost:8000/  ·  Admin: http://localhost:8000/admin/
# Login: admin@patchmap.com / 123456
```

**2. Frontend** (neste repo):
```bash
cd frontend
npm install
npx expo run:android        # dev build (NÃO Expo Go), com o emulador aberto
```

> ⚠️ O emulador Android 15+ usa páginas de **16 KB** → **Expo Go não funciona**.
> Use o dev build (`npx expo run:android`).

---

## Deploy

| Alvo | Guia | Resumo |
|------|------|--------|
| **Backend → VM** | [`patchMapApi/DEPLOY.md`](https://github.com/MauriciostsDev/patchMapApi) | `cp .env.example .env` + `docker compose up -d --build` |
| **Frontend → Play Store** | [`frontend/DEPLOY.md`](frontend/DEPLOY.md) | editar `app.json → extra.apiUrl`, `expo prebuild`, `./gradlew bundleRelease` (.aab) ou `assembleRelease` (APK) |

O **único campo** que muda no deploy do app é `expo.extra.apiUrl` (a URL da API).

---

## Design

Estética **"console técnico" escura**: fundo quase-preto, acento teal neon,
números em fonte monoespaçada, e a linguagem visual do rack (tela Painel) levada
para o app todo. Tema em `frontend/src/theme/tokens.ts`. Detalhes em
[`PROJECT_CONTEXT.md` §6](PROJECT_CONTEXT.md).

---

## Estrutura

```
patchMap/                  # este repo (frontend + docs)
├── PROJECT_CONTEXT.md     # ← contexto canônico (leia primeiro)
├── frontend/              # React Native (Expo) + DEPLOY.md
├── docs/                  # vault Obsidian (histórico)
├── docker-compose.yml     # só o frontend (web/Metro em dev)
└── README.md

patchMapApi/               # repo do backend (Django + DRF + JWT) + DEPLOY.md
```

## Credenciais (seed)
- App + Admin: `admin@patchmap.com` / `123456` (configurável via `.env` do backend).

## Licença
MIT
