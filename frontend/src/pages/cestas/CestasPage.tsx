import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { CestaListItem } from '../../api/cestas'
import { useAuth } from '../../auth/useAuth'
import { EmptyState } from '../../components/common/EmptyState'
import { PaginatedList, type ListColumn, type ListFilter } from '../../components/common/PaginatedList'

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd, com ou sem hora). */
function formatDate(value: string | null): string {
  if (!value) return 'Sem data'
  const parts = value.slice(0, 10).split('-')
  return parts.length === 3 ? parts.reverse().join('/') : 'Sem data'
}

/** Verdadeiro quando a data ISO cai no mês/ano correntes. */
function isThisMonth(value: string | null): boolean {
  if (!value) return false
  const now = new Date()
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return value.slice(0, 7) === mesAtual
}

function resumoItens(itens: CestaListItem['itens']): string {
  if (!itens || itens.length === 0) return 'Sem itens'
  const nomes = itens.slice(0, 3).map((i) => i.descricao).join(', ')
  return itens.length > 3 ? `${nomes} +${itens.length - 3}` : nomes
}

const columns: ListColumn<CestaListItem>[] = [
  { field: 'data', label: 'Data', render: (v) => formatDate(v as string | null) },
  { field: 'familiaNome', label: 'Família', sortable: false },
]
const filters: ListFilter[] = [
  { param: 'q', label: 'Buscar por família', type: 'text', placeholder: 'Nome da família...' },
  { param: 'startDate', label: 'De', type: 'date' },
  { param: 'endDate', label: 'Até', type: 'date' },
]

/**
 * Listagem de doações de cesta (#6). Reusa o `PaginatedList` (#23) com busca por
 * família, filtro por intervalo de datas e indicador "recebeu este mês?".
 * Quando aberta a partir do detalhe-hub da família (`?familia=:id`), restringe a
 * lista àquela família e leva o contexto para a criação.
 */
export function CestasPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const [searchParams] = useSearchParams()
  const familiaId = searchParams.get('familia')

  const endpoint = familiaId ? `/api/cestas?familia=${familiaId}` : '/api/cestas'
  const novaDoacaoHref = familiaId ? `/cestas/novo?familia=${familiaId}` : '/cestas/novo'

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 900, mx: 'auto', minWidth: 0 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Doações de cesta
        </Typography>
        {can('CESTA:CREATE') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(novaDoacaoHref)}>
            Nova doação
          </Button>
        )}
      </Stack>
      <PaginatedList<CestaListItem>
        endpoint={endpoint}
        columns={columns}
        filters={filters}
        mode="cards"
        getItemKey={(cesta) => cesta.id}
        onItemClick={(cesta) => navigate(`/cestas/${cesta.id}`)}
        emptyState={
          <EmptyState
            title="Nenhuma doação encontrada"
            description="Não há doações de cesta para os filtros atuais."
          />
        }
        renderCard={(cesta) => (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0, py: 1 }}>
            <ShoppingBasketIcon sx={{ fontSize: 40, color: 'primary.main' }} aria-hidden="true" />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography component="p" variant="h6" sx={{ lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                  {cesta.familiaNome}
                </Typography>
                {isThisMonth(cesta.data) && <Chip label="Este mês" color="success" size="small" />}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(cesta.data)} · {resumoItens(cesta.itens)}
              </Typography>
            </Box>
          </Stack>
        )}
      />
    </Stack>
  )
}
