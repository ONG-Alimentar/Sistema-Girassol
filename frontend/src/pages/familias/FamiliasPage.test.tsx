import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import { App } from '../../App'
import { AuthContext } from '../../auth/auth-context.ts'
import { FamiliasPage } from './FamiliasPage'

function AuthStub({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{ user: null, loading: false, login: async () => {}, logout: async () => {}, can: () => false }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const familia = { id: 12, nome: 'Família de teste', dataCadastro: '2026-11-12' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
})
const page = (content = [familia], index = 0) => ({
  content, page: index, size: 10, totalElements: 11, totalPages: 2,
  first: index === 0, last: index === 1, sort: 'UNSORTED',
})

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/Sistema-Girassol/')
  window.history.pushState({}, '', '/Sistema-Girassol/familias')
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe('Listagem real de famílias', () => {
  it('preserva a rota protegida e envia busca q, paginação e ordenação à API de famílias', async () => {
    const fetchMock = vi.fn(async (input: string) => {
      const url = new URL(input, 'http://localhost')
      if (url.pathname === '/api/auth/me') return json({ id: 1, email: 'teste@example.org', permissions: ['FAMILIA:READ'] })
      if (url.pathname === '/api/familias') {
        const index = Number(url.searchParams.get('page'))
        return json(page([{ ...familia, nome: index === 1 ? 'Outra família' : familia.nome }], index))
      }
      throw new Error(`Endpoint inesperado: ${url.pathname}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Famílias atendidas' })).toBeInTheDocument()
    expect(await screen.findByText(familia.nome)).toBeInTheDocument()
    expect(screen.getByText('Cadastrada em: 12/11/2026')).toBeInTheDocument()
    expect(screen.queryByText(/Atualizada em/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /go to page 2/i }))
    await screen.findByText('Outra família')
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar por nome' }), { target: { value: 'Ana' } })
    await screen.findByText(familia.nome)
    let url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
    expect(url.pathname).toBe('/api/familias')
    expect(url.searchParams.get('q')).toBe('Ana')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.has('search')).toBe(false)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Ordenar por' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Nome' }))
    await waitFor(() => {
      url = new URL(String(fetchMock.mock.calls.at(-1)?.[0]), 'http://localhost')
      expect(url.searchParams.get('sort')).toBe('nome,asc')
      expect(url.searchParams.get('q')).toBe('Ana')
    })
    await screen.findByText(familia.nome)
  })

  it('não consulta famílias quando o usuário não possui FAMILIA:READ', async () => {
    const fetchMock = vi.fn(async () => json({ id: 1, email: 'teste@example.org', permissions: [] }))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await waitFor(() => expect(window.location.pathname).toBe('/Sistema-Girassol/403'))
    expect(fetchMock.mock.calls.length).toBe(1)
  })

  it('mostra vazio e permite recuperar um erro sem recriar feedback', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(json({ message: 'Falha de consulta' }, 500))
      .mockResolvedValueOnce(json({ ...page([]), totalElements: 0, totalPages: 0 })))
    render(<AuthStub><MemoryRouter><FamiliasPage /></MemoryRouter></AuthStub>)
    expect(await screen.findByText('Falha de consulta')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(await screen.findByText('Nenhuma família encontrada')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Buscar por nome' })).toBeEnabled()
  })

  it('navega para o detalhe-hub (/familias/:id) ao clicar no card', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(page())))
    const DetalheStub = () => <span>detalhe-{useParams().id}</span>
    render(
      <AuthStub>
        <MemoryRouter initialEntries={['/familias']}>
          <Routes>
            <Route path="/familias" element={<FamiliasPage />} />
            <Route path="/familias/:id" element={<DetalheStub />} />
          </Routes>
        </MemoryRouter>
      </AuthStub>,
    )
    fireEvent.click(await screen.findByRole('button', { name: /Família de teste/ }))
    expect(await screen.findByText(`detalhe-${familia.id}`)).toBeInTheDocument()
  })
})
