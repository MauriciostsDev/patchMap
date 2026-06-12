# Docker e Execução

> 📦 **Backend migrado:** o `docker-compose.yml` deste repo agora sobe **só o
> frontend**. O backend Django + Postgres vivem no repo
> [patchMapApi](https://github.com/MauriciostsDev/patchMapApi). Guia atual de
> execução: [[../EXECUTAR|EXECUTAR.md]].

## Serviços (docker-compose.yml)

| Serviço   | Estado | Porta(s) | Descrição |
|-----------|--------|----------|-----------|
| `frontend`| ✅     | 8081 (Metro), 19000/19006 (Expo) | Expo dev server. Web em `http://localhost:19006`. |
| `backend` | ➡️ movido | 8000  | Django + DRF — agora no repo [patchMapApi](https://github.com/MauriciostsDev/patchMapApi) ([[API Backend]] = contrato). |
| `db`      | ➡️ movido | 5432  | PostgreSQL — junto do backend no [patchMapApi](https://github.com/MauriciostsDev/patchMapApi). |

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

## Rodar o backend (Django + DRF) — repo [patchMapApi](https://github.com/MauriciostsDev/patchMapApi)

O backend saiu deste monorepo. No repo próprio ele tem `docker-compose.yml`
(backend + Postgres):

```bash
git clone https://github.com/MauriciostsDev/patchMapApi.git
cd patchMapApi
docker compose up --build
# API:   http://localhost:8000/
# Admin: http://localhost:8000/admin/  (admin@patchmap.com / 123456)
```

O `entrypoint.sh` espera o Postgres, aplica migrations, roda o seed (idempotente)
e cria o superusuário antes de subir o servidor. Guia completo de execução
(backend + frontend): [[../EXECUTAR|EXECUTAR.md]].

## Conexão frontend ↔ backend (Fase 3 ✅)

Feita: o app aponta para `http://10.0.2.2:8000` no emulador (override por
`EXPO_PUBLIC_API_URL` / `expo.extra.apiUrl`). Ver [[Integração Frontend-Backend]].
