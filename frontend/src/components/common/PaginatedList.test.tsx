import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PaginatedList as Page } from '../../api/pagination'
import { PaginatedList } from './PaginatedList'

interface Item { id: number; name: string }

const item: Item = { id: 1, name: 'Registro Alfa' }

function page(content: Item[] = [item], overrides: Partial<Page<Item>> = {}): Page<Item> {
  return {
    content, page: 0, size: 5, totalElements: content.length,
    totalPages: content.length ? 1 : 0, first: true, last: true,
    sort: 'UNSORTED', ...overrides,
  }
}

function response(data: Page<Item>) {
  return new Response(JSON.stringify(data), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}

function mount(onItemClick?: (item: Item) => void) {
  return render(
    <PaginatedList<Item>
      endpoint="/api/examples/listagem"
      columns={[{ field: 'name', label: 'Nome' }]}
      filters={[
        { param: 'search', label: 'Buscar por nome', type: 'text' },
        { param: 'startDate', label: 'Data inicial', type: 'date' },
      ]}
      initialPageSize={5}
      getItemKey={(value) => value.id}
      onItemClick={onItemClick}
    />,
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('PaginatedList — contrato da #29 e feedback da #27', () => {
  it('mantém o campo e o foco durante loading e resultado vazio', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(page()))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => {
        completeSearch = resolve
      }))
    let completeSearch: ((value: Response) => void) | undefined
    vi.stubGlobal('fetch', fetchMock)
    mount()
    await screen.findByText('Registro Alfa')

    const input = screen.getByRole('textbox', { name: 'Buscar por nome' })
    act(() => { input.focus() })
    fireEvent.change(input, { target: { value: 'inexistente' } })
    expect(await screen.findByText('Carregando listagem...')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Buscar por nome' })).toBe(input)
    expect(input).toHaveFocus()

    await act(async () => { completeSearch?.(response(page([]))) })
    expect(await screen.findByText('Nenhum registro encontrado')).toBeInTheDocument()
    expect(input).toHaveFocus()

    fetchMock.mockResolvedValueOnce(response(page()))
    fireEvent.change(input, { target: { value: '' } })
    expect(await screen.findByText('Registro Alfa')).toBeInTheDocument()
    const url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(url.searchParams.has('search')).toBe(false)
  })

  it('mostra ErrorState e repete a consulta sem remover os filtros', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Falha de rede'))
      .mockResolvedValueOnce(response(page()))
    vi.stubGlobal('fetch', fetchMock)
    mount()

    expect(await screen.findByText('Falha de rede')).toBeInTheDocument()
    expect(screen.getByText('Ocorreu um erro')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Buscar por nome' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(await screen.findByText('Registro Alfa')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('usa paginação zero-based e reinicia a página ao filtrar por data', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(page([item], {
        totalElements: 6, totalPages: 2, last: false,
      })))
      .mockResolvedValueOnce(response(page([{ id: 6, name: 'Registro Zeta' }], {
        page: 1, totalElements: 6, totalPages: 2, first: false,
      })))
      .mockResolvedValueOnce(response(page()))
    vi.stubGlobal('fetch', fetchMock)
    mount()
    await screen.findByText('Registro Alfa')
    fireEvent.click(screen.getByRole('button', { name: /go to page 2/i }))
    await screen.findByText('Registro Zeta')

    let url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('size')).toBe('5')

    fireEvent.change(screen.getByLabelText('Data inicial'), {
      target: { value: '2026-03-01' },
    })
    await screen.findByText('Registro Alfa')
    url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.get('startDate')).toBe('2026-03-01')
  })

  it('envia ordenação ao servidor e entrega o item ao callback de detalhe', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response(page())))
    const onItemClick = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    mount(onItemClick)
    await screen.findByText('Registro Alfa')

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Ordenar por' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Nome' }))
    await waitFor(() => {
      const url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
      expect(url.searchParams.get('sort')).toBe('name,asc')
    })
    fireEvent.click(await screen.findByRole('button', { name: /Registro Alfa/ }))
    expect(onItemClick).toHaveBeenCalledWith(item)
  })
})
