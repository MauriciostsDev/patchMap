# 0005 — Camada de API e autenticação real (Fase 3, incremento 1)

- **Data:** 2026-06-11
- **Status:** aceita

## Contexto
Com o [[API Backend|backend]] no ar e validado, a Fase 3 (integração) começou.
O frontend ainda fazia login *mock* (`setTimeout` → `login()`) e não tinha
nenhuma camada de rede. Era preciso uma fundação de API antes de sincronizar
dados, e ela tinha que funcionar tanto no emulador Android quanto na web.

## Decisão
Criada a camada `frontend/src/api/`, isolada do React e do store:

| Arquivo | Responsabilidade |
|---|---|
| `config.ts` | Resolve a URL base por plataforma: **`10.0.2.2:8000`** no emulador Android, `localhost:8000` no resto. Override por `expo.extra.apiUrl` / `EXPO_PUBLIC_API_URL`. |
| `storage.ts` | Persiste `access`/`refresh` em AsyncStorage (fora do store, p/ evitar ciclo de import). |
| `client.ts` | `request()` — fetch com `Authorization: Bearer`, **refresh transparente no 401** (1 tentativa) e `ApiError` tipado a partir do corpo do DRF. |
| `auth.ts` | `login()`, `logout()`, `hasSession()`. |

Pontos-chave:
1. **Token JWT vive no AsyncStorage, não no store Zustand.** O client precisa
   ler o token sem depender do React; o store guarda só `isLoggedIn`/`user`.
2. **Logout automático:** quando o refresh falha, `client` chama um handler
   registrado pelo store (`setUnauthorizedHandler`) → `isLoggedIn = false`.
   Isso quebra o ciclo `store → api → store` por injeção de callback.
3. **Boot reconcilia sessão:** `App.tsx` chama `restoreSession()`; se não há
   token persistido, força `isLoggedIn = false` (o flag persistido sozinho não
   basta).
4. **`ALLOWED_HOSTS` do backend** passou a incluir `10.0.2.2` (host da máquina
   visto de dentro do emulador), senão o Django rejeitaria a requisição.

## Validação
- `tsc --noEmit` limpo.
- Backend aceita `POST /auth/login` com `Host: 10.0.2.2:8000`.
- App recarrega o bundle no emulador sem erro (`Running "main" ... fabric:true`).

## Próximo incremento
Migrar o modelo do front (plano, `id:number`) para o **normalizado** já descrito
em [[decisoes/0004 - Backend espelha o contrato do frontend]] e
[[Modelo de Dados]], e então sincronizar o store com `/points/` e a topologia.

Relacionado: [[Integração Frontend-Backend]], [[API Backend]], [[Roadmap]].
