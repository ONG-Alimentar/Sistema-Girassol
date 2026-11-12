import { useEffect, useState } from 'react'
import { Button, Container, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import { ApiError, apiFetch } from '../../api/client'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import type { ExampleListItem } from './ExampleListPage'

/** Destino mínimo de demonstração; o componente genérico de detalhes pertence à #24. */
export function ExampleDetailPage() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    key: string
    item: ExampleListItem | null
    error: Error | null
  } | null>(null)
  const key = `${id}:${attempt}`
  const validId = Boolean(id && /^[1-9]\d*$/.test(id))
  const loading = validId && result?.key !== key
  const item = result?.key === key ? result.item : null
  const error = !validId
    ? new ApiError('Registro não encontrado.', { status: 404 })
    : result?.key === key ? result.error : null

  useEffect(() => {
    const controller = new AbortController()
    if (!validId) return () => controller.abort()
    void apiFetch<ExampleListItem>(`/api/examples/listagem/${id}`, { signal: controller.signal })
      .then((item) => {
        if (!controller.signal.aborted) setResult({ key, item, error: null })
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setResult({
          key, item: null,
          error: cause instanceof Error ? cause : new Error('Não foi possível carregar o registro.'),
        })
      })
    return () => controller.abort()
  }, [id, key, validId])

  return (
    <Container component="main" maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Button variant="outlined" component={Link} to="/examples/listagem" sx={{ alignSelf: 'flex-start' }}>Voltar à listagem</Button>
        <Typography component="h1" variant="h4">Detalhes do registro de exemplo</Typography>
        {loading ? <LoadingState /> : error instanceof ApiError && error.status === 404 ? (
          <EmptyState title="Registro não encontrado" description="Volte à listagem e selecione outro registro." />
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => setAttempt((value) => value + 1)} />
        ) : item ? (
          <Stack component="dl" spacing={1} sx={{ m: 0, '& dd': { m: 0, overflowWrap: 'anywhere' } }}>
            <Typography component="dt">Nome</Typography><Typography component="dd">{item.name}</Typography>
            <Typography component="dt">Categoria</Typography><Typography component="dd">{item.category}</Typography>
            <Typography component="dt">Data</Typography><Typography component="dd">{item.date.split('-').reverse().join('/')}</Typography>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  )
}
