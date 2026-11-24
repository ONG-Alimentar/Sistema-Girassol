import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { deleteCargo, type CargoListItem } from '../../api/cargos'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useAuth } from '../../auth/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'

const fields: DetailField<CargoListItem>[] = [
  { field: 'nome', label: 'Nome' },
  {
    field: 'permissoes',
    label: 'Permissões',
    render: (_value, cargo) => (
      cargo.permissoes.length === 0
        ? '—'
        : (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {cargo.permissoes.map((permissao) => (
              <Chip key={permissao.id} size="small" label={permissao.codigo} variant="outlined" />
            ))}
          </Stack>
        )
    ),
  },
  { field: 'totalUsuarios', label: 'Usuários vinculados' },
]

export function CargoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const { confirm, confirmDialogProps } = useConfirm()

  async function handleExcluir(cargo: CargoListItem) {
    const ok = await confirm({
      title: 'Excluir cargo',
      message: `Excluir o cargo "${cargo.nome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      color: 'error',
    })
    if (!ok) return

    try {
      await deleteCargo(cargo.id)
      showToast('Cargo excluído.', 'success')
      navigate('/admin/cargos')
    } catch (cause) {
      showToast(
        cause instanceof ApiError ? cause.message : 'Não foi possível excluir o cargo.',
        'error',
      )
    }
  }

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 720, minWidth: 0 }}>
      <Button variant="outlined" component={Link} to="/admin/cargos" sx={{ alignSelf: 'flex-start' }}>
        Voltar à listagem
      </Button>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Detalhes do cargo
      </Typography>
      <DetailView<CargoListItem>
        endpoint="/api/cargos"
        id={id}
        fields={fields}
        onEdit={can('CARGO:UPDATE') ? (cargo) => navigate(`/admin/cargos/${cargo.id}/editar`) : undefined}
        renderActions={(cargo) => (
          <Box>
            {can('CARGO:DELETE') && (
              <Button variant="outlined" color="error" onClick={() => handleExcluir(cargo)} sx={{ alignSelf: 'flex-start' }}>
                Excluir
              </Button>
            )}
          </Box>
        )}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </Stack>
  )
}
