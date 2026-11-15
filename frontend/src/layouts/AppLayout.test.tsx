import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import type { Permission } from '../auth/permissions.ts'

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

async function renderShellWith(permissions: Permission[]) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/api/auth/me')) {
      return response({ id: 1, email: 'teste@example.org', permissions })
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

describe('AppLayout — chrome mobile', () => {
  it('mostra a bottom tab bar (Início / Famílias / Mais)', async () => {
    await renderShellWith(['FAMILIA:READ'])

    expect(await screen.findByRole('button', { name: 'Início' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument()
  })

  it('o hambúrguer abre o drawer com os módulos permitidos (Admin vê Usuários)', async () => {
    await renderShellWith(['CONTA:CREATE', 'FAMILIA:READ'])

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir menu' }))

    expect(await screen.findByRole('link', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Famílias' })).toBeInTheDocument()
  })

  it('o drawer oculta módulos sem permissão (Voluntário não vê Usuários)', async () => {
    await renderShellWith(['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'])

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir menu' }))

    expect(await screen.findByRole('link', { name: 'Cestas básicas' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Usuários' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Famílias' })).not.toBeInTheDocument()
  })

  it('"Mais" também abre o drawer', async () => {
    await renderShellWith(['FAMILIA:READ'])

    fireEvent.click(await screen.findByRole('button', { name: 'Mais' }))

    expect(await screen.findByRole('link', { name: 'Famílias' })).toBeInTheDocument()
  })
})
