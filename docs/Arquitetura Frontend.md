# Arquitetura Frontend

App **Expo (React Native) + TypeScript**, port fiel do protótipo web em `Rastreador Conexões Setores/`.

## Stack

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Runtime | Expo SDK 51 (RN 0.74) | Recomendado no `IMPLEMENTACAO_FRONTEND.md`; web + nativo. |
| Linguagem | TypeScript | Contrato de tipos com o [[Modelo de Dados]]. |
| Navegação | React Navigation v6 (Native Stack) | As abas são um bottom-nav próprio (`MainTabs`), não o Bottom Tabs do ecossistema. |
| Estado | Zustand + persist (AsyncStorage) | Leve; offline-first. |
| Ícones | `react-native-svg` (`SvgXml`) | Reaproveita os paths SVG do protótipo 1:1 (`ICON_PATHS`). |
| Tema | Hook `useTheme()` sobre o store | Emula as CSS custom properties do protótipo (sem Context). |
| Fontes | `@expo-google-fonts` (Plus Jakarta Sans + IBM Plex Mono) | Carregadas via `useFonts` no `App.tsx`. |

Ver decisão: [[decisoes/0001 - Stack do Frontend]].

## Estrutura de pastas

```
frontend/
├── App.tsx                      # useFonts(fontAssets) + SafeAreaProvider + StatusBar + RootNavigator
├── app.json                     # config Expo (PatchMap, ícone, package br.gov.patchmap)
├── src/
│   ├── types.ts                 # Point, Sector, Vlan, PanelDef, ConnectionStatus, DeviceType, Density
│   ├── data/seed.ts             # SECTORS, VLANS, DEVICES, STATUSES, SEED_POINTS, PATCH_PANELS_DEF
│   ├── store/index.ts           # useAppStore — Zustand + persist (auth, points, panels, tweaks de tema)
│   ├── theme/
│   │   ├── tokens.ts            # buildTheme(accent, dark) + STATUS_META, DEVICE_ICON, SECTOR_COLORS, VLAN_COLORS, helpers
│   │   ├── useTheme.ts          # hook useTheme() -> Theme reativo (lê accent/dark do store)
│   │   └── fonts.ts             # fontAssets + sans()/mono() (mapeia peso -> família carregada)
│   ├── components/
│   │   ├── Icon.tsx             # <Icon name size color stroke/> via SvgXml (ICON_PATHS)
│   │   ├── StatusBadge.tsx      # badge de status (size 'sm' | 'md')
│   │   ├── VlanTag.tsx          # tag de VLAN (ou "sem VLAN")
│   │   ├── TracePath.tsx        # timeline Tomada -> Patch Panel -> Switch -> VLAN
│   │   ├── PointRow.tsx         # linha de ponto na lista (respeita a densidade)
│   │   ├── PickChip.tsx         # chip selecionável (formulário)
│   │   └── Segmented.tsx        # controle segmentado genérico (com/sem dot colorido)
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── ConnectionsListScreen.tsx   # aba "Pontos"
│   │   ├── ConnectionDetailScreen.tsx
│   │   ├── ConnectionFormScreen.tsx
│   │   ├── VLANsScreen.tsx
│   │   └── PanelScreen.tsx
│   └── navigation/
│       ├── RootNavigator.tsx    # login gate -> native stack (Tabs / Detail / Form)
│       ├── MainTabs.tsx         # bottom-nav próprio (Pontos/VLANs/Painel) + FAB
│       └── types.ts             # RootStackParamList
```

> Os arquivos de tela usam o prefixo `Connection*`, mas a aba e o domínio falam em **"Ponto"**
> (o tipo é `Point`, a entidade é "ponto de conexão" ≈ uma porta de patch panel).

## Estado global (Zustand)

`store/index.ts` exporta `useAppStore`. Interface real (`AppState`):

```typescript
interface AppState {
  // auth
  isLoggedIn: boolean; login(): void; logout(): void;
  // dados
  points: Point[]; panels: PanelDef[];
  addPanel(def: PanelDef): void;     // gera `ports` pontos vazios para o novo painel
  savePoint(np: Point): void;        // upsert (cria ou atualiza por id)
  changePoint(np: Point): void;      // atualiza um ponto existente
  deletePoint(id: number): void;
  allSectors(): string[];            // setores do seed + os usados nos pontos
  // tweaks de tema
  accent: string; dark: boolean; density: Density;
  setAccent(v): void; setDark(v): void; setDensity(v): void;
}
```

Tudo persistido via `zustand/middleware` `persist` numa **única chave** `patchmap.store.v1`
(AsyncStorage) — ver [[Modelo de Dados#Persistência local]].

## Navegação

```
NavigationContainer (tema deriva do useTheme)
└── Native Stack  (headerShown: false)
    ├── !isLoggedIn → "Tabs" = LoginScreen
    └── isLoggedIn:
        ├── "Tabs"   = MainTabs                 # estado interno: 'pontos' | 'vlans' | 'painel'
        ├── "Detail" = ConnectionDetailScreen   # { id }
        └── "Form"   = ConnectionFormScreen      # { id? } — tela cheia, não modal
```

- As **abas não são React Navigation Bottom Tabs**: `MainTabs` mantém a aba ativa em `useState`,
  renderiza a tela correspondente e desenha o próprio bottom-nav (`NavBtn`) + **FAB "+"** (abre o Form).
- `Detail` e `Form` são telas do stack raiz (push), com top bar própria (voltar / editar / salvar).
- O bottom-nav e o FAB só existem dentro de `MainTabs`.

## Diferenças intencionais vs. protótipo web

- CSS variables → `buildTheme(accent, dark)` + hook `useTheme()` lendo do store (não há Context).
- `<div>/<button>/<img>` → `View` / `Pressable` / `Image`.
- SVG inline (`dangerouslySetInnerHTML`) → `SvgXml` do `react-native-svg`.
- `localStorage` → `AsyncStorage`, numa **chave única** `patchmap.store.v1`.
- O **TweaksPanel** flutuante do protótipo **não tem UI no app atual**: `accent`/`dark`/`density` existem
  no store mas não há tela de Ajustes nem botão de logout expostos. Na prática o tema fica fixo
  (claro, accent `#2563eb`, densidade `regular`). Reintroduzir uma tela de Ajustes é trabalho em aberto.
- O frame Android decorativo (`android-frame.jsx`) **não** é portado — é nativo.

Ver [[decisoes/0003 - Mock offline antes do backend]].
