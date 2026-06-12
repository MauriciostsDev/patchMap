# API Backend (Django) — Fase 2 ✅

> **Status:** implementado e integrado (Fase 3). 📦 O código do backend Django +
> DRF foi migrado para o repositório próprio
> **[patchMapApi](https://github.com/MauriciostsDev/patchMapApi)** (rode a API de
> lá). Este documento descreve o **contrato** REST consumido pelo frontend —
> ver [[Integração Frontend-Backend]]. Como rodar: [[../EXECUTAR|EXECUTAR.md]].

## Stack

- **Django 5.1 + Django REST Framework 3.15**
- **PostgreSQL 16** (container `db`)
- Auth via **JWT** (`djangorestframework-simplejwt`)
- **django-cors-headers** (libera o Expo web/Metro em dev)
- Tudo dockerizado (ver [[Docker e Execução]])

## Convenções de contrato (importante)

O backend casa 1:1 com `frontend/src/types.ts`:

- **IDs são strings** (`s1`, `pp1`, `c1`, ...). As PKs no Postgres são
  `CharField`, não serial — isso mantém o sync e a migração do seed triviais.
  Em `POST /points` sem `id`, o backend gera `c<n>` automaticamente.
- **Campos em camelCase** na API (`sectorId`, `patchPanelId`, `switchPort`,
  `lastUpdate`, ...), mesmo que os modelos usem snake_case (mapeado via `source=`).
- **Datas** trafegam como `YYYY-MM-DD` (`lastUpdate`). Se omitido no POST, assume hoje.
- `ipAddress`/`vlanId` aceitam `null`/`""` (string vazia vira `null`).

## Endpoints

```
POST   /auth/login        { email, password } → { token, refresh, user }
POST   /auth/refresh      { refresh }          → { access }

GET    /points/           → ConnectionPoint[]        (CRUD completo)
GET    /points/:id/       → ConnectionPoint
POST   /points/           → ConnectionPoint (criado; id opcional)
PUT    /points/:id/       → ConnectionPoint (atualizado)
PATCH  /points/:id/       → ConnectionPoint (parcial)
DELETE /points/:id/       → 204

GET    /panels/           → PatchPanel[]             (CRUD completo)
POST   /panels/           · DELETE /panels/:id/

GET    /sectors/          → Sector[]                 (read-only)
GET    /switches/         → Switch[]                 (read-only)
GET    /vlans/            → VLAN[]                    (read-only)
```

> **Permissões:** leitura é pública; escrita exige JWT (`IsAuthenticatedOrReadOnly`).
> O router do DRF usa barra final (`/points/`). O admin do Django fica em `/admin/`.

## Modelos (`network/models.py` no [patchMapApi](https://github.com/MauriciostsDev/patchMapApi))

`Sector` · `PatchPanel` · `Switch` · `VLAN` · `ConnectionPoint` — espelham o TS.
Campos `?` viram `null=True/blank=True`. FKs: `ConnectionPoint → Sector/PatchPanel/
Switch` (PROTECT) e `→ VLAN` (SET_NULL, opcional).

## Seed

`python manage.py seed_data` popula com os **dados reais (SETHAS)**: 26 setores,
6 patch panels (A–F), 6 switches, 0 VLANs e **209 conexões** — ver [[Seed de Dados]].
Idempotente e destrutivo p/ os dados (limpa e recria a cada execução); cria também
o superusuário `admin@patchmap.com` / `123456`. Rodado no boot pelo `entrypoint.sh`
(Docker) ou manualmente.

## Sincronização offline (ainda planejada)

- Cada registro tem `lastUpdate` → resolução de conflito *last-write-wins* no MVP.
- Frontend manteria fila de operações pendentes e daria flush quando online.
- Quando o sync for implementado, registrar a estratégia em nova nota `decisoes/`.

## Como rodar

No repo do backend [patchMapApi](https://github.com/MauriciostsDev/patchMapApi)
(tem `docker-compose.yml` próprio):

```bash
git clone https://github.com/MauriciostsDev/patchMapApi.git
cd patchMapApi
docker compose up --build
# API:    http://localhost:8000/
# Admin:  http://localhost:8000/admin/  (admin@patchmap.com / 123456)
```

Guia completo (backend + frontend): [[../EXECUTAR|EXECUTAR.md]].
