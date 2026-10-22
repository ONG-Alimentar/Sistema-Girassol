# Pipeline de Deploy

Deploy contínuo acionado por **push na branch `main`**. Tudo em ferramentas
gratuitas.

## Stack

| Camada | Ferramenta | Como faz deploy |
|---|---|---|
| CI/CD | **GitHub Actions** | `.github/workflows/deploy.yml` — roda testes e dispara os deploys |
| Frontend (React + Vite) | **GitHub Pages** | Actions builda e publica `frontend/dist` (Pages source = Actions) |
| Backend (Java Spring Boot) | **Render** (Docker, plano free) | Actions chama o *deploy hook* após os testes |
| Banco | **Neon** (PostgreSQL serverless, free) | connection string nas env vars do Render |

URL do frontend: <https://ong-alimentar.github.io/Sistema-Girassol/>

## Fluxo

```
push na main
   │
   ├── mudou backend/  → testes (mvnw verify) → POST no deploy hook do Render
   │                                              Render builda o Dockerfile e publica
   └── mudou frontend/ → build (npm run build)  → deploy no GitHub Pages (actions/deploy-pages)
```

Pull requests rodam só os testes (sem deploy). Um filtro de path garante que
só a parte alterada é buildada/deployada.

## Estrutura esperada do repo

```
.
├── backend/            # Spring Boot (Maven: mvnw, pom.xml, src/)
│   └── Dockerfile
├── frontend/           # React + Vite (package.json, package-lock.json, src/)
├── render.yaml         # Blueprint do serviço no Render
└── .github/workflows/deploy.yml
```

> **Premissas de build:** backend com **Maven Wrapper** (`./mvnw`) e Java 21;
> frontend com **Vite** (`npm run build` → `frontend/dist`). Se usarem Gradle,
> trocar os comandos no workflow e no `Dockerfile`; se o front for CRA, o output
> é `build/` em vez de `dist/`.
>
> O Vite usa `base: '/Sistema-Girassol/'` no build (subpath do GitHub Pages).
> Se o repositório for renomeado ou usar domínio próprio, ajustar o `base` em
> `frontend/vite.config.js`.

## Configuração (uma vez)

### 1. Neon (banco) — ✅ já provisionado
Banco já criado e testado (conexão + escrita/leitura OK) em 2026-10-21.

| Item | Valor |
|---|---|
| Projeto | `blue-scene-91714944` (org `org-tiny-lake-50634246`) |
| Branch | `production` |
| Região | `sa-east-1` (São Paulo) |
| Banco / Role | `neondb` / `neondb_owner` |
| Endpoint (pooled) | `ep-quiet-queen-b6o5tf4n-pooler.c-2.sa-east-1.aws.neon.tech` |
| Postgres | 18.6 |

A **connection string** (com a senha) está apenas no `.env.local` local
(gitignored, fora do repositório) — a senha foi **rotacionada** após a
criação, invalidando a que apareceu no terminal. Use o endpoint **pooled**
(com `-pooler`) no backend, por causa do pool do HikariCP.

> Para obter/rotacionar a string novamente: `neon connection-string production
> --project-id blue-scene-91714944 --pooled` (requer `neon login`).

### 2. GitHub Pages (frontend) — ✅ já habilitado
Pages ativado com **source = GitHub Actions** (não precisa de conta externa
nem secrets). Publica em <https://ong-alimentar.github.io/Sistema-Girassol/>.

O deploy é feito pelo próprio workflow (`actions/upload-pages-artifact` +
`actions/deploy-pages`). Nada a configurar — só garantir que, em
*Settings → Pages*, a **Source** esteja como **GitHub Actions**.

### 3. Render (backend)
1. New → **Blueprint**, apontando para este repo (ele lê o `render.yaml`).
2. Em Environment do serviço, preencher as 3 vars `SPRING_DATASOURCE_*`
   (valores prontos no `.env.local`; o Neon já está provisionado — ver passo 1):
   - `SPRING_DATASOURCE_URL` → `jdbc:postgresql://ep-quiet-queen-b6o5tf4n-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` → `neondb_owner`
   - `SPRING_DATASOURCE_PASSWORD` → (senha no `.env.local`)
3. Settings → **Deploy Hook** → copiar a URL.

### 4. Segredos e variáveis no GitHub
Repositório → Settings → Secrets and variables → Actions.

**Secrets:**
| Nome | Valor |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | URL do deploy hook do Render |

(O frontend no GitHub Pages usa o `GITHUB_TOKEN` automático — sem secrets.)

**Variables:**
| Nome | Valor |
|---|---|
| `VITE_API_URL` | URL pública do backend no Render (ex: `https://sistema-girassol-api.onrender.com`) |

## Observações do plano free

- **Render free dorme** após ~15 min sem tráfego → a 1ª requisição depois disso
  leva ~50s (cold start). Normal para a demo; se incomodar, um ping periódico
  (ex: UptimeRobot) mantém acordado.
- RAM do free é 512MB — por isso o `JAVA_TOOL_OPTIONS` limitando o heap.
- O backend precisa expor `/actuator/health` (dependência
  `spring-boot-starter-actuator`) para o health check do Render.
