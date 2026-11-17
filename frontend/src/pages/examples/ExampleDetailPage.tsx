import { Button, Container, Stack, Typography } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import type { ExampleListItem } from './ExampleListPage'

const fields: DetailField<ExampleListItem>[] = [
  { field: 'name', label: 'Nome' },
  { field: 'category', label: 'Categoria' },
  { field: 'date', label: 'Data', render: (value) => String(value).split('-').reverse().join('/') },
]

export function ExampleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <Container component="main" maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Button variant="outlined" component={Link} to="/examples/listagem" sx={{ alignSelf: 'flex-start' }}>Voltar à listagem</Button>
        <Typography component="h1" variant="h4">Detalhes do registro de exemplo</Typography>
        <DetailView<ExampleListItem>
          endpoint="/api/examples/listagem"
          id={id}
          fields={fields}
          onEdit={(item) => navigate(`/examples/listagem/${item.id}/editar`)}
        />
      </Stack>
    </Container>
  )
}
