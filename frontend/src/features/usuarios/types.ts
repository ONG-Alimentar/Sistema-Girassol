import type { UsuarioAdminRequest, UsuarioListItem } from '../../api/usuarios'

export interface UsuarioFormValues {
  nome: string
  email: string
  senha: string
  ativo: string
  cargoIds: string[]
}

export const emptyUsuarioForm: UsuarioFormValues = {
  nome: '',
  email: '',
  senha: '',
  ativo: 'true',
  cargoIds: [],
}

export function toUsuarioRequest(values: UsuarioFormValues): UsuarioAdminRequest {
  return {
    nome: values.nome.trim(),
    email: values.email.trim(),
    senha: values.senha.trim() ? values.senha : null,
    cargoIds: values.cargoIds.map(Number),
    ativo: values.ativo === 'true',
  }
}

export function toUsuarioFormValues(usuario: UsuarioListItem): UsuarioFormValues {
  return {
    nome: usuario.nome,
    email: usuario.email,
    senha: '',
    ativo: usuario.ativo ? 'true' : 'false',
    cargoIds: usuario.cargos.map((cargo) => String(cargo.id)),
  }
}
