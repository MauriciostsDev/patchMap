# Design Tokens

Código: `frontend/src/theme/tokens.ts` (paleta + `buildTheme`) e `frontend/src/theme/fonts.ts` (fontes).
O tema emula as CSS custom properties do protótipo; `useTheme()` o entrega reativo a partir do store.

## Tema (claro / escuro)

```typescript
// claro
bg '#f3f5f8'  surface '#ffffff'  text '#0f172a'  muted '#64748b'
border '#e7ebf0'  borderStrong '#cbd5e1'  chip '#f1f4f8'  accentSoft accent+'1c'
// escuro
bg '#0f1419'  surface '#181f29'  text '#e8edf2'  muted '#8b97a6'
border '#283341'  borderStrong '#3a4757'  chip '#212a36'  accentSoft accent+'30'
```

## Accent
Padrão `DEFAULT_ACCENT` `#2563eb`. `ACCENT_OPTIONS`: `#2563eb` (azul) · `#0d9488` (teal) · `#7c3aed` (roxo) ·
`#ea580c` (laranja) · `#db2777` (rosa). `accentInk` sempre `#ffffff`. `accentSoft` = accent + alpha
(`1c` claro / `30` escuro).
> O accent/modo escuro existem no store, mas **não há UI para trocá-los** no app atual — na prática fica
> azul + claro. Ver [[Arquitetura Frontend#Diferenças intencionais vs. protótipo web]].

## Status (cores fixas, funcionam em claro/escuro)
`STATUS_META` mapeia cada status para `{ label, color, icon }`:
- `ativo` `#16a34a` (check) · `inativo` `#64748b` (close) · `problema` `#dc2626` (alert).
- Fundo do badge = cor + alpha `1f`. Helper `withAlpha(hex, a)`; `statusColor(s)` devolve a cor.
- `DEVICE_ICON` mapeia cada dispositivo a um ícone (`Desktop`→`desktop`, `Telefone IP`→`phone`, …).

## Cores de domínio

**Por setor** (`SECTOR_COLORS`, fallback `#0ea5e9`):
GSAD `#6366f1` · GAB `#0d9488` · GAB Recepção `#d97706` · Secretaria `#db2777`.

**Por VLAN** (`VLAN_COLORS`, fallback `#0ea5e9`):
10 `#0d9488` · 11 `#d97706` · 20 `#6366f1` · 30 `#db2777` · 99 `#64748b`.

## Tipografia
- Sans (títulos/corpo): **Plus Jakarta Sans** (pesos 400/500/600/700/800).
- Mono (IDs, portas, VLANs, valores técnicos): **IBM Plex Mono** (pesos 400/500/600/700).
- Carregadas via `@expo-google-fonts` (`useFonts` no `App.tsx`). Como o RN não combina `fontWeight`
  com `fontFamily`, `fonts.ts` expõe `sans(peso)` / `mono(peso)` que devolvem a família certa.
- Não há mais troca de fonte (Manrope/Sistema do protótipo foram descartadas).

## Raios e espaçamentos
Valores usados de forma consistente (literais inline, não há token exportado):
- radius: sm 8 · md 12 · lg 16 · pill 999.
- spacing: xs 4 · sm 8 · md 12 · lg 16 · xl 24.

## Densidade da lista
`compact` | `regular` | `comfy` — altera padding e tamanho dos `PointRow`. Lido do store; atualmente fixo
em `regular` (sem UI para trocar). Ver [[Arquitetura Frontend#Estado global (Zustand)]].
