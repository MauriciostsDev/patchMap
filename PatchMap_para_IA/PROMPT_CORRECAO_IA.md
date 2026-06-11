# Prompt de Correção — Reproduzir o PatchMap EXATAMENTE igual ao protótipo

> **Como usar:** abra uma conversa nova com a IA que está construindo o app (Claude Code, Cursor, etc.).
> **Anexe TODOS estes arquivos do protótipo** como referência:
> `Rastreador de Conexões.html`, `app.jsx`, `data.js`, `components.jsx`,
> `screen-login.jsx`, `screen-list.jsx`, `screen-detail.jsx`, `screen-form.jsx`,
> `screen-extra.jsx`, `android-frame.jsx`, `tweaks-panel.jsx`, `icon.png`.
> Depois cole o texto abaixo (tudo a partir de "═══").

═══════════════════════════════════════════════════════════════════════

## TAREFA

A implementação atual do app **PatchMap** ficou **diferente do design aprovado**. Você vai **corrigi-la** para que fique **PIXEL POR PIXEL idêntica** ao protótipo de referência que anexei.

O protótipo de referência é um app React funcional dividido em vários arquivos `.jsx` + `data.js`, renderizado dentro de `Rastreador de Conexões.html`. **Esse protótipo é a ÚNICA fonte da verdade.** Não é "inspiração", não é "ponto de partida" — é o alvo exato.

## REGRA DE OURO

> **NÃO redesenhe nada. PORTE o que já existe.**

Antes de escrever qualquer componente, **abra o arquivo `.jsx` correspondente do protótipo e copie os valores exatos**: cores, tamanhos de fonte, pesos, paddings, border-radius, gaps, larguras, alturas, sombras, textos em português. Se o protótipo usa `padding: '12px 15px'`, o seu código usa `12px 15px` — não "cerca de 12", não "p-3", não o que você acha que fica bonito. O valor exato.

## O QUE DEU ERRADO ANTES (NÃO repita)

A tentativa anterior falhou porque a IA **interpretou uma descrição** em vez de copiar o código. Erros típicos a evitar:

- ❌ Inventar cores, gradientes ou sombras que não estão no protótipo.
- ❌ Trocar a fonte. (É **Plus Jakarta Sans** no corpo/títulos e **IBM Plex Mono** em IDs, portas, VLANs e valores técnicos. Mais nada.)
- ❌ Arredondar/“melhorar” espaçamentos e tamanhos.
- ❌ Reescrever os textos em português ou traduzir para inglês. Copie as strings **exatas** (ex.: "Rastreador de Conexões", "sem VLAN", "Não atribuído", "Mudar status", "PatchMap v1.0 · Gestão de Rede Interna").
- ❌ Mudar a hierarquia/ordem das telas ou a navegação.
- ❌ Usar bibliotecas de UI prontas (Material, etc.) que impõem o visual delas. Construa os componentes do zero, reproduzindo o protótipo.
- ❌ Substituir os ícones por um pack diferente. Os ícones são SVGs stroke definidos em `components.jsx` (objeto `ICON_PATHS`) — **copie os mesmos paths**.
- ❌ Esquecer os dados de seed. Use **exatamente** o que está em `data.js`.

## STACK ALVO

React Native + Expo (SDK 51+), React Navigation v6 (Stack + Bottom Tabs), estado com Zustand, persistência local com AsyncStorage. Animações com Reanimated 3.

> Se o app já foi começado em outra stack (Flutter, etc.), mantenha a stack atual — mas aplique a mesma regra: reproduza o protótipo fielmente.

## COMO PORTAR (passo a passo, sem pular etapas)

Para **cada tela**, faça nesta ordem:

1. **Leia** o `.jsx` correspondente do protótipo inteiro, de cima a baixo.
2. **Liste** os tokens visuais que ele usa (cores, fontes, tamanhos, paddings).
3. **Reproduza** a estrutura JSX → componentes nativos equivalentes (`<div>`→`<View>`, `<button>`→`<Pressable>`, `<span>`/texto→`<Text>`, `<input>`→`<TextInput>`, `<img>`→`<Image>`).
4. **Confira** lado a lado: rode o app, abra o protótipo (`Rastreador de Conexões.html` num navegador) e compare a tela. Ajuste até ficar idêntico.

Mapa de arquivo → tela:

| Arquivo do protótipo | O que contém |
|---|---|
| `data.js` | Modelo de dados, setores, VLANs, seed dos 32 pontos do Painel A. **Porte 1:1.** |
| `components.jsx` | `Icon` (paths SVG), `StatusBadge`, `VlanTag`, `TracePath`/`TraceNode`, mapeamento de ícone por dispositivo, `STATUS_META`. **Base de tudo — porte primeiro.** |
| `screen-login.jsx` | Tela de Login (logo, e-mail, senha com olho, botão Entrar, rodapé). |
| `screen-list.jsx` | Tela "Pontos": header, 4 StatPills de filtro, busca, chips de setor, `PointRow`, agrupar por setor. |
| `screen-detail.jsx` | Detalhe: hero com badge de ID, botão "Mudar status", `TracePath`, cards de info, excluir, bottom sheet de status. |
| `screen-form.jsx` | Formulário criar/editar: chips de setor, etiqueta, dispositivo, painel+porta, switch, VLAN, status, observações. |
| `screen-extra.jsx` | Telas "VLANs" (accordion) e "Painel" (rack visual de portas). |
| `app.jsx` | Navegação, bottom nav (Pontos/VLANs/Painel), FAB "+", tema claro/escuro, accent color. |
| `android-frame.jsx` | Apenas a moldura do celular na pré-visualização — **ignore**, o app real roda no device nativo. |
| `tweaks-panel.jsx` | Painel de ajustes da pré-visualização — **ignore** na implementação. As opções (accent, modo escuro, fonte, densidade) viram configurações do app, se desejado. |

## TOKENS DE DESIGN (confira contra os arquivos; em caso de dúvida, o `.jsx` vence)

```
Cores — tema claro / escuro:
  bg            #f3f5f8 / #0f1419
  surface       #ffffff / #181f29
  chip          #f1f4f8 / #212a36
  text          #0f172a / #e8edf2
  muted         #64748b / #8b97a6
  border        #e7ebf0 / #283341
  border-strong #cbd5e1 / #3a4757

Accent (padrão, customizável):  #2563eb   ink #ffffff   soft = accent + "1c" (claro) / "30" (escuro)

Status (fixas em qualquer tema):
  ativo    #16a34a   inativo  #64748b   problema #dc2626

Fontes:
  Plus Jakarta Sans  → títulos e corpo
  IBM Plex Mono      → IDs, portas, VLANs, valores técnicos

Raios: sm 8 · md 12 · lg 16 · pill 999
Espaçamento: xs 4 · sm 8 · md 12 · lg 16 · xl 24
```

## CHECKLIST DE FIDELIDADE (revise tela a tela antes de entregar)

- [ ] Login idêntico: logo 88×88 raio 22, "PatchMap" + subtítulo, campos com ícone de envelope e cadeado, botão "Entrar" full-width altura 52, link "Esqueci a senha", rodapé "PatchMap v1.0 · Gestão de Rede Interna".
- [ ] Lista: header com `icon.png` 34px + "PatchMap" (800) + "Rastreador de Conexões"; 4 StatPills (Total/Ativos/Problema/Livres) com ponto colorido e número em mono; busca altura 44; chips de setor com contagem; `PointRow` com badge "PP{painel}" + número da porta em mono e ponto de status no canto.
- [ ] Detalhe: badge grande de ID, `TracePath` com 4 nós (Tomada → Patch Panel → Switch → VLAN) ligados por linha tracejada vertical; cards de info; bottom sheet "Mudar status" com 3 opções e ✓ na atual.
- [ ] Formulário: chips de setor preenchem a VLAN automaticamente; "Gi1/0/{porta}" auto-preenchido; validação de porta > 0.
- [ ] VLANs: accordion de 3 níveis (VLAN → Setor → Pontos), cores por VLAN, barra de status; seção "Sem VLAN" no fim.
- [ ] Painel: seletor de painéis + chip "+ Novo"; segmented "Por setor / Por status"; rack escuro `#1e293b` com grid de 8 colunas; cada porta com 4 pinos no topo, número em mono e ponto de status; legenda; bottom sheet "Novo painel".
- [ ] Bottom nav com 3 abas (Pontos/VLANs/Painel) — aba ativa com pílula `accent-soft` e ícone/label accent.
- [ ] FAB "+" 60×60 raio 18, canto inferior direito, sombra com a accent.
- [ ] Tema claro **e** escuro funcionando com as cores exatas acima.
- [ ] Dados de seed = `data.js` (32 portas, GSAD 8–11, GAB 13–17, GAB Recepção 18–21, Secretaria 25; portas 10 e 16 com status "problema" e as observações exatas).
- [ ] Persistência local: auth, pontos e painéis (chaves `patchmap.*.v1`).

## ENTREGA

Quando terminar, rode o app e compare **cada tela** lado a lado com o protótipo HTML aberto no navegador. Para qualquer diferença visível, volte ao `.jsx` de referência, pegue o valor exato e corrija. Só considere pronto quando estiver indistinguível do protótipo.
