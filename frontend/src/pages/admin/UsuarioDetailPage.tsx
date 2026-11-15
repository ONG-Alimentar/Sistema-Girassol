import { Button, Chip, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import type { UsuarioListItem } from '../../api/usuarios'
import { DetailView, type DetailField } from '../../components/common/DetailView'

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

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 720, minWidth: 0 }}>
      <Button variant="outlined" component={Link} to="/admin/usuarios" sx={{ alignSelf: 'flex-start' }}>
        Voltar à listagem
      </Button>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Detalhes do usuário
      </Typography>
      <DetailView<UsuarioListItem> endpoint="/api/usuarios" id={id} fields={fields} />
    </Stack>
  )
}
