import { apiFetch } from './client'

/** Item de uma doação de cesta (descrição + quantidade). */
export interface ItemCesta {
  id?: number
  descricao: string
  quantidade: number
}

/** Doação de cesta como retornada pelo backend (`CestaResponse`). */
export interface Cesta {
  id: number
  data: string | null
  familiaId: number
  familiaNome: string
  itens: ItemCesta[]
}

/** Campos de `Cesta` usados na listagem. */
export interface CestaListItem {
  id: number
  data: string | null
  familiaNome: string
  itens: ItemCesta[]
}

/** DTO de entrada (create/update) — espelha o `CestaRequest` do backend. */
export interface CestaRequest {
  familiaId: number
  data: string | null
  itens: { descricao: string; quantidade: number }[]
}

export function getCesta(id: string | number): Promise<Cesta> {
  return apiFetch<Cesta>(`/api/cestas/${id}`)
}

export function createCesta(req: CestaRequest): Promise<Cesta> {
  return apiFetch<Cesta>('/api/cestas', { method: 'POST', body: req })
}

export function updateCesta(id: string | number, req: CestaRequest): Promise<Cesta> {
  return apiFetch<Cesta>(`/api/cestas/${id}`, { method: 'PUT', body: req })
}

export function deleteCesta(id: string | number): Promise<unknown> {
  return apiFetch(`/api/cestas/${id}`, { method: 'DELETE' })
}
