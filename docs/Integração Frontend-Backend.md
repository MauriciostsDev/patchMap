# Integração Frontend-Backend

Como o app Expo conversa com o [[API Backend|backend Django]]. Esta é a **Fase 3**
do [[Roadmap]], feita em incrementos. Decisão de base:
[[decisoes/0005 - Camada de API e autenticação real]].

## Camada `src/api/`

```
frontend/src/api/
├── config.ts     # API_BASE_URL por plataforma (10.0.2.2 no emulador Android)
├── storage.ts    # tokens JWT em AsyncStorage (saveTokens/loadTokens/clearTokens)
├── client.ts     # request<T>() — fetch + Bearer + refresh no 401 + ApiError
├── auth.ts       # login(), logout(), hasSession()
├── dto.ts        # tipos dos recursos (camelCase do DRF) + Topology
├── resources.ts  # getPoints/getTopology/createPoint/updatePoint/deletePointApi
├── mappers.ts    # pointFromDTO / pointToDTO (DTO normalizado ↔ Point plano)
└── index.ts      # reexport público
```

### URL base por ambiente
| Ambiente | Base URL |
|---|---|
| Emulador Android | `http://10.0.2.2:8000` |
| Web / iOS Simulator | `http://localhost:8000` |
| Override | `expo.extra.apiUrl` ou `EXPO_PUBLIC_API_URL` |

> O `10.0.2.2` é o alias do host da máquina visto de dentro do emulador.
> Por isso `10.0.2.2` também entrou no `ALLOWED_HOSTS` do Django.

## Autenticação (JWT)

```
LoginScreen.submit()
  → store.signIn(email, password)
    → api.login() → POST /auth/login {email,password}
        ← { token, refresh, user }
    → saveTokens({access,refresh}) em AsyncStorage
    → set({ isLoggedIn:true, user })
  → RootNavigator vê isLoggedIn → troca p/ stack autenticada
```

- **Refresh transparente:** qualquer `request()` que receba 401 tenta
  `POST /auth/refresh` uma vez; se renovar, refaz a chamada; se falhar, limpa os
  tokens e dispara logout na UI.
- **Boot:** `App.tsx → restoreSession()` confere se há token persistido; sem
  token, volta ao login mesmo que `isLoggedIn` estivesse `true` no storage.
- **Credenciais de dev (seed):** `admin@patchmap.com` / `123456`.

## Modelo de dados: mapper na fronteira (decisão)

A UI continua usando o `Point` **plano** (a reescrita das 6 telas para o modelo
normalizado seria arriscada). Em vez disso, um **mapper** traduz na borda da API:

- `pointFromDTO(dto, topology)` resolve os FKs (`sectorId`/`switchId`/`vlanId`)
  para os nomes que as telas exibem, e enriquece o `Point` com os campos do
  backend (`identifier`, `deviceName`, `macAddress`, `ipAddress`) + os `*Id`
  para a escrita de volta. `id` da UI = sufixo numérico do `serverId` (`c12`→12).
- `pointToDTO(point)` faz o caminho inverso; a store resolve os FKs faltantes
  pela topologia (nome→id) antes de `POST`/`PUT`.

Assim "enriquecer o front pro back" ([[decisoes/0004 - Backend espelha o contrato do frontend]])
acontece sem destruir a UI. Surfacing dos campos ricos nas telas = follow-up.

## Sincronização (store)

```
loadFromServer()         # boot/login: getTopology → syncPending → getPoints → merge
                         #   + popula `panels` da topologia (panelDefFromDTO)
savePoint / changePoint  # update otimista local + _syncPoint (POST/PUT em 2º plano)
deletePoint              # remove local + DELETE (enfileira em pendingDeletes se falhar)
```

> ⚠️ **Consistência de ids do painel:** o `Point.patchPanel` da UI usa o *código
> curto* do painel (`panelCode`: `pp1` → `1`). A lista `panels` é construída com
> o **mesmo** `panelCode`, senão o filtro da PanelScreen (`patchPanel === id`)
> não casa e o painel aparece vazio. Por isso `panelDefFromDTO` e `pointFromDTO`
> compartilham `panelCode`.

**Fila offline (last-write-wins):**
- Falha de rede marca o ponto com `dirty: true`; deletes que falham vão p/
  `pendingDeletes[]`. Ambos persistem no AsyncStorage.
- `syncPending()` reenvia deletes pendentes + pontos `dirty`; é chamado dentro do
  `loadFromServer()` (antes do pull) e ao tocar no [[#Indicador de sync]].
- O `merge` no pull preserva pontos `dirty` ainda não confirmados.

### Indicador de sync
`components/SyncBadge.tsx` no header da lista mostra **Sincronizando… / N
pendentes / Offline / Sincronizado**. Tocar dispara `loadFromServer()`.

## Status dos incrementos

| # | Incremento | Status |
|---|---|---|
| 1 | Camada de API + login real (JWT) | ✅ feito |
| 2a | Endpoints de recursos + mapper + store carrega do backend | ✅ feito |
| 2b | CRUD sincroniza (`savePoint`/`changePoint`/`deletePoint` → API) | ✅ feito |
| 3 | Fila offline (`dirty`/`pendingDeletes` + `syncPending`) + `SyncBadge` | ✅ feito |
| — | Repointar pickers do Form p/ topologia viva + surface de building/floor/MAC/IP nas telas | ⏳ follow-up |

Relacionado: [[API Backend]], [[Modelo de Dados]],
[[decisoes/0004 - Backend espelha o contrato do frontend]],
[[Arquitetura Frontend]].
