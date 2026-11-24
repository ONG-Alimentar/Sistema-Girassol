import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { deleteUsuario, type UsuarioListItem } from '../../api/usuarios'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { DetailView, type DetailField } from '../../components/common/DetailView'
import { useAuth } from '../../auth/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { useToast } from '../../hooks/useToast'

const fields: DetailField<UsuarioListItem>[] = [
  { field: 'nome', label: 'Nome' },
  { field: 'email', label: 'E-mail' },
  {
    field: 'ativo',
    label: 'Situação',
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
    render: (_value, usuario) => (
      usuario.cargos.length === 0
        ? '—'
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

export function UsuarioDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { showToast } = useToast()
  const { confirm, confirmDialogProps } = useConfirm()

  async function handleExcluir(usuario: UsuarioListItem) {
    const ok = await confirm({
      title: 'Excluir usuário',
      message: `Excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      color: 'error',
    })
    if (!ok) return

    try {
      await deleteUsuario(usuario.id)
      showToast('Usuário excluído.', 'success')
      navigate('/admin/usuarios')
    } catch (cause) {
      showToast(
        cause instanceof ApiError ? cause.message : 'Não foi possível excluir o usuário.',
        'error',
      )
    }
  }

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 720, minWidth: 0 }}>
      <Button variant="outlined" component={Link} to="/admin/usuarios" sx={{ alignSelf: 'flex-start' }}>
        Voltar à listagem
      </Button>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Detalhes do usuário
      </Typography>
      <DetailView<UsuarioListItem>
        endpoint="/api/usuarios"
        id={id}
        fields={fields}
        onEdit={can('USUARIO:UPDATE') ? (usuario) => navigate(`/admin/usuarios/${usuario.id}/editar`) : undefined}
        renderActions={(usuario) => (
          <Box>
            {can('USUARIO:DELETE') && (
              <Button variant="outlined" color="error" onClick={() => handleExcluir(usuario)} sx={{ alignSelf: 'flex-start' }}>
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
