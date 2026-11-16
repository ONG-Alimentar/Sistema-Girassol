import { Box, Button, Container, List, ListItem, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { deleteCesta, type Cesta, type ItemCesta } from '../../api/cestas'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useAuth } from '../../auth/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd, com ou sem hora). */
function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—'
  const parts = value.slice(0, 10).split('-')
  return parts.length === 3 ? parts.reverse().join('/') : value
}

function renderItens(value: unknown): ReactNode {
  const itens = (value as ItemCesta[]) ?? []
  if (itens.length === 0) return '—'
  return (
    <List dense disablePadding>
      {itens.map((item, index) => (
        <ListItem key={item.id ?? index} disableGutters sx={{ py: 0.25 }}>
          <Typography variant="body1">
            {item.descricao} — <strong>{item.quantidade}</strong>
          </Typography>
        </ListItem>
      ))}
    </List>
  )
}

const fields: DetailField<Cesta>[] = [
  { field: 'familiaNome', label: 'Família' },
  { field: 'data', label: 'Data', render: formatDate },
  { field: 'itens', label: 'Itens', render: renderItens },
]

/**
 * Detalhe de uma doação de cesta (#6): dados read-only via `DetailView` (#24) e
 * ações Editar/Excluir com RBAC e o feedback da #27.
 */
export function CestaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const { confirm, confirmDialogProps } = useConfirm()

  async function handleExcluir(cesta: Cesta) {
    const ok = await confirm({
      title: 'Excluir doação',
      message: `Excluir a doação de cesta de ${cesta.familiaNome}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      color: 'error',
    })
    if (!ok) return

    try {
      await deleteCesta(cesta.id)
      showToast('Doação excluída.', 'success')
      navigate('/cestas')
    } catch (cause) {
      showToast(
        cause instanceof ApiError ? cause.message : 'Não foi possível excluir a doação.',
        'error',
      )
    }
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 1 }}>
      <Stack spacing={3}>
        <Button variant="outlined" onClick={() => navigate('/cestas')} sx={{ alignSelf: 'flex-start' }}>
          Voltar à listagem
        </Button>
        <Typography component="h1" variant="h4">Detalhes da doação</Typography>

        <DetailView<Cesta>
          endpoint="/api/cestas"
          id={id}
          fields={fields}
          onEdit={can('CESTA:UPDATE') ? (cesta) => navigate(`/cestas/${cesta.id}/editar`) : undefined}
          renderActions={(cesta) => (
            <Box>
              {can('CESTA:DELETE') && (
                <Button variant="outlined" color="error" onClick={() => handleExcluir(cesta)} sx={{ alignSelf: 'flex-start' }}>
                  Excluir
                </Button>
              )}
            </Box>
          )}
        />
      </Stack>

      <ConfirmDialog {...confirmDialogProps} />
    </Container>
  )
}
