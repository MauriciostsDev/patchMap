# PROJECT_CONTEXT — PatchMap

> **Leia só este arquivo.** Ele consolida todo o contexto do projeto (antes
> espalhado na vault Obsidian em `docs/`). Se você é uma IA tocando o PatchMap
> pela primeira vez, este documento é a fonte de verdade. Atualize-o quando mudar
> contratos, arquitetura ou decisões.
>
> Última consolidação: 2026-06-13.

---

## 1. O que é

**PatchMap** é um app mobile (Android) para equipes de TI rastrearem conexões de
cabos de rede em ambientes corporativos/órgãos públicos. Substitui a planilha
física de *patch panel*: o técnico consulta **em campo, pelo celular**, a rota
completa de um ponto de rede:

```
Tomada da parede (ex: GAB-03)  →  Patch Panel A, Porta 15  →  Switch CORE, Gi1/0/15  →  VLAN 10
```

**Princípios:** offline-first (dados no device via AsyncStorage, sincronizados
com o backend); rápido em campo (busca, filtros, chips de setor); visual fiel ao
hardware (a tela Painel desenha o rack como ele é).

### Repositórios
- **Frontend + docs (este repo):** `patchMap` — React Native (Expo).
- **Backend:** `patchMapApi` — Django + DRF. Repo próprio:
  https://github.com/MauriciostsDev/patchMapApi (clonado localmente em
  `c:\Users\mauri\pathMapApi` — note a grafia antiga da pasta `pathMapApi`).
- O backend foi extraído do monorepo para deploy independente. Os dois repos
  ficam lado a lado no desenvolvimento.

---

## 2. Estado atual (junho/2026)

- ✅ **Frontend** completo: 6 telas, store Zustand + persistência, navegação,
  integração com a API (login real, CRUD sincronizado, fila offline).
- ✅ **Backend** completo e **testado** (smoke test de todos os endpoints): auth
  JWT + refresh, CRUD de pontos, VLAN como grupo de setores, cor de setor
  editável, seed com dados reais.
- ✅ **Design** refeito para uma estética **"console técnico" escura** (ver §6).
- ✅ **Deploy** preparado: backend via Docker Compose (Gunicorn), frontend via
  Gradle local (APK + .aab). Ver §9.

### Pronto para deploy
- **Backend → VM:** `patchMapApi/DEPLOY.md` (Docker Compose). Só editar `.env`.
- **Frontend → Play Store:** `frontend/DEPLOY.md` (APK e .aab). Só editar
  `app.json → expo.extra.apiUrl` com a URL da API.

---

## 3. Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native + Expo **SDK 53** (RN 0.79, React 19), TypeScript |
| Estado | Zustand + persist (AsyncStorage), chave `patchmap.store.v2` |
| Navegação | React Navigation v6 (Native Stack; bottom-nav é próprio, `MainTabs`) |
| Ícones | `react-native-svg` (primitivos `Svg/Path/...`, paths em `ICON_PATHS`) |
| Fontes | Plus Jakarta Sans (texto) + IBM Plex Mono (IDs/portas/valores técnicos) |
| Backend | Django 5.1 + DRF 3.15 + JWT (simplejwt) + CORS + WhiteNoise |
| Banco | PostgreSQL 16 (produção) / SQLite (dev sem Docker) |
| Servidor | Gunicorn (produção), runserver (dev) |
| Infra | Docker + docker-compose |

> ⚠️ O emulador Android 15+ usa páginas de **16 KB** → **Expo Go não funciona**.
> Use **dev build**: `npx expo run:android`.

---

## 4. Modelo de dados (contrato front ↔ back)

O backend casa **1:1** com `frontend/src/types.ts`. **IDs são strings** (`s1`,
`pp1`, `c1`, `v1`); as PKs no Postgres são `CharField` (não serial) — mantém o
sync e o seed triviais. **API em camelCase** (mapeado via `source=` nos
serializers). Datas trafegam como `YYYY-MM-DD`.

### Entidades
```
Sector       { id, name, building?, floor?, color, vlanId? }   # vlanId = grupo
PatchPanel   { id, name, location, ports }
Switch       { id, name, model, location, ports, ip? }          # ip nulável
VLAN         { id, vlanId(número), name, subnet, description, sectorIds[] }
ConnectionPoint {
  id, identifier, sectorId, patchPanelId, port, switchId, switchPort,
  deviceType, deviceName?, macAddress?, ipAddress?, vlanId?, status, notes, lastUpdate
}
status ∈ { ativo | inativo | problema }
```

### `Point` (modelo "plano" da UI)
A UI usa um `Point` plano (nomes resolvidos, não FKs). Um **mapper**
(`api/mappers.ts`) traduz na borda: `pointFromDTO` resolve FKs → nomes e enriquece
com campos ricos + os `*Id` para escrita; `pointToDTO` faz o inverso. Assim a UI
não precisou ser reescrita para o modelo normalizado. Campos do `Point`:
`id, serverId?, sector, patchPanel, patchPort, sw, swPort, vlan, vlanName, device,
status, point, obs, updatedAt` + ricos (`identifier, deviceName, macAddress,
ipAddress, sectorId, patchPanelId, switchId, switchPort, vlanRef, dirty`).

### Regras de negócio
- **Setor → VLAN:** a VLAN é o **grupo** de setores (FK `Sector.vlan`). Cada setor
  pertence a no máximo uma VLAN. Editar a composição é via `sectorIds` no
  `VLANSerializer`.
- **Cor do setor:** `Sector.color` (hex) editável; fallback estável `hashColor(name)`
  offline (evita "tudo azul").
- **`swPort` auto:** se vazio no Form, vira `Gi1/0/{porta}`.
- **Validação:** `port > 0` é o único campo obrigatório do formulário.
- **Criar painel** gera `ports` pontos vazios (status `inativo`).

---

## 5. Telas (6)

1. **Login** (`LoginScreen`) — logo + glow, e-mail/senha (olho), "Entrar".
   Autenticação **real** via `POST /auth/login` (JWT). Rodapé
   "PatchMap v1.0 · Gestão de Rede Interna".
2. **Pontos** (`ConnectionsListScreen`) — aba inicial. Header **fixo** (logo +
   SyncBadge), 4 StatPills clicáveis (Total/Ativos/Problema/Livres) que filtram
   por status, busca, chips de setor. Lista **virtualizada**: `FlatList` (modo
   lista) / `SectionList` (modo agrupado por setor) renderizam só as linhas
   visíveis + buffer (windowing) — evita travar com centenas de pontos. `PointRow`
   é `React.memo`; `onOpen` vem via `useCallback`.
3. **Detalhe** (`ConnectionDetailScreen`) — hero com badge de ID estilo "porta de
   rack", botão "Mudar status" (bottom sheet), `TracePath` (Tomada → Patch Panel →
   Switch → VLAN), cards de info, excluir.
4. **Formulário** (`ConnectionFormScreen`) — criar/editar. Chips de setor
   (auto-preenche VLAN), etiqueta, dispositivo, painel+porta, switch, VLAN, status,
   observações. Valida `porta > 0`.
5. **VLANs** (`VLANsScreen`) — gerenciador de grupos. Lista VLANs com seus setores
   (chips coloridos) + contagem; "+ Nova VLAN" / tocar abre `VlanEditModal`
   (número + nome + multi-select de setores + excluir). Seção "Setores sem VLAN".
6. **Painel** (`PanelScreen`) — **rack visual** (a tela que o usuário mais gostou):
   card escuro com grid de portas (4 pinos RJ45, número mono, status no canto),
   seletor de painéis + "Novo", segmented "Por setor / Por status", legenda.

Navegação: `RootNavigator` (login gate) → Native Stack (`Tabs` / `Detail` /
`Form`). `MainTabs` mantém a aba ativa em `useState` e desenha o próprio
bottom-nav (Pontos/VLANs/Painel) + FAB "+".

> **Não existe** tela de Ajustes/logout (o `TweaksPanel` do protótipo não foi
> portado). `accent`/`dark`/`density` vivem no store sem UI. O app é **escuro
> fixo** (ver §6).

---

## 6. Design system — "console técnico" (escuro)

> Decisão (2026-06-13): o app foi redesenhado para uma estética de **console
> técnico escuro**, levando a linguagem do rack (Painel) para o app todo. O modo
> claro existe no `buildTheme` mas **não é usado** (`dark: true` é o padrão e não
> há UI de troca). Código: `frontend/src/theme/tokens.ts`.

### Paleta escura (`buildTheme(accent, true)`)
```
bg        #080b11   (fundo da tela)
bgElev    #0c111a   (barras fixas: header, bottom nav)
surface   #111824   (cards)
surface2  #19212f   (superfície interna / chips)
text      #e8eef5     muted #76828f
border    #1c2531     borderStrong #2b3645
accent    #2dd4bf  (teal neon)   accentInk #04231f   accentSoft accent+'24'
glow      = accent
```
### Accent / status
- `DEFAULT_ACCENT = '#2dd4bf'`. Alternativas em `ACCENT_OPTIONS` (sem UI).
- Status (calibrados p/ fundo escuro): `ativo #22c55e` · `inativo #64748b` ·
  `problema #f43f5e`. `STATUS_META` mapeia label/cor/ícone.
- Cores por setor: `sectorColorOf(name)` (cor do backend) com fallback
  `hashColor(name)`. `SECTOR_PALETTE` é a paleta do modal de edição.

### Tipografia
- `sans(peso)` → Plus Jakarta Sans (400/500/600/700/800).
- `mono(peso)` → IBM Plex Mono (400/500/600/700) — IDs, portas, VLANs, números.
- RN não combina `fontWeight`+`fontFamily`; por isso `fonts.ts` expõe
  `sans()/mono()` que devolvem a família certa por peso.

### Raios e espaçamento (literais inline, sem token exportado)
radius sm 8 · md 12 · lg 16 · pill 999 · spacing xs 4 · sm 8 · md 12 · lg 16 · xl 24.

---

## 7. Estrutura de pastas (frontend)

```
frontend/
├── App.tsx                  # useFonts + SafeAreaProvider + StatusBar + restoreSession + RootNavigator
├── app.json                 # Expo config. extra.apiUrl = ponto único de deploy
├── DEPLOY.md                # guia APK / .aab
├── src/
│   ├── types.ts             # Point, Sector, Vlan, PanelDef, ConnectionStatus, DeviceType
│   ├── data/seed.ts         # SECTORS, VLANS, DEVICES, STATUSES, SEED_POINTS, PATCH_PANELS_DEF (fallback offline)
│   ├── store/index.ts       # useAppStore (Zustand + persist): auth, points, panels, sync, sectors, vlans, tema
│   ├── api/                 # camada de API (ver §8)
│   ├── theme/               # tokens.ts (buildTheme + STATUS_META + helpers), useTheme.ts, fonts.ts
│   ├── components/          # Icon, StatusBadge, VlanTag, TracePath, PointRow, PickChip, Segmented,
│   │                        #   SyncBadge, SectorEditModal, VlanEditModal
│   ├── screens/             # Login, ConnectionsList, ConnectionDetail, ConnectionForm, VLANs, Panel
│   └── navigation/          # RootNavigator, MainTabs, types
```

---

## 8. API e sincronização

### Camada `frontend/src/api/`
`config.ts` (URL base por plataforma), `storage.ts` (tokens JWT no AsyncStorage),
`client.ts` (`request<T>` = fetch + Bearer + refresh no 401), `auth.ts`
(login/logout/hasSession), `dto.ts` (tipos camelCase + Topology), `resources.ts`
(getPoints/getTopology/CRUD), `mappers.ts` (DTO ↔ Point), `index.ts` (reexport).

### URL base (`config.ts`)
| Ambiente | Base URL |
|---|---|
| Produção | `app.json → expo.extra.apiUrl` **(o que se troca no deploy)** ou `EXPO_PUBLIC_API_URL` |
| Emulador Android (dev) | `http://10.0.2.2:8000` |
| Web / iOS sim (dev) | `http://localhost:8000` |

### Endpoints (contrato)
```
POST   /auth/login     { email, password } → { token, refresh, user }
POST   /auth/refresh   { refresh }         → { access }
GET/POST           /points/    · GET/PUT/PATCH/DELETE /points/:id/   (CRUD; id gerado se ausente)
GET/POST/...       /panels/  /vlans/  /sectors/   (graváveis)
GET (read-only)    /switches/
```
Permissões: leitura pública; escrita exige JWT (`IsAuthenticatedOrReadOnly`).
Router DRF usa **barra final** (`/points/`). Admin em `/admin/`.

### Sync (store)
- `loadFromServer()` (boot/login): getTopology → `syncPending` → getPoints → merge.
- `savePoint`/`changePoint`: update otimista local + `_syncPoint` (POST/PUT em 2º plano).
- `deletePoint`: remove local + DELETE (enfileira em `pendingDeletes` se falhar).
- **Fila offline (last-write-wins):** falha de rede marca o ponto `dirty`; deletes
  pendentes vão p/ `pendingDeletes[]`; ambos persistem. `syncPending` reenvia.
- `SyncBadge` (header da lista): Sincronizando… / N pendentes / Offline /
  Sincronizado. Tocar dispara `loadFromServer`.
- `restoreSession` no boot: se há token válido, marca `isLoggedIn` e sincroniza.

---

## 9. Deploy

### Backend (VM, Docker Compose) — `patchMapApi/DEPLOY.md`
```bash
git clone https://github.com/MauriciostsDev/patchMapApi.git && cd patchMapApi
cp .env.example .env        # ajustar POSTGRES_PASSWORD, DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS
docker compose up -d --build
```
- `docker-compose.yml` = **produção** (Gunicorn, DEBUG=false, restart). Dev:
  `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` (runserver).
- Entrypoint: aplica migrations e **seed só no primeiro boot** (reboots não apagam
  dados; `RUN_SEED=always` força). `collectstatic` via WhiteNoise.
- **HTTPS:** Android bloqueia cleartext por padrão → use proxy TLS (Caddy/Nginx) e
  `SECURE_SSL=true`. Sem TLS, ver "HTTP em produção" no `frontend/DEPLOY.md`.

### Frontend (Play Store, Gradle local) — `frontend/DEPLOY.md`
```bash
# 1. editar app.json → expo.extra.apiUrl (único campo que muda no deploy)
cd frontend
npx expo prebuild --platform android      # gera android/ (não versionado)
# 2. configurar keystore (uma vez) — ver frontend/DEPLOY.md
cd android
./gradlew assembleRelease   # APK  → app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # AAB  → app/build/outputs/bundle/release/app-release.aab
```
A cada versão: incrementar `expo.android.versionCode` no `app.json`.

---

## 10. Seed de dados (SETHAS — dados reais)

Origem: planilha "Pontos sethas - Página1.pdf" (não versionada). **Só linhas com
SETOR** foram importadas → **209 conexões** (79 ignoradas, 288 total).

| Entidade | Qtde |
|---|---|
| Setores | 26 (FEAS, GSAD, GAB, COPAS, SUAS PSB/PSE, UIAP…) |
| Patch panels | 6 (A–F, 48 portas cada) |
| Switches | 6 (CORE, GEREN-01/02/03-SW, DIST-01/02-SW) |
| VLANs | 0 (não havia no PDF; o usuário cria no app) |
| Conexões | 209 |

- `id` da conexão = `c<nº>`; `identifier` = `<painel>-<porta>` (ex.: `A-01`).
- Campos ausentes ficam nulos (deviceType `Outro`, sem MAC/IP/VLAN).
- Cada setor recebe uma cor distinta (paleta HSL). Seed em
  `patchMapApi/network/management/commands/seed_data.py` (e fallback offline em
  `frontend/src/data/seed.ts`).
- Admin semeado: `admin@patchmap.com` / `123456` (configurável via `.env`).

---

## 11. Decisões-chave (ADRs resumidos)

- **Stack frontend:** Expo + RN + TS (port do protótipo React web). SDK 51→53 por
  causa do alinhamento de 16 KB do Android 15+.
- **Offline-first / mock antes do backend:** o frontend definiu o contrato; o
  backend espelha `types.ts`.
- **Backend em repo próprio** (`patchMapApi`): deploy/versionamento independentes.
  Extraído via `git subtree split` (histórico preservado).
- **VLAN = grupo de setores** (FK `Sector.vlan`), setor com **cor editável**.
- **Mapper na borda da API:** UI continua com `Point` plano; não reescrevemos as 6
  telas para o modelo normalizado.
- **Design "console técnico" escuro** (2026-06-13): app escuro fixo, accent teal,
  levando a linguagem do rack para todas as telas.

---

## 12. Follow-ups conhecidos (não bloqueiam o deploy)

- Repointar os pickers de setor/VLAN do Form para a topologia viva (hoje usam o seed).
- Surfacing de `building`/`floor`/`macAddress`/`ipAddress` nas telas de Detalhe.
- NetInfo p/ disparar `syncPending` ao reconectar.
- Tela de Ajustes (tema/accent/densidade/logout) — existe no store, falta UI.
- `MainTabs` remonta a tela ao trocar de aba (perde scroll). Com a lista
  virtualizada é barato; manter as telas montadas (keep-alive) é opcional.
- Confirmar por interação no emulador: aba VLANs (criar/agrupar) e modal de setor.

### Validado no emulador (2026-06-13, Pixel_9a + dev build)
- Build nativo OK (`npx expo run:android`), backend em `localhost:8000`.
- Login real (`POST /auth/login → 200`), carga dos 209 pontos, tema escuro
  aplicado, navegação e **lista virtualizada com scroll fluido** confirmados.

---

> Histórico detalhado e notas originais: pasta `docs/` (vault Obsidian) — mantida
> como arquivo, mas **este `PROJECT_CONTEXT.md` é a referência canônica**.
