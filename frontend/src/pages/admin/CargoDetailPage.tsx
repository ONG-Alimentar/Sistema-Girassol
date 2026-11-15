import { Button, Chip, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import type { CargoListItem } from '../../api/cargos'
import { DetailView, type DetailField } from '../../components/common/DetailView'

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

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 720, minWidth: 0 }}>
      <Button variant="outlined" component={Link} to="/admin/cargos" sx={{ alignSelf: 'flex-start' }}>
        Voltar à listagem
      </Button>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Detalhes do cargo
      </Typography>
      <DetailView<CargoListItem> endpoint="/api/cargos" id={id} fields={fields} />
    </Stack>
  )
}
