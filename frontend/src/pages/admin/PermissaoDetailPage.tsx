import { Button, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import type { PermissaoListItem } from '../../api/permissoes'
import { DetailView, type DetailField } from '../../components/common/DetailView'

const fields: DetailField<PermissaoListItem>[] = [
  { field: 'codigo', label: 'Código' },
]

export function PermissaoDetailPage() {
  const { id } = useParams()

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 720, minWidth: 0 }}>
      <Button variant="outlined" component={Link} to="/admin/permissoes" sx={{ alignSelf: 'flex-start' }}>
        Voltar à listagem
      </Button>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Detalhes da permissão
      </Typography>
      <DetailView<PermissaoListItem> endpoint="/api/permissoes" id={id} fields={fields} />
    </Stack>
  )
}
