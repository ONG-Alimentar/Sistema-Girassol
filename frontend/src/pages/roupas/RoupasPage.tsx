import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RoupaListItem } from '../../api/roupas'
import { useAuth } from '../../auth/useAuth'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd, com ou sem hora). */
function formatDate(value: string | null): string {
  if (!value) return 'Sem data'
  const parts = value.slice(0, 10).split('-')
  return parts.length === 3 ? parts.reverse().join('/') : 'Sem data'
}

/** Verdadeiro quando a data ISO cai no dia de hoje. */
function isToday(value: string | null): boolean {
  if (!value) return false
  const hojeISO = new Date().toISOString().slice(0, 10)
  return value.slice(0, 10) === hojeISO
}

function resumoPecas(pecas: RoupaListItem['pecas']): string {
  if (!pecas || pecas.length === 0) return 'Sem peças detalhadas'
  const nomes = pecas.slice(0, 3).map((p) => p.descricao).join(', ')
  return pecas.length > 3 ? `${nomes} +${pecas.length - 3}` : nomes
}

const columns: ListColumn<RoupaListItem>[] = [
  { field: 'data', label: 'Data', render: (v) => formatDate(v as string | null) },
  { field: 'familiaNome', label: 'Família', sortable: false },
]
const filters: ListFilter[] = [
  { param: 'q', label: 'Buscar por família', type: 'text', placeholder: 'Nome da família...' },
  { param: 'startDate', label: 'De', type: 'date' },
  { param: 'endDate', label: 'Até', type: 'date' },
]

/**
 * Listagem de doações de roupa (#7). Reusa o `PaginatedList` (#23) com busca por
 * família, filtro por intervalo de datas e indicador "Recebeu hoje?". Quando aberta
 * a partir do detalhe-hub da família (`?familia=:id`), restringe a lista àquela
 * família e leva o contexto para a criação.
 */
export function RoupasPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const [searchParams] = useSearchParams()
  const familiaId = searchParams.get('familia')

  const endpoint = familiaId ? `/api/roupas?familia=${familiaId}` : '/api/roupas'
  const novaDoacaoHref = familiaId ? `/roupas/novo?familia=${familiaId}` : '/roupas/novo'

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 900, mx: 'auto', minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Doações de roupa
        </Typography>
        {can('ROUPA:CREATE') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(novaDoacaoHref)}>
            Nova doação
          </Button>
        )}
      </Stack>
      <PaginatedList<RoupaListItem>
        endpoint={endpoint}
        columns={columns}
        filters={filters}
        mode="cards"
        getItemKey={(roupa) => roupa.id}
        onItemClick={(roupa) => navigate(`/roupas/${roupa.id}`)}
        emptyState={
          <EmptyState
            title="Nenhuma doação encontrada"
            description="Não há doações de roupa para os filtros atuais."
          />
        }
        renderCard={(roupa) => (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0, py: 1 }}>
            <CheckroomIcon sx={{ fontSize: 40, color: 'primary.main' }} aria-hidden="true" />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography component="p" variant="h6" sx={{ lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                  {roupa.familiaNome}
                </Typography>
                {isToday(roupa.data) && <Chip label="Recebeu hoje" color="success" size="small" />}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(roupa.data)} · {roupa.quantidade} peças · {resumoPecas(roupa.pecas)}
              </Typography>
            </Box>
          </Stack>
        )}
      />
    </Stack>
  )
}
