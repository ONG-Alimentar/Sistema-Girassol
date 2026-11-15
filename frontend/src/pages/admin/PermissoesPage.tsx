import { Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { PermissaoListItem } from '../../api/permissoes'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

const columns: ListColumn<PermissaoListItem>[] = [
  { field: 'codigo', label: 'Código' },
]

const filters: ListFilter[] = [{
  param: 'q',
  label: 'Buscar por código',
  type: 'text',
}]

export function PermissoesPage() {
  const navigate = useNavigate()
  return (
    <Stack spacing={3} sx={{ width: '100%', minWidth: 0 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Permissões
      </Typography>
      <PaginatedList<PermissaoListItem>
        endpoint="/api/permissoes"
        columns={columns}
        filters={filters}
        mode="table"
        getItemKey={(permissao) => permissao.id}
        onItemClick={(permissao) => navigate(`/admin/permissoes/${permissao.id}`)}
        emptyState={
          <EmptyState
            title="Nenhuma permissão encontrada"
            description="Não há permissões para os filtros atuais. Tente outro código ou limpe a busca."
          />
        }
      />
    </Stack>
  )
}
