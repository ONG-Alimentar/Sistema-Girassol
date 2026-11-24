import { apiFetch } from './client'

export interface UsuarioCargoResumo {
  id: number
  nome: string
}

export interface UsuarioListItem {
  id: number
  nome: string
  email: string
  ativo: boolean
  cargos: UsuarioCargoResumo[]
}

/** DTO de entrada (create/update) — espelha o `UsuarioAdminRequest` do backend. */
export interface UsuarioAdminRequest {
  nome: string
  email: string
  senha: string | null
  cargoIds: number[]
  ativo: boolean
}

export function getUsuario(id: string | number): Promise<UsuarioListItem> {
  return apiFetch<UsuarioListItem>(`/api/usuarios/${id}`)
}

export function createUsuario(req: UsuarioAdminRequest): Promise<UsuarioListItem> {
  return apiFetch<UsuarioListItem>('/api/usuarios', { method: 'POST', body: req })
}

export function updateUsuario(id: string | number, req: UsuarioAdminRequest): Promise<UsuarioListItem> {
  return apiFetch<UsuarioListItem>(`/api/usuarios/${id}`, { method: 'PUT', body: req })
}

export function deleteUsuario(id: string | number): Promise<unknown> {
  return apiFetch(`/api/usuarios/${id}`, { method: 'DELETE' })
}
