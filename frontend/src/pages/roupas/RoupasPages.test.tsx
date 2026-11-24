import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'
import type { Permission } from '../../auth/permissions.ts'

const familia = { id: 7, nome: 'Família Silva' }

const roupa = {
  id: 5,
  data: '2026-03-10',
  quantidade: 4,
  familiaId: 7,
  familiaNome: 'Família Silva',
  pecas: [
    { id: 1, descricao: 'Camiseta', tamanho: 'M', genero: 'MASCULINO' },
    { id: 2, descricao: 'Vestido', tamanho: 'P', genero: 'FEMININO' },
  ],
}

const page = (content: unknown[]) => ({
  content, page: 0, size: 10, totalElements: content.length,
  totalPages: content.length === 0 ? 0 : 1, first: true, last: true, sort: 'UNSORTED',
})

/** Data ISO de hoje, para exercitar o indicador "Recebeu hoje". */
function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('RoupasPage — listagem (#7)', () => {
  it('lista doações da família (contexto ?familia=) e marca "Recebeu hoje"', async () => {
    const hoje = { ...roupa, id: 8, data: hojeISO() }
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/api/roupas')) {
        expect(url).toContain('familia=7')
        return jsonResponse(page([hoje, { ...roupa, data: '2000-01-05' }]))
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['ROUPA:READ', 'ROUPA:CREATE'] },
      path: '/roupas?familia=7',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Doações de roupa' })).toBeInTheDocument()
    expect(await screen.findAllByText('Família Silva')).not.toHaveLength(0)
    expect(screen.getByText('Recebeu hoje')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nova doação/i })).toBeInTheDocument()
  })

  it('oculta "Nova doação" sem ROUPA:CREATE e navega ao detalhe no clique', async () => {
    await renderAuthedApp({
      me: { permissions: ['ROUPA:READ'] },
      path: '/roupas',
      fetchHandler: (url) => (url.includes('/api/roupas') ? jsonResponse(page([roupa])) : jsonResponse({}, 404)),
    })

    await screen.findByText('Família Silva')
    expect(screen.queryByRole('button', { name: /nova doação/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Família Silva'))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/roupas/5'))
  })
})

describe('RoupaDetailPage — detalhe (#7)', () => {
  function handler(url: string, init?: RequestInit) {
    if (url.endsWith('/api/roupas/5')) {
      if (init?.method === 'DELETE') return new Response(null, { status: 204 })
      return jsonResponse(roupa)
    }
    if (url.includes('/api/roupas')) return jsonResponse(page([]))
    return jsonResponse({}, 404)
  }

  function open(permissions: Permission[], path = '/roupas/5') {
    return renderAuthedApp({ me: { permissions }, path, fetchHandler: handler })
  }

  it('exibe família, data formatada, quantidade e peças', async () => {
    await open(['ROUPA:READ'])
    expect(await screen.findByText('Família Silva')).toBeInTheDocument()
    expect(screen.getByText('10/03/2026')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/Camiseta/)).toBeInTheDocument()
    expect(screen.getByText(/Vestido/)).toBeInTheDocument()
  })

  it('mostra "não encontrado" para id inexistente', async () => {
    await renderAuthedApp({
      me: { permissions: ['ROUPA:READ'] },
      path: '/roupas/999',
      fetchHandler: (url) =>
        url.endsWith('/api/roupas/999') ? jsonResponse({ message: 'não encontrada' }, 404) : jsonResponse({}, 404),
    })
    expect(await screen.findByText('Registro não encontrado')).toBeInTheDocument()
  })

  it('oculta Excluir sem permissão (e não há Editar)', async () => {
    await open(['ROUPA:READ'])
    await screen.findByText('Família Silva')
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('exclui com confirmação (DELETE) e volta à listagem', async () => {
    await open(['ROUPA:READ', 'ROUPA:DELETE'])
    fireEvent.click(await screen.findByRole('button', { name: 'Excluir' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/roupas'))
  })
})

describe('RoupaFormPage — criação (#7)', () => {
  it('pré-seleciona a família do ?familia=, salva sem peças e envia POST', async () => {
    let posted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/familias')) return jsonResponse(page([familia]))
      if (url.endsWith('/api/roupas') && init?.method === 'POST') {
        posted = JSON.parse(String(init.body))
        return jsonResponse({ ...roupa, id: 99 }, 201)
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['ROUPA:CREATE', 'ROUPA:READ'] },
      path: '/roupas/novo?familia=7',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Nova doação de roupa' })).toBeInTheDocument()
    // Família pré-selecionada a partir do ?familia=7.
    await waitFor(() => expect(screen.getByText('Família Silva')).toBeInTheDocument())

    fireEvent.change(screen.getByRole('spinbutton', { name: /quantidade de peças/i }), { target: { value: '2' } })

    // Envia a doação sem detalhar peças.
    fireEvent.click(await screen.findByRole('button', { name: 'Salvar doação' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/roupas/99'))
    expect(posted).toEqual({ familiaId: 7, data: null, quantidade: 2, pecas: [] })
  })

  it('adiciona uma peça via Repeater e envia no payload', async () => {
    let posted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/familias')) return jsonResponse(page([familia]))
      if (url.endsWith('/api/roupas') && init?.method === 'POST') {
        posted = JSON.parse(String(init.body))
        return jsonResponse({ ...roupa, id: 100 }, 201)
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['ROUPA:CREATE', 'ROUPA:READ'] },
      path: '/roupas/novo?familia=7',
      fetchHandler: fetchMock,
    })

    await waitFor(() => expect(screen.getByText('Família Silva')).toBeInTheDocument())
    fireEvent.change(screen.getByRole('spinbutton', { name: /quantidade de peças/i }), { target: { value: '1' } })

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    fireEvent.change(screen.getByRole('textbox', { name: /descrição/i }), { target: { value: 'Casaco' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Salvar doação' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/roupas/100'))
    expect(posted).toEqual({
      familiaId: 7, data: null, quantidade: 1,
      pecas: [{ descricao: 'Casaco', tamanho: null, genero: null }],
    })
  })
})
