import { Box, Button, Container, List, ListItem, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { deleteRoupa, type PecaRoupa, type Roupa } from '../../api/roupas'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useAuth } from '../../auth/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'

const GENERO_LABELS: Record<string, string> = {
  MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro',
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd, com ou sem hora). */
function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—'
  const parts = value.slice(0, 10).split('-')
  return parts.length === 3 ? parts.reverse().join('/') : value
}

function renderPecas(value: unknown): ReactNode {
  const pecas = (value as PecaRoupa[]) ?? []
  if (pecas.length === 0) return 'Sem peças detalhadas'
  return (
    <List dense disablePadding>
      {pecas.map((peca, index) => {
        const detalhes = [peca.tamanho, peca.genero ? GENERO_LABELS[peca.genero] : null]
          .filter(Boolean)
          .join(' — ')
        return (
          <ListItem key={peca.id ?? index} disableGutters sx={{ py: 0.25 }}>
            <Typography variant="body1">
              {peca.descricao}
              {detalhes ? ` — ${detalhes}` : ''}
            </Typography>
          </ListItem>
        )
      })}
    </List>
  )
}

const fields: DetailField<Roupa>[] = [
  { field: 'familiaNome', label: 'Família' },
  { field: 'data', label: 'Data', render: formatDate },
  { field: 'quantidade', label: 'Quantidade de peças' },
  { field: 'pecas', label: 'Peças', render: renderPecas },
]

/**
 * Detalhe de uma doação de roupa (#7): dados read-only via `DetailView` (#24) e
 * ação Excluir com RBAC e o feedback da #27. Sem ação Editar — não há
 * `ROUPA:UPDATE` no RBAC atual.
 */
export function RoupaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const { confirm, confirmDialogProps } = useConfirm()

  async function handleExcluir(roupa: Roupa) {
    const ok = await confirm({
      title: 'Excluir doação',
      message: `Excluir a doação de roupa de ${roupa.familiaNome}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      color: 'error',
    })
    if (!ok) return

    try {
      await deleteRoupa(roupa.id)
      showToast('Doação excluída.', 'success')
      navigate('/roupas')
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
        <Button variant="outlined" onClick={() => navigate('/roupas')} sx={{ alignSelf: 'flex-start' }}>
          Voltar à listagem
        </Button>
        <Typography component="h1" variant="h4">Detalhes da doação</Typography>

        <DetailView<Roupa>
          endpoint="/api/roupas"
          id={id}
          fields={fields}
          renderActions={(roupa) => (
            <Box>
              {can('ROUPA:DELETE') && (
                <Button variant="outlined" color="error" onClick={() => handleExcluir(roupa)} sx={{ alignSelf: 'flex-start' }}>
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
