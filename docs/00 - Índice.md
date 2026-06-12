# 🗺️ PatchMap — Índice de Contexto

> **Para a IA que está lendo isto:** esta vault Obsidian é a **fonte de verdade** do projeto PatchMap.
> Leia [[Visão Geral]] primeiro, depois a nota relevante para a sua tarefa. Atualize estas notas
> sempre que tomar uma decisão arquitetural ou mudar contrato de dados. Linke com `[[nota]]`.

## Mapa de notas

- [[Visão Geral]] — o que é o PatchMap, problema que resolve, estado atual.
- [[Modelo de Dados]] — entidades, tipos, seed e regras de negócio. **Contrato compartilhado front ↔ back.**
- [[Arquitetura Frontend]] — Expo/React Native, store, navegação, estrutura de pastas.
- [[Telas]] — descrição de cada uma das 6 telas e suas interações.
- [[Design Tokens]] — cores, fontes, raios, espaçamentos, tema claro/escuro.
- [[API Backend]] — contrato REST implementado (Django + DRF + JWT). 📦 Código no repo próprio: https://github.com/MauriciostsDev/patchMapApi
- [[Integração Frontend-Backend]] — como o app conversa com o backend (camada `src/api/`, JWT). **Fase 3.**
- [[../EXECUTAR|EXECUTAR.md]] — **guia de execução atual** (backend em [patchMapApi](https://github.com/MauriciostsDev/patchMapApi) + frontend dev build).
- [[Docker e Execução]] — serviços, portas, caveats.
- [[Roadmap]] — o que está feito e o que vem a seguir.

## Decisões

- [[decisoes/0001 - Stack do Frontend]]
- [[decisoes/0002 - Vault Obsidian como memória do projeto]]
- [[decisoes/0003 - Mock offline antes do backend]]
- [[decisoes/0004 - Backend espelha o contrato do frontend]]
- [[decisoes/0005 - Camada de API e autenticação real]]
- [[decisoes/0006 - Backend em repositório próprio]]

## Estado atual (2026-06-11)

| Camada    | Status            | Nota |
|-----------|-------------------|------|
| Frontend  | ✅ Expo SDK 53 (RN 0.79) — dev build 16KB-aligned | [[Arquitetura Frontend]] |
| Backend   | ✅ Django + DRF + JWT — migrado p/ repo [patchMapApi](https://github.com/MauriciostsDev/patchMapApi) | [[API Backend]] |
| Docker    | ✅ Frontend + Backend + Postgres | [[Docker e Execução]] |
| Integração front ↔ back | 🟢 Fase 3 (MVP): login JWT + sync de dados + fila offline | [[Integração Frontend-Backend]] |

## Material de referência original

A pasta `Rastreador Conexões Setores/` contém o **protótipo HTML/JSX original** e o
`IMPLEMENTACAO_FRONTEND.md` (prompt de implementação). É a **referência visual definitiva** —
o app RN é um port fiel dele. Não apague essa pasta.
