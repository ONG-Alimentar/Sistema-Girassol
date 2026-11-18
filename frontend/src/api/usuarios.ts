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
