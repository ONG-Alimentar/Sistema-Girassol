import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App.tsx'

/**
 * Guarda de regressão do roteamento em produção (GitHub Pages, subpath
 * /Sistema-Girassol/): BrowserRouter sem basename ou AuthProvider não montado
 * faziam o app cair sempre na NotFoundPage e nunca chamar o backend. Roda com
 * basename = import.meta.env.BASE_URL, fixado em '/Sistema-Girassol/' pelo
 * vitest.config (igual ao build de prod).
 */
describe('App — roteamento no subpath de produção', () => {
  beforeEach(() => {
    vi.stubEnv('BASE_URL', '/Sistema-Girassol/')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sem rede no teste')))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('renderiza a tela de login em /Sistema-Girassol/login (não a 404)', async () => {
    window.history.pushState({}, '', '/Sistema-Girassol/login')

    render(<App />)

    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.queryByText(/Página não encontrada/i)).not.toBeInTheDocument()
  })

  it('na raiz /Sistema-Girassol/ redireciona para o login (não cai na 404)', async () => {
    window.history.pushState({}, '', '/Sistema-Girassol/')

    render(<App />)

    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.queryByText(/Página não encontrada/i)).not.toBeInTheDocument()
  })
})
