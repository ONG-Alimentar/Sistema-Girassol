# Design system — Sistema Girassol (frontend)

Fonte única de estilo do frontend: o **tema MUI** em [`../src/theme.ts`](../src/theme.ts),
montado na raiz (`ThemeProvider` + `CssBaseline` em `src/App.tsx`). A identidade
vem dos wireframes (`docs/wireframes/`): marrom terroso + creme + amarelo girassol.

## Regra de ouro

**Use tokens do tema — nunca cores/medidas soltas.**

- Cores: `color="primary"`, `color="secondary"`, `sx={{ bgcolor: 'background.paper', color: 'text.secondary' }}`. Nunca `#5B3A21`, `#ddd`, `crimson` direto no componente.
- Espaçamento: use a escala do MUI (grid de 8px) via `sx` — `p`, `m`, `gap`, `py`, etc. (`gap: 2` = 16px). Evite `padding: '12px'` solto.
- Raio/formato: já vêm do tema (`shape.borderRadius`, botões em pílula). Não force `borderRadius` à mão a menos que seja um caso específico.
- Precisa de um novo padrão de cor/componente recorrente? Adicione ao `theme.ts`
  (palette ou `components`), de forma incremental — não espalhe o valor pelas telas.

## Reaproveite componentes existentes

Antes de criar algo novo, use os blocos já prontos:

- `src/components/common/` — `LoadingState`, `EmptyState`, `ErrorState`, `ConfirmDialog` (feedback de UI, #27).
- `src/context/ToastProvider.tsx` + `src/hooks/useToast.ts` — toasts (`showToast(msg, 'success' | 'error' | 'info' | 'warning')`).
- `src/hooks/useConfirm.ts` — modal de confirmação.
- `src/components/brand/` — `SunflowerLogo`, `LoginDecorations` (identidade visual).

## Tokens principais

### Paleta (`theme.palette`)

| Token | Hex | Uso |
|---|---|---|
| `primary.main` | `#5B3A21` | Marrom: botões, títulos, ícones principais |
| `text.primary` | `#4A2F17` | Texto |
| `text.secondary` | `#6B5436` | Legendas, placeholders |
| `secondary.main` | `#F2B705` | Amarelo girassol: destaques, ícones de marca |
| `background.default` | `#F4E9CC` | Fundo creme da aplicação |
| `background.paper` | `#FBF6E9` | Superfícies: campos, cards |
| AppBar (âmbar) | `#E9A83C` | Barra superior (override de `MuiAppBar`) |

### Forma e tipografia

- `shape.borderRadius`: `12` (cards/caixas). Inputs: `14`. Botões: pílula (`999`, via override de `MuiButton`).
- `typography`: fonte de sistema; `h1`/`h2` em `fontWeight` 800 e cor marrom; botões sem caixa-alta (`textTransform: 'none'`, peso 600).

### Overrides de componentes (`theme.components`)

- `MuiButton`: formato pílula, sem elevação.
- `MuiAppBar`: fundo âmbar (`#E9A83C`), texto/ícones marrons.
- `MuiCard`: fundo `paper`, borda âmbar sutil, sem elevação.
- `MuiTextField` / `MuiOutlinedInput`: `outlined` + `fullWidth`, fundo `paper`, cantos arredondados.

## Convenções de código (repo)

- Imports com extensão explícita: `./x.tsx`, `../y.ts` (`allowImportingTsExtensions`).
- `import type { ... }` para tipos (`verbatimModuleSyntax`).
- Lint: `npm run lint` (oxlint). Antes de subir: `npm run lint && npm run typecheck && npm run test && npm run build`.
