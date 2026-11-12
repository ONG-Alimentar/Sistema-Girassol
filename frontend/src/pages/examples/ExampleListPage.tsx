import { Button, Container, Stack, Typography } from '@mui/material'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

export interface ExampleListItem {
  id: number
  name: string
  category: string
  date: string
}

const columns: ListColumn<ExampleListItem>[] = [
  { field: 'name', label: 'Nome' },
  { field: 'category', label: 'Categoria' },
  { field: 'date', label: 'Data', render: (value) => String(value).split('-').reverse().join('/') },
]
const filters: ListFilter[] = [
  { param: 'search', label: 'Buscar por nome', type: 'text' },
  { param: 'startDate', label: 'Data inicial', type: 'date' },
  { param: 'endDate', label: 'Data final', type: 'date' },
]

/** Consumidor de exemplo da #23; não substitui as telas de domínio. */
export function ExampleListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const mode = params.get('mode') === 'table' ? 'table' : 'cards'

  return (
    <Container component="main" maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Button variant="outlined" component={Link} to="/" sx={{ alignSelf: 'flex-start' }}>Voltar ao início</Button>
        <Typography component="h1" variant="h4">Listagem de exemplo</Typography>
        <Typography color="text.secondary">Dados fictícios para validar a listagem. Selecione um registro para ver seus detalhes.</Typography>
        <Button variant="contained" sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }} onClick={() => setParams(mode === 'cards' ? { mode: 'table' } : {})}>
          {mode === 'cards' ? 'Exibir tabela' : 'Exibir cards'}
        </Button>
        <PaginatedList<ExampleListItem>
          endpoint="/api/examples/listagem"
          columns={columns}
          filters={filters}
          mode={mode}
          initialPageSize={3}
          pageSizeOptions={[3, 5, 10]}
          getItemKey={(item) => item.id}
          onItemClick={(item) => navigate(`/examples/listagem/${item.id}`)}
        />
      </Stack>
    </Container>
  )
}
