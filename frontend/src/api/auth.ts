import type { Permission } from '../auth/permissions.ts'
import { ApiError, apiFetch } from './client.ts'

export interface Credenciais {
  email: string
  senha: string
}

export interface Usuario {
  id: number
  email: string
  nome?: string
  permissions: Permission[]
  cargos?: string[]
}

export function login(credenciais: Credenciais): Promise<Usuario> {
  return apiFetch<Usuario>('/api/auth/login', { method: 'POST', body: credenciais })
}

export function logout(): Promise<unknown> {
  return apiFetch('/api/auth/logout', { method: 'POST' })
}

export async function me(): Promise<Usuario | null> {
  try {
    return await apiFetch<Usuario>('/api/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
