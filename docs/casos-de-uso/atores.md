# Atores

Atores do sistema, conforme a seção 2 do [documento de descrição](<Descrição textual - Trabalho de DS.txt>)
e o [diagrama de casos de uso](diagrama_de_casos_de_uso.svg).

| Ator | Descrição | Casos de uso que acessa |
|---|---|---|
| **Usuário** | Ator **abstrato/genérico**. Não é usado diretamente: generaliza todos os atores humanos do sistema. Concentra as funcionalidades comuns a qualquer pessoa autenticada. | Fazer login, Solicitar alteração de senha |
| **Admin** | Membros da diretoria da ONG. Responsável por criar as contas dos demais usuários do sistema. | Tudo de Usuário + Criar conta |
| **Assistente social** | Ator **principal**. Responsável pelos cadastros das famílias e pela maior parte da gestão interna. | Tudo de Usuário + Gerência de famílias, Gerência de cestas básicas, Gerência de doações de roupas, Registro de visitas, Gerência de documentação, Gerência de voluntários externos |
| **Voluntário interno** | Voluntário com acesso ao sistema para o controle de serviços específicos. | Tudo de Usuário + Gerência de cestas básicas, Gerência de doações de roupas, Registro de visitas |
| **Profissional Voluntário** | Profissional responsável pelos atendimentos prestados às famílias. Conforme a descrição (item c), o atendimento pode ser de natureza **jurídica** (advogada) ou **psicológica** (psicólogo), definido pelo profissional responsável. | Tudo de Usuário + Gerência de atendimento |

## Generalização entre atores

Todos os atores humanos (**Admin**, **Assistente social**, **Voluntário interno** e
**Profissional Voluntário**) são **especializações** do ator abstrato **Usuário**. Por
isso herdam os casos de uso comuns **Fazer login** e **Solicitar alteração de senha**,
que ficam ligados ao ator genérico.

```
                 ┌──────────┐
                 │ Usuário  │  (abstrato: Fazer login, Solicitar alteração de senha)
                 └────△─────┘
                      │ (generalização)
   ┌───────────┬──────┴──────────┬──────────────────────┐
 Admin    Assistente social  Voluntário interno   Profissional Voluntário
```

## Não-atores

- **Voluntário externo:** *não* é ator do sistema. É apenas um **dado** gerido pela
  assistente social (ver caso de uso *Cadastrar voluntários externos*). Voluntários
  externos não utilizam o sistema e não possuem cadastro de acesso.

> **Nota (diagrama × descrição):** o diagrama modela um único ator **"Profissional
> Voluntário"** e um único pacote **"Gerência de atendimento"**, enquanto a descrição
> (item c) cita os papéis concretos de **advogada** e **psicólogo**. Manter esse
> alinhamento em mente caso se decida distinguir os dois papéis no diagrama.
