import { apiFetch } from './client'
import type { PaginatedList } from './pagination'
import type { PermissaoListItem } from './permissoes'

export interface CargoListItem {
  id: number
  nome: string
  permissoes: PermissaoListItem[]
  totalUsuarios: number
}

/** DTO de entrada (create/update) — espelha o `CargoRequest` do backend. */
export interface CargoRequest {
  nome: string
  permissaoIds: number[]
}

export function getCargo(id: string | number): Promise<CargoListItem> {
  return apiFetch<CargoListItem>(`/api/cargos/${id}`)
}

export function createCargo(req: CargoRequest): Promise<CargoListItem> {
  return apiFetch<CargoListItem>('/api/cargos', { method: 'POST', body: req })
}

export function updateCargo(id: string | number, req: CargoRequest): Promise<CargoListItem> {
  return apiFetch<CargoListItem>(`/api/cargos/${id}`, { method: 'PUT', body: req })
}

export function deleteCargo(id: string | number): Promise<unknown> {
  return apiFetch(`/api/cargos/${id}`, { method: 'DELETE' })
}

/** Lista completa de cargos (catálogo pequeno), usada para popular checkboxes. */
export async function getAllCargos(): Promise<CargoListItem[]> {
  const page = await apiFetch<PaginatedList<CargoListItem>>('/api/cargos?size=200&sort=nome,asc')
  return page.content
}
