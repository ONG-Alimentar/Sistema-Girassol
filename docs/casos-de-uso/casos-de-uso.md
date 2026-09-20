# Casos de Uso

Lista de casos de uso conforme o [diagrama](diagrama_de_casos_de_uso.svg), organizada
pelos pacotes (limites internos) do diagrama. As relações `<<include>>` e `<<extend>>`
são indicadas em cada caso base.

Legenda: um caso de uso marcado com `<<include>>`/`<<extend>>` refere-se ao caso
**incluído/estendido** a partir daquele caso base.

## Autenticação

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Fazer login | Usuário (todos) | | |
| Criar conta | Admin | | |
| Solicitar alteração de senha | Usuário (todos) | | |

## Gerência de famílias

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar famílias | Assistente social | | Visualizar serviços utilizados |
| Cadastrar novas famílias | Assistente social | | Cadastrar dependentes |
| Editar famílias | Assistente social | | |
| Deletar famílias | Assistente social | | |

## Gerência de atendimento

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar atendimentos | Profissional Voluntário | | |
| Cadastrar atendimentos | Profissional Voluntário | Selecionar família beneficiada | |
| Editar atendimentos | Profissional Voluntário | | |
| Deletar atendimentos | Profissional Voluntário | | |

## Gerência de cestas básicas

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar cestas doadas | Assistente social, Voluntário interno | | Filtrar por data |
| Cadastrar doação de cesta | Assistente social, Voluntário interno | Selecionar família beneficiada, Informar itens doados | |
| Deletar doação de cesta | Assistente social, Voluntário interno | | |

## Gerência de doações de roupas

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar doações de roupas | Assistente social, Voluntário interno | | Filtrar por data |
| Cadastrar doação de roupas | Assistente social, Voluntário interno | Selecionar família beneficiada | Informar itens doados |
| Deletar doação de roupas | Assistente social, Voluntário interno | | |

## Gerência de documentação

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar documentação | Assistente social | | Baixar documentos |
| Cadastrar documentos | Assistente social | | |
| Deletar documentos | Assistente social | | |

## Gerência de voluntários externos

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar voluntários externos | Assistente social | | |
| Cadastrar voluntários externos | Assistente social | | Informar área de atuação |
| Editar voluntários externos | Assistente social | | |
| Deletar voluntários externos | Assistente social | | |

## Registro de visitas

| Caso de uso | Ator(es) | `<<include>>` | `<<extend>>` |
|---|---|---|---|
| Consultar visitas | Voluntário interno, Assistente social | | Ordenar por data |
| Cadastrar visitas | Voluntário interno, Assistente social | | |
| Deletar visitas | Voluntário interno, Assistente social | | |

## Casos de uso incluídos/estendidos (compartilhados)

Estes casos não são acionados diretamente por um ator; aparecem via `<<include>>`/`<<extend>>`:

- **Selecionar família beneficiada** — incluído por: Cadastrar atendimentos,
  Cadastrar doação de cesta, Cadastrar doação de roupas.
- **Informar itens doados** — incluído por Cadastrar doação de cesta (obrigatório);
  estende Cadastrar doação de roupas (opcional).
- **Filtrar por data** — estende Consultar cestas doadas e Consultar doações de roupas.
- **Visualizar serviços utilizados** — estende Consultar famílias.
- **Cadastrar dependentes** — estende Cadastrar novas famílias.
- **Baixar documentos** — estende Consultar documentação.
- **Informar área de atuação** — estende Cadastrar voluntários externos.
- **Ordenar por data** — estende Consultar visitas.

## Observações de consistência (diagrama × descrição)

- **Atendimentos:** o diagrama usa um único pacote *Gerência de atendimento* e um único
  ator *Profissional Voluntário*; a descrição (item c) cita advogada e psicólogo como os
  profissionais responsáveis. O CRUD de atendimentos (Consultar/Cadastrar/Editar/Deletar)
  está coerente com a descrição ("consultar, registrar, editar e excluir").
- **Voluntários externos:** a descrição (item h) enfatiza a **frequência** do voluntário;
  o diagrama modela o extend *Informar área de atuação*. Avaliar se convém registrar
  também a frequência.
