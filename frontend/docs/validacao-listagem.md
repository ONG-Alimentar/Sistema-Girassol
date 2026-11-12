# Validação da listagem — issue #23

As rotas abaixo são demonstrações autenticadas disponíveis apenas com `npm run dev`.
Não substituem o componente genérico de detalhes da #24 nem as telas de domínio.
Elas usam o cliente `apiFetch`, os guards e os estados de feedback existentes.
O backend acrescenta GET `/api/examples/listagem/{id}` sobre os mesmos registros
fictícios da listagem; mantém a autenticação e o contrato de erro existentes.

## Iniciar (Windows / PowerShell)

Use Node >=26 e Java 21. Mantenha o PostgreSQL local configurado conforme o README.
Não é necessário alterar o proxy, o tema nem arquivos de ambiente.

Terminal 1, na raiz do repositório:

```powershell
Push-Location .\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Terminal 2, na raiz:

```powershell
Push-Location .\frontend
$env:VITE_API_URL = "http://localhost:8080"
npm run dev -- --port 5173 --strictPort
```

A variável vale apenas para esse terminal. Se ele já tinha outro valor,
anote-o antes e restaure-o quando terminar. Use `localhost` nos dois serviços.
Abra http://localhost:5173/examples/listagem e faça login com uma conta local.
Em um banco dev recém-semeado, o projeto documenta `admin@ong.org` / `admin`.
Se essa conta foi alterada, use sua credencial local vigente.

## Roteiro e resultados esperados

Abra a aba Network/Rede do navegador e observe as chamadas a `/api/examples/listagem`.
Antes de cada cenário, volte à URL inicial ou limpe os filtros anteriores.

| Ação | Resultado esperado |
| --- | --- |
| Abrir a lista | Alfa, Beta e Gama; 8 registros; 3 páginas; requisição `page=0&size=3` |
| Ir à página 2 | Delta, Épsilon e Zeta; requisição `page=1` |
| Escolher 5 itens por página | Volta à primeira página; 5 itens e 2 páginas |
| Buscar `Beta` | Apenas Registro Beta; total 1; página API 0 |
| Buscar `inexistente` | Estado vazio; filtro continua disponível para limpeza |
| Datas de 01/03/2026 a 30/04/2026 | Gama e Delta; parâmetros ISO `2026-03-01` e `2026-04-30` |
| Ordenar Data / Decrescente | Teta, Eta e Zeta; `sort=date,desc` |
| Data inicial 01/05/2026, final 01/04/2026 | HTTP 400; estado de erro compartilhado; corrigir as datas recupera a lista |
| Clicar no card Beta | URL `/examples/listagem/2`; GET por id; nome, categoria e data de Beta |
| Atualizar o navegador no detalhe | Registro carregado novamente pela API, sem depender de estado da tela anterior |
| Abrir `/examples/listagem/999` | GET responde 404; estado “Registro não encontrado” |
| Voltar à listagem | Volta à rota de listagem, reiniciando filtros/paginação |
| Exibir tabela | Mesmos dados; cabeçalhos ordenam; linha ou botão “Ver detalhes” navega |
| Abrir sem sessão | Redireciona ao login; após autenticar retorna ao exemplo |

Para loading: em DevTools > Network selecione uma rede lenta e altere a página.
Confirme o carregamento e que os filtros continuam presentes.
Para erro de rede: após carregar a lista, use Offline em Network e mude a página.
Retorne a Online e clique “Tentar Novamente”; confirme recuperação.
Restaure “No throttling” ao terminar.

Para mobile: use DevTools > modo de dispositivo, largura 360px e depois 390px.
O padrão deve ser cards, filtros empilhados e controles utilizáveis, sem rolagem
horizontal da página. Em desktop, confira também a variação de tabela.
A página de demonstração usa um Container próprio para isolar a listagem do menu
horizontal atual; isso não valida a responsividade do shell de outras telas.

## Testes automatizados

Na raiz, com Docker ativo para a suíte de integração:

```powershell
Push-Location .\backend
.\mvnw.cmd test
Pop-Location
Push-Location .\frontend
npm run typecheck
npm run lint
npm run test
npm run build
Pop-Location
```

O teste `ExamplePages.test.tsx` usa respostas simuladas: verifica integração entre
rotas, autenticação, componente, apiFetch, detalhe e basename; não substitui o
roteiro com servidor real. Os testes Java novos verificam detalhe existente e 404.

## Critérios de aceitação

- Reutilização por colunas/filtros: página de exemplo configura `PaginatedList`,
  sem copiar sua lógica de filtros, ordenação ou paginação.
- Ponta a ponta: comprovar pelo roteiro e requisições reais acima.
- Independência de entidade: o componente e o contrato permanecem genéricos;
  campos do exemplo ficam somente nas páginas consumidoras.
- Cards mobile e clique para detalhe: comprovar visualmente e por navegação.
- Feedback #27 e contrato #29: reutilizados, sem redefinições.

Só marque a validação ponta a ponta e mobile como concluída após executar o roteiro.
Não é preciso implementar a tela de famílias ou o detalhe genérico da #24 aqui.
