// Endpoints de autenticação. Contrato mínimo enquanto o mecanismo definitivo
// (sessão × JWT) não é fechado no backend — ver docs/seguranca/rbac.md.
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
  /** Autoridades concedidas, no formato MODULO:ACAO. */
  permissions: Permission[]
}

/** Autentica o usuário. */
export function login(credenciais: Credenciais): Promise<Usuario> {
  return apiFetch<Usuario>('/api/auth/login', { method: 'POST', body: credenciais })
}

/** Encerra a sessão atual no backend. */
export function logout(): Promise<unknown> {
  return apiFetch('/api/auth/logout', { method: 'POST' })
}

/**
 * Retorna o usuário autenticado e suas permissões, ou null se não houver
 * sessão (backend responde 401).
 */
export async function me(): Promise<Usuario | null> {
  try {
    return await apiFetch<Usuario>('/api/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
