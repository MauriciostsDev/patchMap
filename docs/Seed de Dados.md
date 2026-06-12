# Seed de Dados (SETHAS)

Como os dados reais do PatchMap foram importados e como regerá-los. O seed é a
fonte dos dados que o app exibe (carregados do backend — ver
[[Integração Frontend-Backend]]).

## Fonte

Planilha **"Pontos sethas - Página1.pdf"** (exportada em PDF), com a estrutura:

| SETOR | PATCH PANEL | ID DE CONEXÃO | SWITCH | (nº global) |
|---|---|---|---|---|

Layout em 4 grupos de colunas por página + 1 página de continuação — 288 linhas
no total. O PDF **não foi versionado** (contém topologia interna; os dados já
ficam nos seeds). Está no `.gitignore` como `Pontos sethas*.pdf`.

## Regra de importação

> **Só foram importadas as linhas COMPLETAMENTE preenchidas** (com **SETOR**).
> Linhas sem setor (porta livre/não atribuída) foram **ignoradas**.

Resultado: **209 conexões** importadas, **79 ignoradas** (288 total).

## O que entrou

| Entidade | Qtde | Observação |
|---|---|---|
| Setores | 26 | FEAS, GSAD, GAB, COPAS, SUAS PSB/PSE, UIAP, COSAN SUPAE… |
| Patch panels | 6 | A, B, C, D, E, F (48 portas cada) |
| Switches | 6 | CORE, GEREN-01-SW, GEREN-02-SW, GEREN-03-SW, DIST-01-SW, DIST-02-SW |
| VLANs | 0 | não havia VLAN no PDF |
| Conexões | 209 | só linhas com setor |

**Mapeamentos / decisões:**
- `id` da conexão = `c<nº global>` (preserva o número da planilha; ex.: `c1`).
- `identifier` = `<painel>-<porta>` (ex.: `A-01`).
- `switch_port` = porta do patch panel (assume cabeamento 1:1 patch↔switch).
- Painel **F** aparece com **dois switches** (DIST-02-SW e GEREN-02-SW) na
  planilha → o switch é mantido **linha-a-linha**, não derivado do painel.
- Campos **ausentes no PDF ficam nulos/vazios** (sem dados fabricados):
  VLAN, dispositivo (`deviceType='Outro'`), MAC, IP da conexão, prédio/andar do
  setor, modelo/IP do switch. Por isso `Switch.ip` virou **nulável**
  (migration `0002_alter_switch_ip`).

## Como rodar a seed (local)

No repo [patchMapApi](https://github.com/MauriciostsDev/patchMapApi):

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_data
```

O `seed_data` é **idempotente e destrutivo p/ os dados**: limpa
setores/painéis/switches/VLANs/conexões e recria; o admin
`admin@patchmap.com / 123456` é preservado. SQLite local por padrão (sem
`DATABASE_URL`). Guia completo: [[../EXECUTAR|EXECUTAR.md]] (seção 1.1).

## Como regerar a partir de um novo PDF

Os seeds (`network/management/commands/seed_data.py` no backend e
`frontend/src/data/seed.ts` no front) foram **gerados por script** a partir do
PDF, com `pdfplumber` (extrai as tabelas respeitando as colunas):

1. `pip install pdfplumber`
2. Parsear: para cada linha, 4 grupos de 5 colunas; pular cabeçalhos, vazios e
   **linhas sem setor**.
3. Montar entidades (setores/painéis/switches por ordem de aparição) e conexões.
4. Emitir `seed_data.py` (backend) e `seed.ts` (fallback offline do front).

Se chegar uma planilha nova, repetir o processo e rodar o `seed_data`.

Relacionado: [[Modelo de Dados]], [[API Backend]], [[Integração Frontend-Backend]].
