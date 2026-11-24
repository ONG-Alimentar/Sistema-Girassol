import { Button, Chip, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import type { UsuarioListItem } from '../../api/usuarios'
import { useAuth } from '../../auth/useAuth'
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
  const { can } = useAuth()
  return (
    <Stack spacing={3} sx={{ width: '100%', minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Usuários
        </Typography>
        {can('USUARIO:CREATE') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/usuarios/novo')}
          >
            Novo usuário
          </Button>
        )}
      </Stack>
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
