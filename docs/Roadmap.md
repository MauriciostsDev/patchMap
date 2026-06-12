# Roadmap

## ✅ Fase 1 — Mock do frontend (concluída)
- [x] Scaffold Expo + TypeScript dockerizado
- [x] [[Modelo de Dados]] + seed (port do `data.js`)
- [x] Store Zustand + persistência AsyncStorage
- [x] Navegação Stack + Bottom Tabs
- [x] Telas: Login, Lista, Detalhe, Formulário, VLANs, Painel, Ajustes
- [x] Tema claro/escuro + accent + densidade
- [x] Vault Obsidian de contexto

## ✅ Fase 2 — Backend Django (concluída)
- [x] Scaffold Django + DRF + Postgres no docker-compose
- [x] Modelos espelhando [[Modelo de Dados]] (PKs string) + seed idempotente
- [x] Endpoints REST em camelCase ([[API Backend]])
- [x] Auth JWT (login + refresh)
- [x] Backend rodando e validado localmente (login + CRUD + auth) — ver [[Integração Frontend-Backend]]

## 🟢 Fase 3 — Integração + sincronização offline (concluída no MVP)
Detalhe em [[Integração Frontend-Backend]] · base: [[decisoes/0005 - Camada de API e autenticação real]].
- [x] Camada de API no frontend (`src/api/`: config, storage, client, auth, dto, resources, mappers)
- [x] Trocar o login mock por `/auth/login` (JWT + refresh + restore no boot)
- [x] Mapper DTO normalizado ↔ `Point` plano (enriquece o front sem rewrite da UI)
- [x] Store carrega `/points/` + topologia da API; CRUD sincroniza (POST/PUT/DELETE)
- [x] Fila de operações pendentes (`dirty` + `pendingDeletes`, persistidas)
- [x] Estratégia de merge / resolução de conflito (last-write-wins no MVP)
- [x] Indicador de "sincronizando / pendente / offline" na UI (`SyncBadge`)

### Follow-ups da Fase 3 (não bloqueiam)
- [ ] Repointar os pickers de setor/VLAN do Form para a topologia viva (hoje usam o seed)
- [ ] Surfacing de `building`/`floor`/`macAddress`/`ipAddress` nas telas de Detalhe
- [ ] Detecção de conectividade (NetInfo) p/ disparar `syncPending` ao reconectar

## Ideias futuras (não priorizadas)
- [ ] Exportar/importar planilha (CSV) de pontos
- [ ] Histórico de mudanças por ponto
- [ ] Multiusuário com papéis (técnico vs. gestor)
- [ ] Splash screen + ícone adaptativo finalizados
