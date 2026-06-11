# 0002 — Vault Obsidian como memória do projeto

- **Data:** 2026-06-10
- **Status:** aceita

## Contexto
O projeto será tocado por várias IAs ao longo do tempo. Cada uma começa "fria", sem contexto, e tende a
re-derivar decisões já tomadas.

## Decisão
A raiz do repositório é uma **vault Obsidian**. O config fica em `.obsidian/`; as notas em `docs/`.
[[00 - Índice]] é o ponto de entrada. Toda IA deve **ler antes** e **atualizar depois** de mudanças
arquiteturais ou de contrato.

## Convenções
- Uma nota por assunto; linkar com `[[wikilinks]]`.
- Decisões arquiteturais viram notas numeradas em `docs/decisoes/` (ADR-lite).
- Contrato de dados ([[Modelo de Dados]]) é fonte de verdade entre front e back — mudou, atualiza a nota.
- Converter datas relativas em absolutas ("hoje" → `2026-06-10`).

## Por quê
- Wikilinks + grafo do Obsidian tornam o contexto navegável por humano e por IA.
- Markdown plano = versionável em git e legível por qualquer ferramenta.

Relacionado: [[00 - Índice]].
