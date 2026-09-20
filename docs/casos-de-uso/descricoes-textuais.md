# Descrições Textuais dos Casos de Uso

Descrições textuais dos casos de uso do [diagrama](diagrama_de_casos_de_uso.svg),
baseadas no [documento de descrição](<Descrição textual - Trabalho de DS.txt>).

Convenção de pré-condição comum a todos (exceto Fazer login): **o usuário está
autenticado no sistema e possui perfil com a permissão correspondente**.

---

## Autenticação

### Fazer login

- **Ator(es):** Usuário (todos)
- **Pré-condições:** o usuário possui conta criada por um administrador.
- **Fluxo principal:**
  1. O usuário informa e-mail e senha.
  2. O sistema valida as credenciais.
  3. O sistema concede acesso e exibe o menu correspondente ao perfil do usuário.
- **Fluxos alternativos:**
  - Credenciais inválidas: o sistema exibe mensagem de erro e permanece na tela de login.
- **Pós-condições:** sessão autenticada iniciada.

### Criar conta

- **Ator(es):** Admin
- **Pré-condições:** o ator possui perfil de administrador (diretoria da ONG).
- **Fluxo principal:**
  1. O administrador informa os dados do novo usuário e o perfil de acesso (assistente
     social, voluntário interno ou profissional de atendimento).
  2. O sistema valida os dados e cria a conta.
- **Fluxos alternativos:**
  - E-mail já cadastrado: o sistema informa e não cria a conta duplicada.
- **Pós-condições:** nova conta disponível para login.

### Solicitar alteração de senha

- **Ator(es):** Usuário (todos)
- **Pré-condições:** usuário autenticado.
- **Fluxo principal:**
  1. O usuário solicita a alteração de senha e informa a nova senha.
  2. O sistema valida e atualiza a senha.
- **Fluxos alternativos:**
  - Nova senha não atende aos critérios: o sistema rejeita e mantém a senha atual.
- **Pós-condições:** senha atualizada.

---

## Gerência de famílias

### Cadastrar novas famílias

- **Ator(es):** Assistente social (exclusivo)
- **Pré-condições:** usuário autenticado como assistente social.
- **Fluxo principal:**
  1. A assistente social abre o formulário de cadastro de família.
  2. Informa os dados da pessoa representante (nome, nome social, nascimento, CPF, RG,
     NIS, estado civil, contato, endereço) e a situação socioeconômica e de saúde.
  3. O sistema valida e persiste o cadastro da família.
- **Fluxos alternativos:**
  - *(estende)* **Cadastrar dependentes:** opcionalmente, a assistente social adiciona os
    demais membros da família (nome, idade, parentesco, ocupação/escola) como dependentes
    da representante.
  - Dados obrigatórios ausentes/CPF inválido: o sistema aponta o erro e não salva.
- **Pós-condições:** família disponível para uso dos demais serviços.

### Consultar famílias

- **Ator(es):** Assistente social
- **Pré-condições:** usuário autenticado como assistente social.
- **Fluxo principal:**
  1. A assistente social acessa a listagem de famílias cadastradas.
  2. Seleciona uma família e visualiza seus dados pessoais.
- **Fluxos alternativos:**
  - *(estende)* **Visualizar serviços utilizados:** o sistema lista as instâncias em que a
    família utilizou serviços da ONG (cestas básicas, roupas, atendimentos etc.).
- **Pós-condições:** nenhuma alteração de dados.

### Editar famílias

- **Ator(es):** Assistente social (exclusivo)
- **Pré-condições:** família cadastrada.
- **Fluxo principal:**
  1. A assistente social seleciona a família e altera os dados desejados.
  2. O sistema valida e persiste as alterações.
- **Pós-condições:** dados da família atualizados.

### Deletar famílias

- **Ator(es):** Assistente social (exclusivo)
- **Pré-condições:** família cadastrada.
- **Fluxo principal:**
  1. A assistente social seleciona a família e confirma a exclusão.
  2. O sistema remove o cadastro.
- **Pós-condições:** família removida do sistema.

---

## Gerência de atendimento

> Conforme a descrição (item c), o atendimento pode ser de natureza **jurídica**
> (advogada) ou **psicológica** (psicólogo); o tipo é definido de acordo com o
> profissional responsável. No diagrama, esse papel é representado pelo ator
> **Profissional Voluntário**.

### Cadastrar atendimentos

- **Ator(es):** Profissional Voluntário (exclusivo)
- **Pré-condições:** existe ao menos uma família cadastrada.
- **Fluxo principal:**
  1. O profissional inicia o registro de um atendimento.
  2. *(inclui)* **Selecionar família beneficiada** — seleciona a família atendida.
  3. Informa data, horário, modalidade, relato do caso e demais dados da sessão.
  4. O sistema valida e persiste o atendimento.
- **Pós-condições:** atendimento associado à família.

### Consultar / Editar / Deletar atendimentos

- **Ator(es):** Profissional Voluntário (exclusivo)
- **Consultar:** lista/visualiza os atendimentos registrados.
- **Editar:** altera os dados de um atendimento existente.
- **Deletar:** remove um atendimento registrado.

---

## Gerência de cestas básicas

### Cadastrar doação de cesta

- **Ator(es):** Assistente social, Voluntário interno
- **Pré-condições:** existe ao menos uma família cadastrada.
- **Fluxo principal:**
  1. O ator inicia o registro de uma doação de cesta.
  2. *(inclui)* **Selecionar família beneficiada**.
  3. *(inclui)* **Informar itens doados** — registra os itens/quantidades da cesta
     (obrigatório).
  4. Informa a data da doação.
  5. O sistema valida e persiste a doação.
- **Pós-condições:** doação de cesta associada à família.

### Consultar cestas doadas

- **Ator(es):** Assistente social, Voluntário interno
- **Fluxo principal:** o ator lista as doações de cestas registradas.
- **Fluxos alternativos:**
  - *(estende)* **Filtrar por data:** o ator restringe a listagem por período.

### Deletar doação de cesta

- **Ator(es):** Assistente social, Voluntário interno
- **Fluxo principal:** o ator seleciona uma doação e confirma a exclusão.

---

## Gerência de doações de roupas

### Cadastrar doação de roupas

- **Ator(es):** Assistente social, Voluntário interno
- **Pré-condições:** existe ao menos uma família cadastrada.
- **Fluxo principal:**
  1. O ator inicia o registro de uma doação de roupas.
  2. *(inclui)* **Selecionar família beneficiada**.
  3. Informa a data da doação e a quantidade de peças.
  4. O sistema valida e persiste a doação.
- **Fluxos alternativos:**
  - *(estende)* **Informar itens doados:** opcionalmente, o ator descreve quais peças
    foram levadas.
- **Pós-condições:** doação de roupas associada à família.

### Consultar doações de roupas

- **Ator(es):** Assistente social, Voluntário interno
- **Fluxo principal:** o ator lista as doações de roupas registradas.
- **Fluxos alternativos:**
  - *(estende)* **Filtrar por data.**

### Deletar doação de roupas

- **Ator(es):** Assistente social, Voluntário interno
- **Fluxo principal:** o ator seleciona uma doação e confirma a exclusão.

---

## Registro de visitas

### Cadastrar visitas

- **Ator(es):** Voluntário interno, Assistente social
- **Pré-condições:** usuário autenticado. **Não** exige família cadastrada.
- **Fluxo principal:**
  1. O ator registra a visita informando dados essenciais do visitante (nome), data e
     horário/turno, o voluntário que realizou o atendimento e o serviço solicitado.
  2. O sistema persiste a visita.
- **Pós-condições:** visita registrada para fins de comprovação de expediente.

### Consultar visitas

- **Ator(es):** Voluntário interno, Assistente social
- **Fluxo principal:** o ator lista as visitas registradas.
- **Fluxos alternativos:**
  - *(estende)* **Ordenar por data.**

### Deletar visitas

- **Ator(es):** Voluntário interno, Assistente social
- **Fluxo principal:** o ator seleciona uma visita e confirma a exclusão.

---

## Gerência de documentação

### Consultar documentação

- **Ator(es):** Assistente social (exclusivo)
- **Fluxo principal:** a assistente social acessa os documentos institucionais
  (estatuto social, cartão CNPJ, alvará de funcionamento etc.).
- **Fluxos alternativos:**
  - *(estende)* **Baixar documentos:** a assistente social baixa um documento.

### Cadastrar documentos / Deletar documentos

- **Ator(es):** Assistente social (exclusivo)
- **Cadastrar:** submete um novo documento institucional.
- **Deletar:** remove um documento antigo/desatualizado.

---

## Gerência de voluntários externos

> Voluntário externo é **dado**, não ator. Os casos abaixo mantêm a lista de voluntários
> da ONG (inclusive os que não usam o sistema).

### Cadastrar voluntários externos

- **Ator(es):** Assistente social (exclusivo)
- **Fluxo principal:**
  1. A assistente social registra dados pessoais básicos do voluntário e sua frequência
     de atuação (para identificar voluntários inativos).
  2. O sistema persiste o registro.
- **Fluxos alternativos:**
  - *(estende)* **Informar área de atuação:** indica o(s) setor(es) em que o voluntário atua.

### Consultar / Editar / Deletar voluntários externos

- **Ator(es):** Assistente social (exclusivo)
- **Consultar:** lista/visualiza os voluntários.
- **Editar:** altera os dados de um voluntário.
- **Deletar:** remove um voluntário.
