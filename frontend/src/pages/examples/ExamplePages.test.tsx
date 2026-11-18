import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonResponse, renderAuthedApp } from '../../test/appRender.tsx'

const item = {
  id: 2,
  name: 'Registro Beta',
  category: 'Categoria B',
  date: '2026-02-15',
}

function examplesHandler(url: string): Response {
  if (url.includes('/api/examples/listagem?')) {
    return jsonResponse({
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
    return jsonResponse(item)
  }

  return jsonResponse({ message: 'Registro de exemplo não encontrado.' }, 404)
}

beforeAll(async () => {
  await Promise.all([
    import('./ExampleListPage'),
    import('./ExampleDetailPage'),
    import('./ExampleEditPage'),
  ])
}, 60000)

beforeEach(() => {
  vi.stubEnv('DEV', true)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('Demonstração autenticada da listagem', () => {
  it('navega do card ao detalhe via API e volta à listagem, respeitando o basename', async () => {
    await renderAuthedApp({ path: '/examples/listagem', fetchHandler: examplesHandler })

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
    await renderAuthedApp({ path: '/examples/listagem/2', fetchHandler: examplesHandler })

    expect(await screen.findByText('Registro Beta')).toBeInTheDocument()
  })

  it('navega do detalhe para a edição (Detalhes → Edição)', async () => {
    await renderAuthedApp({ path: '/examples/listagem/2', fetchHandler: examplesHandler })

    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(
      await screen.findByRole('heading', { name: 'Edição de exemplo' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe(
      '/Sistema-Girassol/examples/listagem/2/editar',
    )
  })

  it('mostra o estado não encontrado para id inexistente', async () => {
    await renderAuthedApp({ path: '/examples/listagem/999', fetchHandler: examplesHandler })

    expect(
      await screen.findByText('Registro não encontrado'),
    ).toBeInTheDocument()
  })

  it('protege o exemplo quando não há sessão', async () => {
    await renderAuthedApp({ me: null, path: '/examples/listagem' })

    expect(
      await screen.findByRole('button', { name: /entrar/i }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', { name: 'Listagem de exemplo' }),
    ).not.toBeInTheDocument()
  })

  it('não expõe as rotas de exemplo em produção', async () => {
    vi.stubEnv('DEV', false)
    await renderAuthedApp({ path: '/examples/listagem' })

    expect(
      await screen.findByText(/Página não encontrada/i),
    ).toBeInTheDocument()

    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/examples/'),
      expect.anything(),
    )
  })
})
