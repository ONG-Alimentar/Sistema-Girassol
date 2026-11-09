# Frontend — Sistema Girassol

React 19 + Vite + TypeScript. Lint com [Oxlint](https://oxc.rs).

## Rodar

```bash
npm install        # só na primeira vez (ou quando o package.json mudar)
npm run dev        # dev server (Vite imprime a URL, padrão http://localhost:5173)
```

O `npm run dev` transpila TypeScript na hora — não há passo de build separado em
desenvolvimento.

### Outros comandos

```bash
npm run build      # tsc (checa tipos) + vite build -> dist/
npm run preview    # serve o build de produção localmente
npm run lint       # oxlint
npm run typecheck  # só a checagem de tipos (tsc), sem buildar
```

> Como `build` roda `tsc` antes do Vite, um erro de tipo quebra o build (e o
> deploy no GitHub Pages).

## Configuração

A base da API vem de `import.meta.env.VITE_API_URL`. Para dev local apontando no
backend local, copie `.env.example` para `.env.local` (ignorado pelo git):

```
VITE_API_URL=http://localhost:8080
```

Em produção, `VITE_API_URL` é definida no GitHub Actions — ver [`../docs/deploy/`](../docs/deploy/).

## Estrutura (`src/`)

| Caminho | Papel |
|---|---|
| `main.tsx` | Bootstrap: `BrowserRouter` (+ `basename` do GitHub Pages) → `AuthProvider` → `AppRoutes`. |
| `AppRoutes.tsx` | Árvore de rotas (fonte única). |
| `api/` | Cliente HTTP (`client.ts`, com `apiFetch`/`ApiError`) e endpoints (`auth.ts`). |
| `auth/` | Contexto de autenticação, `useAuth`, `RequireAuth`, `PermissionGuard` e o catálogo de permissões (`permissions.ts`). |
| `layouts/` | `AppLayout` (shell autenticado com navegação). |
| `pages/` | Telas (login, dashboard, 403, 404, placeholders de módulo). |

O controle de acesso segue o RBAC em [`../docs/seguranca/rbac.md`](../docs/seguranca/rbac.md)
(permissões no formato `MODULO:ACAO`, tipadas em `src/auth/permissions.ts`).

## Design system

O estilo tem fonte única: o tema MUI em `src/theme.ts` (`ThemeProvider` +
`CssBaseline` montados em `src/App.tsx`). **Use tokens do tema (palette/spacing via
`sx`), não cores/medidas soltas**, e reaproveite `src/components/common/`. Paleta,
tokens e convenções em [`docs/design-system.md`](docs/design-system.md).
