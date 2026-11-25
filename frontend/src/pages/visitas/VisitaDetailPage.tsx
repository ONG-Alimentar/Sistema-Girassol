import { useState } from 'react'
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { deleteVisita, formatVisitaDate, SITUACOES, TURNOS, type Visita } from '../../api/visitas'
import { useAuth } from '../../auth/useAuth'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'

const fields: DetailField<Visita>[] = [
  { field: 'nome', label: 'Nome completo' },
  { field: 'data', label: 'Data', render: (_, visita) => formatVisitaDate(visita.data) },
  { field: 'idade', label: 'Idade' },
  { field: 'turno', label: 'Turno', render: (_, visita) => TURNOS.find((o) => o.value === visita.turno)?.label ?? '—' },
  { field: 'contato', label: 'Contato' },
  { field: 'situacao', label: 'Situação', render: (_, visita) => SITUACOES.find((o) => o.value === visita.situacao)?.label ?? '—' },
  { field: 'motivoDaProcura', label: 'Motivo da procura' },
  { field: 'pedidoAtendido', label: 'Pedido atendido?', render: (_, visita) => visita.pedidoAtendido === null ? 'Não informado' : visita.pedidoAtendido ? 'Sim' : 'Não' },
  { field: 'observacoes', label: 'Observações', render: (_, visita) => <Box component="span" sx={{ display: 'block', whiteSpace: 'pre-wrap', bgcolor: 'background.default', borderRadius: 1, p: 2 }}>{visita.observacoes || '—'}</Box> },
]

export function VisitaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const { confirm, confirmDialogProps } = useConfirm()
  const [excluindo, setExcluindo] = useState(false)

  async function handleExcluir(visita: Visita) {
    if (excluindo) return
    const ok = await confirm({
      title: 'Excluir visita',
      message: `Excluir a visita de ${visita.nome || 'visitante'}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir', color: 'error',
    })
    if (!ok) return
    setExcluindo(true)
    try {
      await deleteVisita(visita.id)
      showToast('Visita excluída.', 'success')
      navigate('/visitas/listagem')
    } catch (cause) {
      showToast(cause instanceof ApiError ? cause.message : 'Não foi possível excluir a visita.', 'error')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 1 }}>
      <Stack spacing={3}>
        <Button variant="outlined" onClick={() => navigate('/visitas/listagem')} sx={{ alignSelf: 'flex-start' }}>Voltar à listagem</Button>
        <Typography component="h1" variant="h4">Detalhes da visita</Typography>
        <Paper sx={{ p: 2 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Dados pessoais</Typography>
          <DetailView<Visita> endpoint="/api/visitas" id={id} fields={fields}
            renderActions={(visita) => can('VISITA:DELETE') && (
              <Button variant="outlined" color="error" disabled={excluindo} onClick={() => void handleExcluir(visita)} sx={{ alignSelf: 'flex-start' }}>Excluir</Button>
            )}
          />
        </Paper>
      </Stack>
      <ConfirmDialog {...confirmDialogProps} />
    </Container>
  )
}
