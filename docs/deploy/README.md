# Pipeline de Deploy

Deploy contínuo acionado por **push na branch `main`**. Tudo em ferramentas
gratuitas.

## Stack

| Camada | Ferramenta | Como faz deploy |
|---|---|---|
| CI/CD | **GitHub Actions** | `.github/workflows/deploy.yml` — roda testes e dispara os deploys |
| Frontend (React + Vite) | **Cloudflare Pages** | Actions builda e publica `frontend/dist` |
| Backend (Java Spring Boot) | **Render** (Docker, plano free) | Actions chama o *deploy hook* após os testes |
| Banco | **Neon** (PostgreSQL serverless, free) | connection string nas env vars do Render |

## Fluxo

```
push na main
   │
   ├── mudou backend/  → testes (mvnw verify) → POST no deploy hook do Render
   │                                              Render builda o Dockerfile e publica
   └── mudou frontend/ → build (npm run build)  → wrangler pages deploy no Cloudflare
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

## Configuração (uma vez)

### 1. Neon (banco)
1. Criar projeto em <https://neon.tech> → copiar a **connection string**.
2. Guardar para usar nas env vars do Render (passo 3).

### 2. Cloudflare Pages (frontend)
1. Em <https://dash.cloudflare.com> → Workers & Pages → **Create** → Pages →
   **Direct Upload**, nome do projeto: `sistema-girassol`.
2. Criar um **API Token** (My Profile → API Tokens) com permissão
   *Account → Cloudflare Pages → Edit*. Anotar o token e o **Account ID**.

### 3. Render (backend)
1. New → **Blueprint**, apontando para este repo (ele lê o `render.yaml`).
2. Em Environment do serviço, preencher:
   - `SPRING_DATASOURCE_URL` → `jdbc:postgresql://<host-neon>/<db>?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` (do Neon)
3. Settings → **Deploy Hook** → copiar a URL.

### 4. Segredos e variáveis no GitHub
Repositório → Settings → Secrets and variables → Actions.

**Secrets:**
| Nome | Valor |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | URL do deploy hook do Render |
| `CLOUDFLARE_API_TOKEN` | token criado no passo 2 |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID da Cloudflare |

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
