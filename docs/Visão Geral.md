# Visão Geral

**PatchMap** é um app mobile para equipes de TI rastrearem conexões de cabos de rede em ambientes
corporativos (órgãos públicos, empresas). Substitui as planilhas físicas de *patch panel*, permitindo
consultar **em campo, pelo celular**, a rota completa de um ponto de rede:

```
Tomada da parede (ex: GAB-03)
    ↓
Patch Panel A, Porta 15
    ↓
Switch CORE, Porta Gi1/0/15
    ↓
VLAN 10 — Gabinete
```

## Princípios

- **Offline-first.** Todos os dados ficam no dispositivo (AsyncStorage no MVP). O [[API Backend|backend Django]]
  já existe (Fase 2) e expõe o mesmo contrato; conectá-lo ao app (login real + sync) é a Fase 3.
- **Rápido em campo.** O técnico precisa achar um ponto em segundos: busca, filtros por status e chips de setor.
- **Visual fiel ao hardware.** A tela [[Telas#Painel|Painel]] desenha o rack/patch panel como ele é fisicamente.

## Glossário de domínio

| Termo | Significado |
|-------|-------------|
| **Ponto de conexão** | Registro principal. ≈ uma porta de patch panel e tudo conectado a ela. |
| **Patch Panel** | Equipamento físico no rack com N portas (16/24/32/48). |
| **Porta (patchPort)** | Posição física no patch panel (1..N). |
| **Switch / swPort** | Switch e porta lógica (ex: `CORE` / `Gi1/0/15`). |
| **VLAN** | Segmento lógico de rede (id + nome). |
| **Setor** | Departamento/área física (ex: GAB, GSAD). Cada setor mapeia para uma VLAN. |
| **Ponto (point)** | Etiqueta da tomada na parede (ex: `GAB-03`). |
| **Status** | `ativo` \| `inativo` \| `problema`. |

Detalhes formais em [[Modelo de Dados]].

## Cenário de uso real

Os dados de seed vêm de uma planilha real de um órgão público: setores GAB (Gabinete), GSAD
(Administrativo), GAB Recepção e Secretaria, todos num Patch Panel "A" de 32 portas ligado ao
switch CORE. Ver [[Modelo de Dados#Seed]].
