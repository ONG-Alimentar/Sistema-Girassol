import type { PermissaoListItem } from './permissoes'

/** Item de CargoResponse usado na listagem de administração (#3). */
export interface CargoListItem {
  id: number
  nome: string
  permissoes: PermissaoListItem[]
  totalUsuarios: number
}
