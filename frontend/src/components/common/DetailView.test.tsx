import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DetailView, type DetailField } from './DetailView'

interface Item { id: number; name: string; category: string }

const item: Item = { id: 1, name: 'Registro Alfa', category: 'Categoria A' }

const fields: DetailField<Item>[] = [
  { field: 'name', label: 'Nome' },
  { field: 'category', label: 'Categoria' },
]

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

function mount(props: Partial<React.ComponentProps<typeof DetailView<Item>>> = {}) {
  return render(
    <DetailView<Item>
      endpoint="/api/examples/listagem"
      id="1"
      fields={fields}
      {...props}
    />,
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('DetailView — tela de Detalhes genérica (#24)', () => {
  it('busca por id e exibe os campos configurados', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(item))
    vi.stubGlobal('fetch', fetchMock)

    mount()

    expect(await screen.findByText('Registro Alfa')).toBeInTheDocument()
    expect(screen.getByText('Categoria A')).toBeInTheDocument()
    const url = String(fetchMock.mock.calls.at(-1)?.[0])
    expect(url).toContain('/api/examples/listagem/1')
  })

  it('mostra "não encontrado" quando o backend responde 404 (ApiError)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      response({ message: 'Registro de exemplo não encontrado.' }, 404),
    ))

    mount()

    expect(await screen.findByText('Registro não encontrado')).toBeInTheDocument()
  })

  it('trata id inválido como não encontrado sem chamar a API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    mount({ id: 'abc' })

    expect(await screen.findByText('Registro não encontrado')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mostra erro e o retry refaz a busca', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ message: 'Falha' }, 500))
      .mockResolvedValueOnce(response(item))
    vi.stubGlobal('fetch', fetchMock)

    mount()

    fireEvent.click(await screen.findByRole('button', { name: /tentar novamente/i }))

    expect(await screen.findByText('Registro Alfa')).toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })

  it('aciona onEdit com o item carregado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(item)))
    const onEdit = vi.fn()

    mount({ onEdit })

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(item)
  })
})
