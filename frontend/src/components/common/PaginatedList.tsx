import { useCallback, useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'

import { apiFetch } from '../../api/client'
import type {
  PaginatedList as PaginatedListResponse,
} from '../../api/pagination'

export interface ListColumn<T> {
  label: string
  field: keyof T
  sortable?: boolean
  render?: (value: T[keyof T], item: T) => ReactNode
}

export interface ListFilter {
  label: string
  // page, size e sort são reservados ao componente.
  param: string
  type: 'text' | 'date'
}

interface PaginatedListProps<T> {
  endpoint: string
  columns: ListColumn<T>[]
  filters?: ListFilter[]
  mode?: 'cards' | 'table'
  initialPageSize?: number
  pageSizeOptions?: number[]
  getItemKey: (item: T) => string | number
  onItemClick?: (item: T) => void
  renderCard?: (item: T) => ReactNode

  // Pontos de integração com os componentes compartilhados da #27.
  loadingState?: ReactNode
  emptyState?: ReactNode
  errorState?: (error: Error, retry: () => void) => ReactNode
}

export function PaginatedList<T>({
  endpoint,
  columns,
  filters = [],
  mode = 'cards',
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25],
  getItemKey,
  onItemClick,
  renderCard,
  loadingState,
  emptyState,
  errorState,
}: PaginatedListProps<T>) {
  const listId = useId()

  const [data, setData] = useState<PaginatedListResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(initialPageSize)
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [refresh, setRefresh] = useState(0)

  // Inclui o tamanho inicial mesmo se ele não estiver nas opções recebidas.
  const availablePageSizes = Array.from(
    new Set([...pageSizeOptions, size]),
  ).sort((a, b) => a - b)

  const retry = useCallback(() => {
    setRefresh((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const queryIndex = endpoint.indexOf('?')
        const path =
          queryIndex === -1 ? endpoint : endpoint.slice(0, queryIndex)
        const existingQuery =
          queryIndex === -1 ? '' : endpoint.slice(queryIndex + 1)

        const params = new URLSearchParams(existingQuery)

        Object.entries(filterValues).forEach(([param, value]) => {
          const normalizedValue = value.trim()

          if (normalizedValue) {
            params.set(param, normalizedValue)
          } else {
            params.delete(param)
          }
        })

        // Paginação e ordenação pertencem ao estado do componente.
        params.set('page', String(page))
        params.set('size', String(size))
        params.delete('sort')

        if (sortField) {
          params.set('sort', `${sortField},${sortDirection}`)
        }

        const result = await apiFetch<PaginatedListResponse<T>>(
          `${path}?${params.toString()}`,
          { signal: controller.signal },
        )

        if (controller.signal.aborted) return

        // Recupera a navegação se a quantidade de páginas diminuir.
        const lastPage = Math.max(result.totalPages - 1, 0)

        if (page > lastPage) {
          setPage(lastPage)
          return
        }

        setData(result)
      } catch (cause) {
        if (controller.signal.aborted) return

        setError(
          cause instanceof Error
            ? cause
            : new Error('Não foi possível carregar a listagem.'),
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => controller.abort()
  }, [
    endpoint,
    page,
    size,
    sortField,
    sortDirection,
    filterValues,
    refresh,
  ])

  function updateFilter(param: string, value: string) {
    setFilterValues((current) => ({
      ...current,
      [param]: value,
    }))
    setPage(0)
  }

  function updateSort(field: string) {
    if (sortField === field) {
      setSortDirection((current) => (
        current === 'asc' ? 'desc' : 'asc'
      ))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }

    setPage(0)
  }

  function changeSortField(field: string) {
    setSortField(field)
    setPage(0)
  }

  function changePageSize(value: number) {
    setSize(value)
    setPage(0)
  }

  function getColumnValue(item: T, column: ListColumn<T>): ReactNode {
    const value = item[column.field]

    return column.render
      ? column.render(value, item)
      : String(value ?? '—')
  }

  function renderItemCard(item: T) {
    const content = renderCard ? (
      renderCard(item)
    ) : (
      <Stack spacing={1}>
        {columns.map((column) => (
          <Box key={String(column.field)}>
            <Typography variant="caption" color="text.secondary">
              {column.label}
            </Typography>

            <Typography component="div" variant="body2">
              {getColumnValue(item, column)}
            </Typography>
          </Box>
        ))}
      </Stack>
    )

    return (
      <Card key={getItemKey(item)} variant="outlined">
        {onItemClick ? (
          <CardActionArea onClick={() => onItemClick(item)}>
            <CardContent>{content}</CardContent>
          </CardActionArea>
        ) : (
          <CardContent>{content}</CardContent>
        )}
      </Card>
    )
  }

  function renderResults(): ReactNode {
    // Fallbacks provisórios até a integração com a #27.
    if (loading) {
      return loadingState ?? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress aria-label="Carregando listagem" />
        </Box>
      )
    }

    if (error) {
      return errorState ? (
        errorState(error, retry)
      ) : (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={retry}>
              Tentar novamente
            </Button>
          }
        >
          {error.message}
        </Alert>
      )
    }

    if (!data || data.content.length === 0) {
      return emptyState ?? (
        <Typography
          role="status"
          sx={{ color: 'text.secondary', textAlign: 'center', p: 4 }}
        >
          Nenhum registro encontrado.
        </Typography>
      )
    }

    if (mode === 'cards') {
      return (
        <Stack spacing={2}>
          {data.content.map((item) => renderItemCard(item))}
        </Stack>
      )
    }

    return (
      <TableContainer>
        <Table aria-label="Listagem de registros">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.field)}
                  sortDirection={
                    sortField === String(column.field)
                      ? sortDirection
                      : false
                  }
                >
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <TableSortLabel
                      active={sortField === String(column.field)}
                      direction={
                        sortField === String(column.field)
                          ? sortDirection
                          : 'asc'
                      }
                      onClick={() => updateSort(String(column.field))}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}

              {onItemClick && <TableCell>Ações</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.content.map((item) => (
              <TableRow
                key={getItemKey(item)}
                hover={Boolean(onItemClick)}
                onClick={
                  onItemClick ? () => onItemClick(item) : undefined
                }
                sx={{
                  cursor: onItemClick ? 'pointer' : 'default',
                }}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.field)}>
                    {getColumnValue(item, column)}
                  </TableCell>
                ))}

                {onItemClick && (
                  <TableCell>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation()
                        onItemClick(item)
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Stack spacing={2}>
      {filters.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ flexWrap: 'wrap' }}
        >
          {filters.map((filter) => (
            <TextField
              key={filter.param}
              id={`${listId}-filter-${filter.param}`}
              label={filter.label}
              type={filter.type}
              value={filterValues[filter.param] ?? ''}
              onChange={(event) => (
                updateFilter(filter.param, event.target.value)
              )}
              fullWidth
              size="small"
              slotProps={{
                inputLabel: filter.type === 'date'
                  ? { shrink: true }
                  : undefined,
              }}
            />
          ))}
        </Stack>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id={`${listId}-sort-label`}>
            Ordenar por
          </InputLabel>

          <Select
            labelId={`${listId}-sort-label`}
            value={sortField}
            label="Ordenar por"
            onChange={(event) => changeSortField(event.target.value)}
          >
            <MenuItem value="">Padrão</MenuItem>

            {columns
              .filter((column) => column.sortable !== false)
              .map((column) => (
                <MenuItem
                  key={String(column.field)}
                  value={String(column.field)}
                >
                  {column.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 140 }}
          disabled={!sortField}
        >
          <InputLabel id={`${listId}-direction-label`}>
            Direção
          </InputLabel>

          <Select
            labelId={`${listId}-direction-label`}
            value={sortDirection}
            label="Direção"
            onChange={(event) => {
              const direction = event.target.value

              if (direction === 'asc' || direction === 'desc') {
                setSortDirection(direction)
                setPage(0)
              }
            }}
          >
            <MenuItem value="asc">Crescente</MenuItem>
            <MenuItem value="desc">Decrescente</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box aria-busy={loading}>
        {renderResults()}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id={`${listId}-size-label`}>
            Itens por página
          </InputLabel>

          <Select
            labelId={`${listId}-size-label`}
            value={size}
            label="Itens por página"
            onChange={(event) => (
              changePageSize(Number(event.target.value))
            )}
          >
            {availablePageSizes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!loading && !error && data && (
          <Typography variant="body2" color="text.secondary">
            {data.totalElements} registro(s)
          </Typography>
        )}

        {!loading && !error && data && data.totalPages > 0 && (
          <Pagination
            count={data.totalPages}
            page={page + 1}
            onChange={(_, value) => setPage(value - 1)}
            color="primary"
          />
        )}
      </Stack>
    </Stack>
  )
}