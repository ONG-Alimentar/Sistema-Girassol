# RBAC com permissões granulares — proteção de camadas

**Status:** proposta de design (fase de modelagem)
**Escopo:** controle de acesso do Sistema Girassol (backend Spring Boot)
**Base:** atores e casos de uso definidos em [`../casos-de-uso/atores.md`](../casos-de-uso/atores.md)
e [`../casos-de-uso/casos-de-uso.md`](../casos-de-uso/casos-de-uso.md)

## Veredito

**Recomendado — o encaixe é excelente.** O sistema já reúne os pré-requisitos que
tornam RBAC natural:

- **Papéis bem definidos e estáveis** (`atores.md`): Administrador, Assistente social,
  Voluntário interno, Advogada, Psicólogo — mais o ator abstrato Usuário.
- **Casos de uso em padrão CRUD por módulo** (`casos-de-uso.md`): cada pacote (famílias,
  jurídico, psicológico, cestas, roupas, etc.) tem Consultar/Cadastrar/Editar/Deletar.
  Isso mapeia 1:1 para permissões `MÓDULO:AÇÃO`.
- **Stack Spring Boot**, cujo Spring Security oferece suporte de primeira classe a
  autoridades granulares e proteção em múltiplas camadas.

Há ainda um requisito de **privacidade real** que justifica a granularidade:
atendimentos **jurídicos** e **psicológicos** são confidenciais e, pelo modelo, **não**
são acessíveis à assistente social. São dados sensíveis de famílias vulneráveis →
implicação de **LGPD**. Um RBAC bem-feito é o que garante esse isolamento.

## Papéis puros × permissões granulares

Recomenda-se o modelo **permission-based**, e não role-based puro:

| Abordagem | Como funciona | Problema |
|---|---|---|
| Role-based puro | `hasRole('ASSISTENTE_SOCIAL')` espalhado no código | Política fica *hardcoded*; a sobreposição entre papéis (cestas/roupas/visitas são de **assistente social E voluntário interno**) vira `if` duplicado |
| **Permission-based (recomendado)** | Papel é um **agrupamento** de permissões; o código verifica a **permissão** (`hasAuthority('FAMILIA:CREATE')`) | Define a permissão uma vez e reusa em vários papéis; muda a política sem tocar no código |

A sobreposição do modelo atual (cestas/roupas/visitas compartilhadas entre assistente
social e voluntário interno) é exatamente o caso em que o modelo granular ganha.

## Catálogo de permissões

Convenção `MODULO:ACAO`, derivada diretamente dos casos de uso:

```
CONTA:CREATE                    (Administrador)
SENHA:UPDATE_SELF               (todos os autenticados)

FAMILIA:READ|CREATE|UPDATE|DELETE
DOCUMENTACAO:READ|CREATE|DELETE
PROJETO:READ|CREATE|UPDATE|DELETE
FINANCEIRO:READ|CREATE|UPDATE|DELETE
VOL_EXTERNO:READ|CREATE|UPDATE|DELETE
CESTA:READ|CREATE|DELETE
ROUPA:READ|CREATE|DELETE
VISITA:READ|CREATE|DELETE
JURIDICO:READ|CREATE|UPDATE|DELETE
PSICOLOGICO:READ|CREATE|UPDATE|DELETE
```

Mapeamento papel → permissões:

| Papel | Permissões |
|---|---|
| **Administrador** | **Todas as permissões** deste catálogo (superusuário) — ver exceção de sigilo abaixo |
| **Assistente social** | FAMILIA / DOCUMENTACAO / PROJETO / FINANCEIRO / VOL_EXTERNO (CRUD) + CESTA / ROUPA / VISITA (CRD) + `SENHA:UPDATE_SELF` |
| **Voluntário interno** | CESTA / ROUPA / VISITA (CRD) + `SENHA:UPDATE_SELF` |
| **Advogada** | JURIDICO (CRUD) + `SENHA:UPDATE_SELF` |
| **Psicólogo** | PSICOLOGICO (CRUD) + `SENHA:UPDATE_SELF` |

> **Nota:** se a pendência #1 de `casos-de-uso.md` for resolvida (a descrição prevê apenas
> registrar/editar em jurídico/psicológico), basta **não conceder** `:READ`/`:DELETE` a
> esses papéis. Nenhuma mudança de código — apenas do seed.

### Exceção de sigilo — Administrador superusuário

Por decisão do grupo, o papel **Administrador** recebe **todas** as permissões do
catálogo, **incluindo** `JURIDICO:*` e `PSICOLOGICO:*` — ou seja, acesso aos dados
sigilosos de atendimentos jurídicos e psicológicos.

Isto é uma **exceção consciente ao princípio de menor privilégio**: os demais papéis
(inclusive a assistente social) permanecem sem acesso a esses dados. Implicações a
mitigar por serem dados sensíveis (LGPD):

- Restringir o papel Administrador a poucas pessoas de confiança (diretoria).
- **Auditar** acessos do Administrador a `JURIDICO:*`/`PSICOLOGICO:*` (log de quem,
  quando e qual registro).
- Deixar essa exceção documentada e aprovada, não como acesso implícito/acidental.

No modelo de dados, isto se resolve **sem privilégio hardcoded**: o papel Administrador
simplesmente é semeado com o vínculo para todas as `permissao` em `papel_permissao`.

## Proteção por camadas (defesa em profundidade)

O ponto forte do RBAC aqui é aplicar a verificação em mais de uma camada.

**1. Camada HTTP (grosseira, primeira barreira)** — `SecurityFilterChain`:

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.POST, "/api/familias/**").hasAuthority("FAMILIA:CREATE")
    .requestMatchers(HttpMethod.GET,  "/api/juridico/**").hasAuthority("JURIDICO:READ")
    .anyRequest().authenticated());
```

**2. Camada de serviço/método (fina, autoritativa)** — `@EnableMethodSecurity` +
`@PreAuthorize` no **service**, não no controller:

```java
@PreAuthorize("hasAuthority('FAMILIA:DELETE')")
public void deletarFamilia(Long id) { ... }
```

Colocar a checagem no service protege a regra mesmo que surja outro ponto de entrada
(job agendado, outro controller, GraphQL) no futuro.

**3. Camada de dados/linha (opcional, futuro)** — caso um dia seja necessário "cada
profissional só vê os atendimentos que registrou", isso é **ABAC** (baseado em atributo),
não RBAC — exige filtro por escopo/ownership no repositório. O modelo atual **não**
exige isso.

Elo com o Spring: cada `Permission` vira um `GrantedAuthority`. No `UserDetailsService`,
carregue usuário → papéis → permissões e devolva as *strings* de permissão como
autoridades.

## Modelo de dados sugerido

```
usuario         (id, email, senha_hash, ativo)
papel           (id, nome)                     -- ADMINISTRADOR, ASSISTENTE_SOCIAL, ...
permissao       (id, codigo)                   -- FAMILIA:CREATE, ...
usuario_papel   (usuario_id, papel_id)         -- N:N
papel_permissao (papel_id, permissao_id)       -- N:N
```

O mapeamento papel→permissão deve ficar **no banco** (não em `enum`), populado por
seed/migration (ex.: Flyway). Assim a diretoria pode reajustar acessos sem redeploy.

## Considerações e armadilhas do modelo atual

- **Usuário abstrato:** não é papel concedível — é apenas o portador de
  `SENHA:UPDATE_SELF` e `Login`. No banco, conceda essa permissão a todos os papéis
  (ou trate como "autenticado").
- **Voluntário externo NÃO é ator** (`atores.md`): é um *dado* gerido pela assistente
  social; nunca recebe conta nem permissão. Não criar papel para ele.
- **Casos incluídos/estendidos** ("Selecionar família beneficiada", "Informar itens
  doados") não são permissões próprias — fazem parte da operação que os inclui. Não
  criar permissão para eles.
- **LGPD:** o isolamento jurídico/psicológico deve ser garantido na camada de método e
  coberto por testes de autorização. É o requisito não-funcional mais sensível do projeto.

## Recomendação final

Para um trabalho de disciplina, o custo/benefício de **RBAC permission-based com
mapeamento no banco + `@PreAuthorize` no service** é ótimo: pouco boilerplate a mais que
role puro, e demonstra maturidade de design (defesa em profundidade, LGPD, política fora
do código). **Evitar ABAC / row-level agora** — não há requisito que o exija.

## Próximos passos

- [ ] Validar o catálogo de permissões com o grupo
- [ ] Resolver a pendência #1 (jurídico/psicológico: registrar/editar apenas?) antes do seed
- [ ] Definir mecanismo de autenticação (sessão × JWT)
- [ ] Escrever a migration de seed dos papéis e permissões (Flyway)
- [ ] Escrever testes de autorização por papel (foco em jurídico/psicológico)
