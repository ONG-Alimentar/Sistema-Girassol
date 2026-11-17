import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from '../App.tsx'
import type { Permission } from '../auth/permissions.ts'

/** Subpath do build de produção (GitHub Pages), usado como basename nos testes. */
const BASE = '/Sistema-Girassol'

/** Usuário devolvido por /api/auth/me nos testes. */
export interface TestUser {
  id?: number
  email?: string
  nome?: string
  permissions: Permission[]
  cargos?: string[]
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface RenderAuthedOptions {
  /**
   * Usuário retornado por /api/auth/me. `undefined` → usuário autenticado padrão
   * (sem permissões); `null` → sem sessão (401), caindo no fluxo de login.
   */
  me?: TestUser | null
  /** Rota inicial, relativa ao basename de produção (ex.: '/', '/examples/x'). */
  path?: string
  /** Trata as demais chamadas de fetch (além de /api/auth/me); 404 por padrão. */
  fetchHandler?: (url: string, init?: RequestInit) => Promise<Response> | Response
}

/**
 * Renderiza o App no subpath de produção com a sessão já resolvida. Stuba
 * import.meta.env.BASE_URL e o fetch global (/api/auth/me + delegação ao
 * fetchHandler). O chamador deve limpar no afterEach: cleanup() +
 * vi.unstubAllGlobals() + vi.unstubAllEnvs().
 */
export async function renderAuthedApp({
  me,
  path = '/',
  fetchHandler,
}: RenderAuthedOptions = {}) {
  const user: TestUser | null =
    me === undefined ? { id: 1, email: 'teste@example.org', permissions: [] } : me

  vi.stubEnv('BASE_URL', `${BASE}/`)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/api/auth/me')) {
        return user ? jsonResponse(user) : jsonResponse({}, 401)
      }
      return fetchHandler ? fetchHandler(url, init) : jsonResponse({}, 404)
    }),
  )

  window.history.pushState({}, '', `${BASE}${path}`)
  await act(async () => {
    render(<App />)
  })
}
