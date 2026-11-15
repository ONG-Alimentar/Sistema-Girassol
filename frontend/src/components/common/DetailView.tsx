import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { ApiError, apiFetch } from '../../api/client'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

// Só ids inteiros positivos são válidos; qualquer outra coisa é tratada como
// "não encontrado" sem consultar o servidor (espelha o ExampleDetailPage).
const VALID_ID = /^[1-9]\d*$/

export interface DetailField<T> {
  label: string
  field: keyof T
  /**
   * Formata o valor do campo. Sem `render`, usa `String(value)` (— quando nulo),
   * então os campos devem ser escalares; use `render` para datas/objetos/JSX.
   */
  render?: (value: T[keyof T], item: T) => ReactNode
}

interface DetailViewProps<T> {
  /** Base do recurso; o id é anexado como `${endpoint}/${id}`. */
  endpoint: string
  /** Id vindo da rota (useParams); undefined/ inválido → não encontrado. */
  id: string | undefined
  /** Campos a exibir (read-only), na ordem. */
  fields: DetailField<T>[]
  /** Ação "Editar": recebe o item carregado. Botão oculto quando ausente. */
  onEdit?: (item: T) => void
  editLabel?: string

  // Overrides dos estados compartilhados (#27).
  loadingState?: ReactNode
  /** Mostrado apenas no 404 (registro não encontrado), não em outros erros. */
  emptyState?: ReactNode
  errorState?: (error: Error, retry: () => void) => ReactNode
}

/**
 * Exibição genérica (read-only) de uma entidade carregada por id, configurável
 * por `fields` — espelha o PaginatedList (#23) para a tela de Detalhes (#24).
 * Consome o GET `/{recurso}/{id}` (base da #29) e os estados da #27; o 404 no
 * formato ApiError vira "registro não encontrado".
 *
 * loading/item/error são DERIVADOS de uma request key (`endpoint/id#refresh`),
 * então trocar `id`/`endpoint` com o componente montado reseta na hora (sem
 * exibir o item anterior nem perder o 404 de um id inválido).
 */
export function DetailView<T>({
  endpoint,
  id,
  fields,
  onEdit,
  editLabel = 'Editar',
  loadingState,
  emptyState,
  errorState,
}: DetailViewProps<T>) {
  const validId = Boolean(id && VALID_ID.test(id))
  const requestKey = `${endpoint}/${id}#`

  const [result, setResult] = useState<{
    key: string
    item: T | null
    error: Error | null
  } | null>(null)
  const [refresh, setRefresh] = useState(0)

  const activeKey = `${requestKey}${refresh}`
  // current só "resolve" quando o resultado em estado é o da requisição atual;
  // ao trocar id/endpoint/refresh a chave muda e tudo volta a loading na hora.
  const current = result?.key === activeKey ? result : null
  const loading = validId && current === null
  const item = current?.item ?? null
  const error = !validId
    ? new ApiError('Registro não encontrado.', { status: 404 })
    : (current?.error ?? null)

  const retry = useCallback(() => setRefresh((value) => value + 1), [])

  useEffect(() => {
    if (!validId) return

    const controller = new AbortController()

    async function load() {
      try {
        const loaded = await apiFetch<T>(`${endpoint}/${id}`, { signal: controller.signal })
        if (!controller.signal.aborted) setResult({ key: activeKey, item: loaded, error: null })
      } catch (cause) {
        if (controller.signal.aborted) return
        setResult({
          key: activeKey,
          item: null,
          error: cause instanceof Error
            ? cause
            : new Error('Não foi possível carregar o registro.'),
        })
      }
    }

    void load()

    return () => controller.abort()
  }, [endpoint, id, validId, activeKey])

  if (loading) {
    return <>{loadingState ?? <LoadingState message="Carregando registro..." />}</>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <>
        {emptyState ?? (
          <EmptyState
            title="Registro não encontrado"
            description="O registro não existe ou foi removido."
          />
        )}
      </>
    )
  }

  if (error) {
    return <>{errorState ? errorState(error, retry) : <ErrorState message={error.message} onRetry={retry} />}</>
  }

  if (!item) return null

  return (
    <Stack spacing={2}>
      <Stack
        component="dl"
        spacing={1.5}
        sx={{ m: 0, '& dd': { m: 0, overflowWrap: 'anywhere' } }}
      >
        {fields.map((field) => {
          const value = item[field.field]
          return (
            <Box key={String(field.field)}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {field.label}
              </Typography>
              <Typography component="dd" variant="body1">
                {field.render ? field.render(value, item) : String(value ?? '—')}
              </Typography>
            </Box>
          )
        })}
      </Stack>

      {onEdit && (
        <Button
          variant="contained"
          onClick={() => onEdit(item)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {editLabel}
        </Button>
      )}
    </Stack>
  )
}
