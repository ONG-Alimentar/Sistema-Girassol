import { Chip, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { UsuarioListItem } from '../../api/usuarios'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

const columns: ListColumn<UsuarioListItem>[] = [
  { field: 'nome', label: 'Nome' },
  { field: 'email', label: 'E-mail' },
  {
    field: 'ativo',
    label: 'Situação',
    sortable: false,
    render: (_value, usuario) => (
      <Chip
        size="small"
        label={usuario.ativo ? 'Ativo' : 'Inativo'}
        color={usuario.ativo ? 'success' : 'default'}
        variant={usuario.ativo ? 'filled' : 'outlined'}
      />
    ),
  },
  {
    field: 'cargos',
    label: 'Cargos',
    sortable: false,
    render: (_value, usuario) => (
      usuario.cargos.length === 0
        ? <Typography variant="body2" color="text.secondary">—</Typography>
        : (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {usuario.cargos.map((cargo) => (
              <Chip key={cargo.id} size="small" label={cargo.nome} variant="outlined" />
            ))}
          </Stack>
        )
    ),
  },
]

const filters: ListFilter[] = [{
  param: 'q',
  label: 'Buscar por nome ou e-mail',
  type: 'text',
}]

export function UsuariosPage() {
  const navigate = useNavigate()
  return (
    <Stack spacing={3} sx={{ width: '100%', minWidth: 0 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Usuários
      </Typography>
      <PaginatedList<UsuarioListItem>
        endpoint="/api/usuarios"
        columns={columns}
        filters={filters}
        mode="table"
        getItemKey={(usuario) => usuario.id}
        onItemClick={(usuario) => navigate(`/admin/usuarios/${usuario.id}`)}
        emptyState={
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Não há usuários para os filtros atuais. Tente outro termo ou limpe a busca."
          />
        }
      />
    </Stack>
  )
}
