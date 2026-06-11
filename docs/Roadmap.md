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
- [ ] Conectar frontend (camada de API + `EXPO_PUBLIC_API_URL`) → Fase 3

## 🔜 Fase 3 — Integração + sincronização offline
- [ ] Trocar o login mock por `/auth/login`
- [ ] Camada de API no frontend + `EXPO_PUBLIC_API_URL`
- [ ] Fila de operações pendentes no frontend
- [ ] Estratégia de merge / resolução de conflito (last-write-wins no MVP)
- [ ] Indicadores de "sincronizando / offline" na UI

## Ideias futuras (não priorizadas)
- [ ] Exportar/importar planilha (CSV) de pontos
- [ ] Histórico de mudanças por ponto
- [ ] Multiusuário com papéis (técnico vs. gestor)
- [ ] Splash screen + ícone adaptativo finalizados
