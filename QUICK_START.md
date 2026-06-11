# 🚀 Quick Start — PatchMap

## 1. Rodar o frontend (web + Metro)

```bash
docker-compose up frontend
```

Acesse **http://localhost:19006** no navegador.

Login (mock — aceita qualquer credencial):
- E-mail: `admin@patchmap.com`
- Senha: `123456`

## 2. Testar no celular (Expo Go)

1. Instale o **Expo Go** no celular (iOS / Android)
2. Certifique-se que celular e PC estão na **mesma rede Wi-Fi**
3. Acesse **http://localhost:19000** no navegador do PC
4. Escaneie o QR code com o Expo Go

## 3. Rodar o backend (API + Postgres)

```bash
docker compose up --build backend db
```

- **API:** http://localhost:8000/
- **Admin Django:** http://localhost:8000/admin/ — `admin@patchmap.com` / `123456`

O entrypoint aplica migrations e roda o seed automaticamente. Contrato da API em
[`docs/API Backend.md`](docs/API%20Backend.md) e [`backend/README.md`](backend/README.md).

Subir frontend + backend + banco de uma vez: `docker compose up --build`.

## 4. Contexto para IAs

Se você é uma IA tocando o projeto:  
👉 Leia **[`docs/00 - Índice.md`](docs/00%20-%20Índice.md)** — a vault Obsidian tem todo o contexto.

## Estrutura

```
patchmap/
├── docs/                      # 🧠 Vault Obsidian (contexto)
├── frontend/                  # React Native (Expo) ✅
├── backend/                   # Django + DRF + JWT ✅
├── docker-compose.yml
└── README.md
```

## Comandos úteis

```bash
# Parar containers
docker-compose down

# Rebuild (após mudar Dockerfile)
docker-compose up --build frontend

# Ver logs
docker-compose logs -f frontend

# Rodar fora do Docker (local)
cd frontend && npm start
```
