# 0004 — Backend espelha o contrato do frontend

- **Data:** 2026-06-11
- **Status:** aceita

## Contexto
O frontend já existia 100% offline ([[decisoes/0003 - Mock offline antes do backend]]),
com o store Zustand usando IDs string (`s1`, `pp1`, `c1`) e tipos em camelCase
(`frontend/src/types.ts`). Ao construir o [[API Backend|backend]] (Django + DRF),
era preciso decidir se a API se adaptaria ao frontend ou o contrário.

## Decisão
O backend **espelha o contrato do frontend**, não o inverso:

1. **PKs são `CharField`** (`s1`, `pp1`, `c1`), não serial auto-incremento. Isso
   faz os IDs do banco baterem 1:1 com os do store offline, tornando a futura
   sincronização (Fase 3) e a migração do seed triviais. Em `POST /points` sem
   `id`, o backend gera `c<n>`.
2. **A API responde/aceita camelCase** (`sectorId`, `patchPanelId`, `switchPort`,
   `lastUpdate`, ...), mesmo que os modelos Django usem snake_case — mapeado via
   `source=` nos serializers. Assim o store consome a API sem transformação.
3. **Datas como `YYYY-MM-DD`** (`DateField`), casando com o tipo do front.

## Implicações para a próxima IA (integração — Fase 3)
- A camada `src/api/` pode mandar/receber os objetos do store quase como estão.
- Resolução de conflito planejada: *last-write-wins* via `lastUpdate`.
- Leitura é pública; escrita exige JWT (`IsAuthenticatedOrReadOnly`). O login real
  deve usar `POST /auth/login` → `{ token, refresh, user }`.

Relacionado: [[API Backend]], [[Modelo de Dados]], [[Roadmap]].
