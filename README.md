# Sistema Girassol

Sistema de gestão interna para a ONG Alimentar (Pelotas/RS), desenvolvido como trabalho final da disciplina de Desenvolvimento de Software (UFPel).

## Contexto

Hoje grande parte dos registros da ONG (cadastro de famílias, doações, atendimentos jurídicos, fichas de visita) é feita em papel. O sistema centraliza esses dados, permitindo consulta rápida do histórico de cada família e acesso remoto pela equipe.

Usuária principal: assistente social da ONG. Voluntários podem ter acesso a funcionalidades específicas (ex.: registro de doação de roupas).

## Status

🚧 Em fase de modelagem — ver [milestones do projeto](../../milestones) e [`docs/`](docs/).

## Documentação

- [`docs/`](docs/) — documentação de design (docs-as-code), organizada por entrega/milestone
- [`docs/casos-de-uso/`](docs/casos-de-uso/) — modelo de casos de uso (entrega 16/09)

## Stack

- **Backend:** Java 21 + Spring Boot (Spring Web MVC, Actuator) — build com Maven Wrapper
- **Frontend:** React 19 + Vite
- **Banco de dados:** PostgreSQL (Neon, serverless)
- **Deploy:** GitHub Actions → GitHub Pages (frontend) + Render (backend). Ver [`docs/deploy/`](docs/deploy/).

## Equipe

| [<img src="https://github.com/Carpedim.png" width="90"><br><sub><b>Victor Reiznautt</b></sub>](https://github.com/Carpedim) | [<img src="https://github.com/charllynson.png" width="90"><br><sub><b>Charllynson C. Caxias</b></sub>](https://github.com/charllynson) | [<img src="https://github.com/duhdah.png" width="90"><br><sub><b>Eduarda Medeiros</b></sub>](https://github.com/duhdah) | [<img src="https://github.com/gckneip.png" width="90"><br><sub><b>Gustavo Cunha</b></sub>](https://github.com/gckneip) | [<img src="https://github.com/jvlago.png" width="90"><br><sub><b>João Vitor M. Lago</b></sub>](https://github.com/jvlago) |
|:---:|:---:|:---:|:---:|:---:|

## Como rodar

O projeto tem duas partes independentes: `backend/` (API Spring Boot) e
`frontend/` (React + Vite). Dá para rodar cada uma sozinha.

### Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| **JDK** | 21 | backend (o Maven vem junto, via `./mvnw` — não precisa instalar o Maven) |
| **Docker** | — | backend: Postgres local e testes (Testcontainers sobe um Postgres em container) |
| **Node.js** | 20+ | frontend |

> No clone você só precisa do que for mexer: dá pra rodar só o front, só o back, ou os dois.

### Backend (API — `backend/`)

O backend usa JPA + Postgres, então precisa de um banco rodando. Suba um
Postgres local com Docker:

```bash
docker run --name girassol-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=girassol -p 5432:5432 -d postgres:18
```

E rode a API com o profile `dev` (aponta para esse Postgres local por padrão):

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Sobe em <http://localhost:8080>. Teste rápido:

```bash
curl http://localhost:8080/
# {"message":"Hello World","service":"girassol-api"}
```

Health check (usado pelo Render): <http://localhost:8080/actuator/health>.

Outros comandos úteis:

```bash
./mvnw test       # roda os testes (sobem um Postgres via Testcontainers — requer Docker)
./mvnw verify     # build completo + testes (igual ao CI)
```

> **Banco de dados:** o schema é versionado com **Flyway** (migrations em
> `src/main/resources/db/migration/`), e o Hibernate roda em `validate` — ou
> seja, nunca altera o banco, só confere que as entidades batem com o schema das
> migrations. O profile `dev` usa um Postgres local; em produção as credenciais
> do Neon vão nas vars `SPRING_DATASOURCE_*` (modelo em `.env.local`, fora do
> repositório). Detalhes em [`docs/deploy/`](docs/deploy/).

### Frontend (React — `frontend/`)

```bash
cd frontend
npm install        # só na primeira vez (ou quando o package.json mudar)
npm run dev
```

O Vite imprime a URL no terminal (padrão <http://localhost:5173>).

Outros comandos:

```bash
npm run build      # build de produção -> frontend/dist
npm run preview    # serve o build localmente
npm run lint       # oxlint
```

> **URL da API:** o frontend lê a base da API de `import.meta.env.VITE_API_URL`.
> Para desenvolvimento local apontando no backend local, crie um
> `frontend/.env.local` com:
> ```
> VITE_API_URL=http://localhost:8080
> ```
> (em produção essa variável é definida no GitHub Actions — ver [`docs/deploy/`](docs/deploy/)).

### Rodando os dois juntos

Abra dois terminais: um com `./mvnw spring-boot:run` em `backend/` e outro com
`npm run dev` em `frontend/`. O front em `:5173` chama a API em `:8080`.
