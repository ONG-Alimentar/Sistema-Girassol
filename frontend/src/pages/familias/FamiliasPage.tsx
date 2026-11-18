import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'
import type { FamiliaListItem } from '../../api/familias'
import { useAuth } from '../../auth/useAuth'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

function formatDate(value: string | null): string {
  if (!value) return 'Não informada'
  const parts = value.slice(0, 10).split('-')
  return parts.length === 3 ? parts.reverse().join('/') : 'Não informada'
}

const columns: ListColumn<FamiliaListItem>[] = [
  { field: 'nome', label: 'Nome' },
  { field: 'dataCadastro', label: 'Data de cadastro' },
]
const filters: ListFilter[] = [{
  param: 'q',
  label: 'Buscar por nome',
  placeholder: 'Digite um nome...',
  type: 'text',
  startAdornment: <SearchIcon aria-hidden="true" />,
}]

export function FamiliasPage() {
  const navigate = useNavigate()
  const { can } = useAuth()

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 900, mx: 'auto', minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Famílias atendidas
        </Typography>
        {can('FAMILIA:CREATE') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/familias/nova')}
          >
            Nova família
          </Button>
        )}
      </Stack>
      <PaginatedList<FamiliaListItem>
        endpoint="/api/familias"
        columns={columns}
        filters={filters}
        mode="cards"
        getItemKey={(familia) => familia.id}
        onItemClick={(familia) => navigate(`/familias/${familia.id}`)}
        emptyState={
          <EmptyState
            title="Nenhuma família encontrada"
            description="Não há famílias para os filtros atuais. Tente outro nome ou limpe a busca."
          />
        }
        renderCard={(familia) => (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0, py: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 64, height: 64 }}>
              <PersonOutlineIcon sx={{ fontSize: 44 }} aria-hidden="true" />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="p" variant="h6" sx={{ lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                {familia.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Cadastrada em: {formatDate(familia.dataCadastro)}
              </Typography>
            </Box>
          </Stack>
        )}
      />
    </Stack>
  )
}
