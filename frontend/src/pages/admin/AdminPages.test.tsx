import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../App'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
})
const page = <T,>(content: T[]) => ({
  content, page: 0, size: 10, totalElements: content.length, totalPages: 1,
  first: true, last: true, sort: 'UNSORTED',
})

const usuario = {
  id: 7, nome: 'Ana Gestora', email: 'ana@ong.org', ativo: true,
  cargos: [{ id: 1, nome: 'ADMINISTRADOR' }],
}

async function renderApp() {
  await act(async () => { render(<App />) })
}

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/Sistema-Girassol/')
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe('Telas de administração RBAC (#3)', () => {
  it('lista usuários e envia a busca q à API quando há USUARIO:READ', async () => {
    const fetchMock = vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost')
      if (url.pathname === '/api/auth/me') {
        return json({ id: 1, email: 'admin@ong.org', permissions: ['USUARIO:READ'] })
      }
      if (url.pathname === '/api/usuarios') return json(page([usuario]))
      throw new Error(`Endpoint inesperado: ${url.pathname}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    window.history.pushState({}, '', '/Sistema-Girassol/admin/usuarios')
    await renderApp()

    expect(await screen.findByRole('heading', { name: 'Usuários' })).toBeInTheDocument()
    expect(await screen.findByText('ana@ong.org')).toBeInTheDocument()
    expect(screen.getByText('ADMINISTRADOR')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Buscar por nome ou e-mail' }),
      { target: { value: 'ana' } },
    )
    await waitFor(() => {
      const url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
      expect(url.pathname).toBe('/api/usuarios')
      expect(url.searchParams.get('q')).toBe('ana')
    })
  })

  it('redireciona para /403 e não consulta a API sem USUARIO:READ', async () => {
    const fetchMock = vi.fn(async () => json({ id: 1, email: 'x@ong.org', permissions: [] }))
    vi.stubGlobal('fetch', fetchMock)
    window.history.pushState({}, '', '/Sistema-Girassol/admin/usuarios')
    await renderApp()

    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/403'))
    expect(fetchMock.mock.calls.length).toBe(1)
  })

  it('lista cargos com suas permissões', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost')
      if (url.pathname === '/api/auth/me') {
        return json({ id: 1, email: 'admin@ong.org', permissions: ['CARGO:READ'] })
      }
      if (url.pathname === '/api/cargos') {
        return json(page([{ id: 2, nome: 'GERENTE', totalUsuarios: 3, permissoes: [{ id: 9, codigo: 'FAMILIA:READ' }] }]))
      }
      throw new Error(`Endpoint inesperado: ${url.pathname}`)
    }))
    window.history.pushState({}, '', '/Sistema-Girassol/admin/cargos')
    await renderApp()

    expect(await screen.findByRole('heading', { name: 'Cargos' })).toBeInTheDocument()
    expect(await screen.findByText('GERENTE')).toBeInTheDocument()
    expect(screen.getByText('FAMILIA:READ')).toBeInTheDocument()
  })

  it('lista permissões do catálogo', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost')
      if (url.pathname === '/api/auth/me') {
        return json({ id: 1, email: 'admin@ong.org', permissions: ['PERMISSAO:READ'] })
      }
      if (url.pathname === '/api/permissoes') {
        return json(page([{ id: 5, codigo: 'FAMILIA:READ' }]))
      }
      throw new Error(`Endpoint inesperado: ${url.pathname}`)
    }))
    window.history.pushState({}, '', '/Sistema-Girassol/admin/permissoes')
    await renderApp()

    expect(await screen.findByRole('heading', { name: 'Permissões' })).toBeInTheDocument()
    expect(await screen.findByText('FAMILIA:READ')).toBeInTheDocument()
  })

  it('abre o detalhe de um usuário por id (DetailView)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost')
      if (url.pathname === '/api/auth/me') {
        return json({ id: 1, email: 'admin@ong.org', permissions: ['USUARIO:READ'] })
      }
      if (url.pathname === '/api/usuarios/7') return json(usuario)
      throw new Error(`Endpoint inesperado: ${url.pathname}`)
    }))
    window.history.pushState({}, '', '/Sistema-Girassol/admin/usuarios/7')
    await renderApp()

    expect(await screen.findByRole('heading', { name: 'Detalhes do usuário' })).toBeInTheDocument()
    expect(await screen.findByText('ana@ong.org')).toBeInTheDocument()
    expect(screen.getByText('ADMINISTRADOR')).toBeInTheDocument()
  })

  it('navega da listagem para o detalhe ao clicar em Ver detalhes', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost')
      if (url.pathname === '/api/auth/me') {
        return json({ id: 1, email: 'admin@ong.org', permissions: ['USUARIO:READ'] })
      }
      if (url.pathname === '/api/usuarios') return json(page([usuario]))
      if (url.pathname === '/api/usuarios/7') return json(usuario)
      throw new Error(`Endpoint inesperado: ${url.pathname}`)
    }))
    window.history.pushState({}, '', '/Sistema-Girassol/admin/usuarios')
    await renderApp()

    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalhes' }))
    expect(await screen.findByRole('heading', { name: 'Detalhes do usuário' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/Sistema-Girassol/admin/usuarios/7')
  })
})
