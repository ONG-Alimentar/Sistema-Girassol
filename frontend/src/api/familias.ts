/** Campos de FamiliaResponse usados na listagem; o backend retorna outros campos também. */
export interface FamiliaListItem {
  id: number
  nome: string
  dataCadastro: string | null
}
