import { apiFetch } from './client'
import type { PaginatedList } from './pagination'

export interface PermissaoListItem {
  id: number
  codigo: string
}

/** Lista completa de permissões (catálogo via seed), usada para popular checkboxes. */
export async function getAllPermissoes(): Promise<PermissaoListItem[]> {
  const page = await apiFetch<PaginatedList<PermissaoListItem>>('/api/permissoes?size=200&sort=codigo,asc')
  return page.content
}
