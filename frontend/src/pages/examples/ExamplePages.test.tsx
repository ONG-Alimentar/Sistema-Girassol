import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../App'

const item = {
  id: 2,
  name: 'Registro Beta',
  category: 'Categoria B',
  date: '2026-02-15',
}

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

beforeAll(async () => {
  await Promise.all([
    import('./ExampleListPage'),
    import('./ExampleDetailPage'),
  ])
}, 60000)

async function renderApp() {
  await act(async () => {
    render(<App />)
  })
}

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/Sistema-Girassol/')
  vi.stubEnv('DEV', true)

  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/api/auth/me')) {
      return response({
        id: 1,
        email: 'teste@example.org',
        permissions: [],
      })
    }

    if (url.includes('/api/examples/listagem?')) {
      return response({
        content: [item],
        page: 0,
        size: 3,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        sort: 'UNSORTED',
      })
    }

    if (url.endsWith('/api/examples/listagem/2')) {
      return response(item)
    }

    return response({
      message: 'Registro de exemplo não encontrado.',
    }, 404)
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('Demonstração autenticada da listagem', () => {
  it('navega do card ao detalhe via API e volta à listagem, respeitando o basename', async () => {
    window.history.pushState({}, '', '/Sistema-Girassol/examples/listagem')
    await renderApp()

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: /Registro Beta/ },
        { timeout: 5000 },
      ),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Detalhes do registro de exemplo',
      }),
    ).toBeInTheDocument()

    expect(await screen.findByText('Registro Beta')).toBeInTheDocument()
    expect(window.location.pathname).toBe(
      '/Sistema-Girassol/examples/listagem/2',
    )

    const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

    expect(fetch).toHaveBeenCalledWith(
      `${apiBase}/api/examples/listagem/2`,
      expect.objectContaining({ credentials: 'include' }),
    )

    fireEvent.click(screen.getByRole('link', {
      name: 'Voltar à listagem',
    }))

    expect(
      await screen.findByRole('heading', { name: 'Listagem de exemplo' }),
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('button', { name: /Registro Beta/ }),
    ).toBeInTheDocument()
  })

  it('abre o detalhe diretamente sem depender do estado da navegação', async () => {
    window.history.pushState({}, '', '/Sistema-Girassol/examples/listagem/2')
    await renderApp()

    expect(await screen.findByText('Registro Beta')).toBeInTheDocument()
  })

  it('mostra o estado não encontrado para id inexistente', async () => {
    window.history.pushState({}, '', '/Sistema-Girassol/examples/listagem/999')
    await renderApp()

    expect(
      await screen.findByText('Registro não encontrado'),
    ).toBeInTheDocument()
  })

  it('protege o exemplo quando não há sessão', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({}, 401)))
    window.history.pushState({}, '', '/Sistema-Girassol/examples/listagem')
    await renderApp()

    expect(
      await screen.findByRole('button', { name: /entrar/i }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', { name: 'Listagem de exemplo' }),
    ).not.toBeInTheDocument()
  })

  it('não expõe as rotas de exemplo em produção', async () => {
    vi.stubEnv('DEV', false)
    window.history.pushState({}, '', '/Sistema-Girassol/examples/listagem')
    await renderApp()

    expect(
      await screen.findByText(/Página não encontrada/i),
    ).toBeInTheDocument()

    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/examples/'),
      expect.anything(),
    )
  })
})