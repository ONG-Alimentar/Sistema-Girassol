import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App.tsx'

/**
 * Guarda de regressão do roteamento em produção (GitHub Pages, subpath
 * /Sistema-Girassol/). Dois bugs faziam o app em prod cair sempre na
 * NotFoundPage e nunca chamar o backend:
 *
 *  1. BrowserRouter sem basename → nenhuma rota casava com /Sistema-Girassol/...
 *  2. AuthProvider não montado → useAuth() quebrava (e a API sumia por
 *     tree-shaking).
 *
 * Aqui o App roda com basename = import.meta.env.BASE_URL, que o vitest.config
 * fixa em '/Sistema-Girassol/' (igual ao build de prod). Se qualquer um dos dois
 * bugs voltar, estes testes falham: rota sem basename → NotFoundPage; sem
 * AuthProvider → useAuth() lança ao renderizar a tela de login.
 */
describe('App — roteamento no subpath de produção', () => {
  beforeEach(() => {
    // Reproduz o subpath do build de produção (GitHub Pages). O App usa
    // basename={import.meta.env.BASE_URL}; sem o basename certo, nenhuma rota
    // casaria e tudo cairia na NotFoundPage — exatamente o bug sob guarda.
    vi.stubEnv('BASE_URL', '/Sistema-Girassol/')
    // AuthProvider chama /api/auth/me no mount; sem sessão, a chamada falha e o
    // usuário fica deslogado (→ redireciona para /login).
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

    // Sem sessão, RequireAuth manda para /login — prova de que a raiz casa uma
    // rota (o bug do basename fazia cair no fallback '* → /404').
    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.queryByText(/Página não encontrada/i)).not.toBeInTheDocument()
  })
})
