/** Resumo do cargo embutido no usuário (sem as permissões). */
export interface UsuarioCargoResumo {
  id: number
  nome: string
}

/** Item de UsuarioAdminResponse usado na listagem de administração (#3). */
export interface UsuarioListItem {
  id: number
  nome: string
  email: string
  ativo: boolean
  cargos: UsuarioCargoResumo[]
}
