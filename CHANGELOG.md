# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Entradas com **⚠️ Ação necessária** exigem que cada dev faça algo na sua máquina
após dar `git pull` — não dá para só ignorar.

## [Não lançado]

### ⚠️ Ação necessária — atualização do Node (frontend)

A versão de Node do frontend passou a ser **fixada no Node 26** (antes o CI usava
20, sem trava registrada). Isso foi necessário porque adicionamos o **vitest**,
que **não roda em Node 20** (exige `>=22.12`).

**O que fazer depois do `git pull`** (só quem mexe no frontend):

1. Trocar a versão do Node. Com [`nvm`](https://github.com/nvm-sh/nvm):
   ```bash
   cd frontend && nvm install && nvm use   # lê o frontend/.nvmrc (=26)
   ```
   Sem `nvm`: instalar o Node 26 manualmente.
2. Reinstalar as dependências (o lockfile ganhou `vitest`, `jsdom` e
   `@testing-library`):
   ```bash
   cd frontend && npm ci
   ```
   Sem isso, `npm run test` falha localmente.

**Bom saber:**
- Não há `engine-strict`, então `npm ci`/`npm install` **não bloqueia** por
  versão — no máximo mostra um aviso. O único cenário que realmente quebra é
  rodar o `vitest` em Node 20.
- **Produção não roda Node**: o frontend em prod são arquivos estáticos no GitHub
  Pages e o backend é Java no Render. Node é só ferramenta de build/teste (CI e
  dev local). Quem mexe só no backend não é afetado.

### Adicionado
- Testes de frontend com **vitest + jsdom + @testing-library** (`npm run test`),
  rodando no CI (job `frontend-ci`, antes do build).
- Guarda de regressão do roteamento em produção (`frontend/src/App.test.tsx`):
  reproduz o subpath do GitHub Pages e falha se o `basename` do router ou o
  `AuthProvider` forem removidos.
- `frontend/.nvmrc` e `engines` no `package.json` como fonte única da versão de
  Node.

### Corrigido
- **404 em produção** (GitHub Pages, `/Sistema-Girassol/`): o app caía sempre na
  NotFoundPage e nunca chamava o backend. Causas, ambas em `main.tsx`:
  - `BrowserRouter` sem `basename` → nenhuma rota casava com o subpath;
  - `AuthProvider` nunca montado → `useAuth()` quebrava e a camada de API sumia
    do bundle por tree-shaking (a `VITE_API_URL` não surtia efeito).
- **Autenticação cross-site em produção**: cookie de sessão passou a usar
  `SameSite=None; Secure` (prod) mantendo `Lax`/não-secure em dev — sem isso o
  browser descartava o cookie no login cross-site (Pages ↔ Render).

### Alterado
- Composição do app extraída de `main.tsx` para `App.tsx` (router + providers +
  rotas), para ficar testável.
- CI do frontend passou a usar `node-version-file` (lendo o `.nvmrc`).
- README: requisito de Node atualizado de "20+" para 26.
