import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from '../App.tsx'
import type { Permission } from '../auth/permissions.ts'

const BASE = '/Sistema-Girassol'

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
  me?: TestUser | null
  path?: string
  fetchHandler?: (url: string, init?: RequestInit) => Promise<Response> | Response
}

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
