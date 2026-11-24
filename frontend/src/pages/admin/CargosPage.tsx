import { Button, Chip, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import type { CargoListItem } from '../../api/cargos'
import { useAuth } from '../../auth/useAuth'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

const columns: ListColumn<CargoListItem>[] = [
  { field: 'nome', label: 'Nome' },
  {
    field: 'permissoes',
    label: 'Permissões',
    sortable: false,
    render: (_value, cargo) => (
      cargo.permissoes.length === 0
        ? <Typography variant="body2" color="text.secondary">—</Typography>
        : (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {cargo.permissoes.map((permissao) => (
              <Chip key={permissao.id} size="small" label={permissao.codigo} variant="outlined" />
            ))}
          </Stack>
        )
    ),
  },
  {
    field: 'totalUsuarios',
    label: 'Usuários',
    sortable: false,
    render: (_value, cargo) => (
      <Typography variant="body2">{cargo.totalUsuarios}</Typography>
    ),
  },
]

const filters: ListFilter[] = [{
  param: 'q',
  label: 'Buscar por nome',
  type: 'text',
}]

export function CargosPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  return (
    <Stack spacing={3} sx={{ width: '100%', minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Cargos
        </Typography>
        {can('CARGO:CREATE') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/cargos/novo')}
          >
            Novo cargo
          </Button>
        )}
      </Stack>
      <PaginatedList<CargoListItem>
        endpoint="/api/cargos"
        columns={columns}
        filters={filters}
        mode="table"
        getItemKey={(cargo) => cargo.id}
        onItemClick={(cargo) => navigate(`/admin/cargos/${cargo.id}`)}
        emptyState={
          <EmptyState
            title="Nenhum cargo encontrado"
            description="Não há cargos para os filtros atuais. Tente outro nome ou limpe a busca."
          />
        }
      />
    </Stack>
  )
}
