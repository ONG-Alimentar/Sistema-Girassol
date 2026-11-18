import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App.tsx'

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
