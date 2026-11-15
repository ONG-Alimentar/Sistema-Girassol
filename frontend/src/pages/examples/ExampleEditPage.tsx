import { Button, Container, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'

/**
 * Stub de edição (dev) só para provar a navegação Detalhes → Edição da #24.
 * A tela de edição real (formulário unificado) é do #26/#51.
 */
export function ExampleEditPage() {
  const { id } = useParams()
  return (
    <Container component="main" maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Button
          variant="outlined"
          component={Link}
          to={`/examples/listagem/${id}`}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar aos detalhes
        </Button>
        <Typography component="h1" variant="h4">Edição de exemplo</Typography>
        <Typography color="text.secondary">
          Editando o registro #{id}. A tela de edição real (formulário unificado)
          chega no #26/#51.
        </Typography>
      </Stack>
    </Container>
  )
}
