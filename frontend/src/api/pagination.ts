/** Contrato compartilhado com common/crud/PaginatedList.java (#29). */
export interface PaginatedList<T> {
  content: T[]
  /** Índice da página na API, começando em zero. */
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  /** Descrição da ordenação na resposta; a query usa sort=campo,asc|desc. */
  sort: string
}
