# 0006 — Backend em repositório próprio (patchMapApi)

- **Data:** 2026-06-12
- **Status:** aceita

## Contexto
Até a Fase 3 o projeto era um **monorepo** (`patchMap`) com `frontend/`,
`backend/` e `docs/` juntos. Com o backend já implementado, integrado e validado
([[decisoes/0005 - Camada de API e autenticação real]]), optou-se por separar o
backend em um repositório próprio para deploy/versionamento independentes.

## Decisão
O backend Django + DRF foi **extraído** para um repo próprio:
**[patchMapApi](https://github.com/MauriciostsDev/patchMapApi)**.

1. **Histórico preservado:** extração via `git subtree split --prefix=backend`,
   mantendo autoria e datas dos commits (não foi um copy/paste).
2. **Remoção não-destrutiva do monorepo:** `git rm --cached backend` + `/backend/`
   no `.gitignore`. A cópia local em `./backend` foi mantida no disco (não quebra
   o ambiente de quem já estava rodando), mas deixou de ser versionada no `patchMap`.
3. **`docker-compose.yml` do monorepo** passou a conter **só o frontend**; backend
   e Postgres foram para o compose do `patchMapApi`.
4. **Repo do backend self-runnable:** ganhou `docker-compose.yml` (backend +
   Postgres 16, env interpolável via `.env`), `.env.example` e README standalone.
5. **Nome do repo:** começou como `pathMapApi` e foi **renomeado para `patchMapApi`**
   (grafia correta de "patch"). O GitHub redireciona a URL antiga, mas o canônico
   é `patchMapApi`.

## Implicações
- O `patchMap` agora é **frontend + documentação** (a vault Obsidian continua aqui,
  como fonte de verdade — inclusive do contrato em [[API Backend]] e [[Modelo de Dados]]).
- Quem desenvolve precisa dos **dois repos lado a lado**. Guia: [[../EXECUTAR|EXECUTAR.md]].
- O contrato REST ([[API Backend]]) e o sync ([[Integração Frontend-Backend]])
  não mudaram — só a localização do código do backend.

## Pendência
- Teste de container ao vivo do compose do `patchMapApi` (Docker Desktop não estava
  ativo na extração; `docker compose config` validou a sintaxe, e o código já fora
  validado via venv).

Relacionado: [[Integração Frontend-Backend]], [[Docker e Execução]], [[Roadmap]].
