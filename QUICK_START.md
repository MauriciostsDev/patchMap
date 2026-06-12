# 🚀 Quick Start — PatchMap

> Guia completo e atualizado: **[`EXECUTAR.md`](EXECUTAR.md)**. Este é o resumo.

O projeto são **dois repositórios** (clone os dois lado a lado):
- **`patchMap`** (este) — frontend Expo + documentação
- **[`patchMapApi`](https://github.com/MauriciostsDev/patchMapApi)** — backend Django

## 1. Backend (API + banco)

```bash
git clone https://github.com/MauriciostsDev/patchMapApi.git
cd patchMapApi
docker compose up --build          # backend + Postgres
# ou local: python -m venv .venv && pip install -r requirements.txt
#           && python manage.py migrate && python manage.py seed_data
#           && python manage.py runserver 0.0.0.0:8000
```

- **API:** http://localhost:8000/ · **Admin:** http://localhost:8000/admin/
- Login: `admin@patchmap.com` / `123456` (autenticação real via JWT)

## 2. Frontend (app no emulador)

```bash
cd frontend
npm install
npx expo run:android      # development build (NÃO Expo Go), emulador aberto
```

> ⚠️ O emulador (Android 15+) usa páginas de **16 KB** — o **Expo Go não é
> compatível**. Por isso o **dev build**. Detalhes/troubleshooting em
> [`EXECUTAR.md`](EXECUTAR.md).

No app, faça login com `admin@patchmap.com` / `123456` → lista carrega os
**34 pontos reais** do backend.

## 3. Contexto para IAs

👉 Leia **[`docs/00 - Índice.md`](docs/00%20-%20Índice.md)** — a vault Obsidian
tem todo o contexto (arquitetura, decisões, contrato de dados, roadmap).

## Estrutura

```
patchMap/                     # este repo
├── docs/                     # 🧠 Vault Obsidian (contexto)
├── frontend/                 # React Native (Expo SDK 53) ✅
├── EXECUTAR.md · docker-compose.yml (só frontend) · README.md

patchMapApi/                  # repo do backend (Django + DRF + JWT) ✅
```
