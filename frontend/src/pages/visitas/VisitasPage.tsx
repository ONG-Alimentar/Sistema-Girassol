import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'
import { formatVisitaDate, type Visita } from '../../api/visitas'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

const columns: ListColumn<Visita>[] = [
  { field: 'data', label: 'Data', render: (_, item) => formatVisitaDate(item.data) },
  { field: 'nome', label: 'Nome', sortable: false },
]
const filters: ListFilter[] = [{
  param: 'q', label: 'Buscar por nome', placeholder: 'Digite um nome...', type: 'text',
  startAdornment: <SearchIcon aria-hidden="true" />,
}]

export function VisitasPage() {
  const navigate = useNavigate()

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 900, mx: 'auto', minWidth: 0 }}>
      <Button variant="outlined" onClick={() => navigate('/visitas')} sx={{ alignSelf: 'flex-start' }}>Voltar</Button>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>Visitas</Typography>
      <PaginatedList<Visita>
        endpoint="/api/visitas"
        columns={columns}
        filters={filters}
        mode="cards"
        getItemKey={(visita) => visita.id}
        onItemClick={(visita) => navigate(`/visitas/${visita.id}`)}
        emptyState={<EmptyState title="Nenhuma visita encontrada" description="Não há visitas para os filtros atuais." />}
        renderCard={(visita) => (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0, py: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 56, height: 56 }}>
              <PersonPinCircleIcon aria-hidden="true" />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="p" variant="h6" sx={{ overflowWrap: 'anywhere' }}>{visita.nome || 'Nome não informado'}</Typography>
              <Typography variant="body2" color="text.secondary">{formatVisitaDate(visita.data)}</Typography>
            </Box>
          </Stack>
        )}
      />
    </Stack>
  )
}
