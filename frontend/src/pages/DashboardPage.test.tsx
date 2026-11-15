import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import type { Permission } from '../auth/permissions.ts'

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** Monta o App autenticado na raiz, com o usuário retornado por /api/auth/me. */
async function renderHomeWith(permissions: Permission[], nome?: string) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/api/auth/me')) {
      return response({ id: 1, email: 'teste@example.org', nome, permissions })
    }
    return response({}, 404)
  }))
  window.history.pushState({}, '', '/Sistema-Girassol/')
  await act(async () => {
    render(<App />)
  })
}

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/Sistema-Girassol/')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('DashboardPage — home por Cargo', () => {
  it('saúda pelo cargo derivado e mostra o atalho de Usuários para Admin', async () => {
    await renderHomeWith(['CONTA:CREATE', 'FAMILIA:READ'])

    expect(await screen.findByRole('heading', { name: 'Olá, Admin!' })).toBeInTheDocument()
    // Atalhos permitidos aparecem; "Usuários" exige CONTA:CREATE.
    expect(screen.getByRole('heading', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Famílias' })).toBeInTheDocument()
  })

  it('oculta atalhos não permitidos (Voluntário não vê Usuários)', async () => {
    await renderHomeWith(['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'])

    expect(await screen.findByRole('heading', { name: 'Olá, Voluntário!' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cestas básicas' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Usuários' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Famílias' })).not.toBeInTheDocument()
  })
})
