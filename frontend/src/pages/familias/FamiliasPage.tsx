import { Avatar, Box, Stack, Typography } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import SearchIcon from '@mui/icons-material/Search'
import type { FamiliaListItem } from '../../api/familias'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

function formatDate(value: string | null): string {
  if (!value) return 'Não informada'
  const parts = value.split('-')
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

interface FamiliasPageProps {
  /** Conectar à rota definitiva do detalhe-hub quando a #50 estiver disponível. */
  onOpenFamilia?: (familia: FamiliaListItem) => void
}

export function FamiliasPage({ onOpenFamilia }: FamiliasPageProps) {
  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 900, mx: 'auto', minWidth: 0 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Famílias atendidas
      </Typography>
      <PaginatedList<FamiliaListItem>
        endpoint="/api/familias"
        columns={columns}
        filters={filters}
        mode="cards"
        getItemKey={(familia) => familia.id}
        onItemClick={onOpenFamilia}
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
              <Typography component="h2" variant="h6" sx={{ lineHeight: 1.3, overflowWrap: 'anywhere' }}>
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
