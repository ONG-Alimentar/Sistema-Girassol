import type { PermissaoListItem } from './permissoes'

export interface CargoListItem {
  id: number
  nome: string
  permissoes: PermissaoListItem[]
  totalUsuarios: number
}
