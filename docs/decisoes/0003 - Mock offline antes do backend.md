# 0003 — Mock offline antes do backend

- **Data:** 2026-06-10
- **Status:** aceita

## Contexto
O usuário pediu explicitamente: *"comece pelo mock do front e em seguida nós vamos fazer o backend"*.

## Decisão
Construir primeiro um **frontend 100% funcional offline**, usando o seed de [[Modelo de Dados]] e
persistência local (AsyncStorage via Zustand persist). Nenhuma chamada de rede no MVP. O [[API Backend]]
virá como camada de sync **por cima** do store já existente, sem reescrever a UI.

## Implicações para a próxima IA (backend)
- Não quebrar o store: a API deve preencher/sincronizar `points`/`panels`, não substituir a arquitetura.
- Respeitar o contrato de tipos de [[Modelo de Dados]] exatamente.
- Introduzir `EXPO_PUBLIC_API_URL` e uma camada `src/api/` isolada; manter modo offline como fallback.

Relacionado: [[Roadmap]].
