import { apiFetch } from './client'

/** Peça de uma doação de roupa (descrição obrigatória; tamanho e gênero opcionais). */
export interface PecaRoupa {
  id?: number
  descricao: string
  tamanho: string | null
  genero: string | null
}

/** Doação de roupa como retornada pelo backend (`RoupaResponse`). */
export interface Roupa {
  id: number
  data: string | null
  quantidade: number
  familiaId: number
  familiaNome: string
  pecas: PecaRoupa[]
}

/** Campos de `Roupa` usados na listagem. */
export interface RoupaListItem {
  id: number
  data: string | null
  quantidade: number
  familiaNome: string
  pecas: PecaRoupa[]
}

/** DTO de entrada (create) — espelha o `RoupaRequest` do backend. */
export interface RoupaRequest {
  familiaId: number
  data: string | null
  quantidade: number
  pecas: { descricao: string; tamanho: string | null; genero: string | null }[]
}

export function getRoupa(id: string | number): Promise<Roupa> {
  return apiFetch<Roupa>(`/api/roupas/${id}`)
}

export function createRoupa(req: RoupaRequest): Promise<Roupa> {
  return apiFetch<Roupa>('/api/roupas', { method: 'POST', body: req })
}

export function deleteRoupa(id: string | number): Promise<unknown> {
  return apiFetch(`/api/roupas/${id}`, { method: 'DELETE' })
}
