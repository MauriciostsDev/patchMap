# Docker e Execução

## Serviços (docker-compose.yml)

| Serviço   | Estado | Porta(s) | Descrição |
|-----------|--------|----------|-----------|
| `frontend`| ✅     | 8081 (Metro), 19000/19006 (Expo) | Expo dev server. Web em `http://localhost:19006`. |
| `backend` | ✅     | 8000     | Django + DRF ([[API Backend]]). API em `http://localhost:8000/`, admin em `/admin/`. |
| `db`      | ✅     | 5432     | PostgreSQL 16 (volume `postgres-data`, healthcheck). |

## Rodar o frontend (mock)

**Via Docker (web no navegador):**
```bash
docker compose up frontend
# abrir http://localhost:19006
```

**Local sem Docker (recomendado p/ celular físico via Expo Go):**
```bash
cd frontend
npm install
npm run web      # navegador
# ou
npm start        # QR code → app Expo Go no celular
```

## Caveats de Docker + React Native

- Docker é ótimo para o **build web** (react-native-web) e para o bundler Metro, mas **não** consegue
  falar com um device físico por USB nem subir emulador Android/iOS de dentro do container.
- Para testar em **celular físico**, rode o Expo **no host** (`npm start`) e use o app **Expo Go** — o
  container serve principalmente como ambiente reprodutível e para a versão web.
- `REACT_NATIVE_PACKAGER_HOSTNAME` pode precisar ser ajustado conforme a rede.

## Rodar o backend (Django + DRF)

```bash
docker compose up --build backend db
# API:   http://localhost:8000/
# Admin: http://localhost:8000/admin/  (admin@patchmap.com / 123456)
```

O `backend/entrypoint.sh` espera o Postgres ficar saudável, aplica as migrations,
roda o seed (idempotente) e cria o superusuário antes de subir o servidor.
Subir tudo de uma vez: `docker compose up --build`. Detalhes em [[API Backend]]
e em `backend/README.md`.

## Próximos passos de infra

Conectar o frontend ao backend: definir `EXPO_PUBLIC_API_URL` apontando para o
serviço `backend` e trocar o store mock pela camada de API (Fase 3).
