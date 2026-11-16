import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'
import type { Permission } from '../../auth/permissions.ts'

const familia = { id: 7, nome: 'Família Silva' }

const cesta = {
  id: 5,
  data: '2026-03-10',
  familiaId: 7,
  familiaNome: 'Família Silva',
  itens: [
    { id: 1, descricao: 'Arroz', quantidade: 2 },
    { id: 2, descricao: 'Feijão', quantidade: 1.5 },
  ],
}

const page = (content: unknown[]) => ({
  content, page: 0, size: 10, totalElements: content.length,
  totalPages: content.length === 0 ? 0 : 1, first: true, last: true, sort: 'UNSORTED',
})

/** Data ISO no mês/ano correntes, para exercitar o indicador "Este mês". */
function esteMesISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('CestasPage — listagem (#6)', () => {
  it('lista doações da família (contexto ?familia=) e marca "Este mês"', async () => {
    const atual = { ...cesta, id: 8, data: esteMesISO() }
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/api/cestas')) {
        expect(url).toContain('familia=7')
        return jsonResponse(page([atual, { ...cesta, data: '2000-01-05' }]))
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['CESTA:READ', 'CESTA:CREATE'] },
      path: '/cestas?familia=7',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Doações de cesta' })).toBeInTheDocument()
    expect(await screen.findAllByText('Família Silva')).not.toHaveLength(0)
    expect(screen.getByText('Este mês')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nova doação/i })).toBeInTheDocument()
  })

  it('oculta "Nova doação" sem CESTA:CREATE e navega ao detalhe no clique', async () => {
    await renderAuthedApp({
      me: { permissions: ['CESTA:READ'] },
      path: '/cestas',
      fetchHandler: (url) => (url.includes('/api/cestas') ? jsonResponse(page([cesta])) : jsonResponse({}, 404)),
    })

    await screen.findByText('Família Silva')
    expect(screen.queryByRole('button', { name: /nova doação/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Família Silva'))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/cestas/5'))
  })
})

describe('CestaDetailPage — detalhe (#6)', () => {
  function handler(url: string, init?: RequestInit) {
    if (url.endsWith('/api/cestas/5')) {
      if (init?.method === 'DELETE') return new Response(null, { status: 204 })
      return jsonResponse(cesta)
    }
    if (url.includes('/api/cestas')) return jsonResponse(page([]))
    return jsonResponse({}, 404)
  }

  function open(permissions: Permission[], path = '/cestas/5') {
    return renderAuthedApp({ me: { permissions }, path, fetchHandler: handler })
  }

  it('exibe família, data formatada e itens', async () => {
    await open(['CESTA:READ'])
    expect(await screen.findByText('Família Silva')).toBeInTheDocument()
    expect(screen.getByText('10/03/2026')).toBeInTheDocument()
    expect(screen.getByText(/Arroz/)).toBeInTheDocument()
    expect(screen.getByText(/Feijão/)).toBeInTheDocument()
  })

  it('mostra "não encontrado" para id inexistente', async () => {
    await renderAuthedApp({
      me: { permissions: ['CESTA:READ'] },
      path: '/cestas/999',
      fetchHandler: (url) =>
        url.endsWith('/api/cestas/999') ? jsonResponse({ message: 'não encontrada' }, 404) : jsonResponse({}, 404),
    })
    expect(await screen.findByText('Registro não encontrado')).toBeInTheDocument()
  })

  it('oculta Excluir/Editar sem permissão', async () => {
    await open(['CESTA:READ'])
    await screen.findByText('Família Silva')
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('exclui com confirmação (DELETE) e volta à listagem', async () => {
    await open(['CESTA:READ', 'CESTA:DELETE'])
    fireEvent.click(await screen.findByRole('button', { name: 'Excluir' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/cestas'))
  })
})

describe('CestaFormPage — criação (#6)', () => {
  it('pré-seleciona a família do ?familia=, adiciona item e envia POST', async () => {
    let posted: unknown
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/api/familias')) return jsonResponse(page([familia]))
      if (url.endsWith('/api/cestas') && init?.method === 'POST') {
        posted = JSON.parse(String(init.body))
        return jsonResponse({ ...cesta, id: 99 }, 201)
      }
      return jsonResponse({}, 404)
    })
    await renderAuthedApp({
      me: { permissions: ['CESTA:CREATE', 'CESTA:READ'] },
      path: '/cestas/novo?familia=7',
      fetchHandler: fetchMock,
    })

    expect(await screen.findByRole('heading', { name: 'Nova doação de cesta' })).toBeInTheDocument()
    // Família pré-selecionada a partir do ?familia=7.
    await waitFor(() => expect(screen.getByText('Família Silva')).toBeInTheDocument())

    // Adiciona um item via Repeater.
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    fireEvent.change(screen.getByRole('textbox', { name: /descrição/i }), { target: { value: 'Óleo' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: /quantidade/i }), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    // Envia a doação.
    fireEvent.click(await screen.findByRole('button', { name: 'Salvar doação' }))

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/cestas/99'))
    expect(posted).toEqual({ familiaId: 7, data: null, itens: [{ descricao: 'Óleo', quantidade: 3 }] })
  })
})
