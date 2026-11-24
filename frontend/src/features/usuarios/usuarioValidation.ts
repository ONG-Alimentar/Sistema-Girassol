import type { FormMode } from '../../components/forms/UnifiedForm'
import type { UsuarioFormValues } from './types'

export type UsuarioFormErrors = Record<string, string>

const SENHA_MIN = 8

export function validateUsuario(values: UsuarioFormValues, mode: FormMode): UsuarioFormErrors {
  const errors: UsuarioFormErrors = {}

  if (!values.nome.trim()) {
    errors.nome = 'O nome é obrigatório.'
  }

  if (!values.email.trim()) {
    errors.email = 'O e-mail é obrigatório.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'E-mail inválido.'
  }

  if (mode === 'create' && !values.senha.trim()) {
    errors.senha = 'A senha é obrigatória ao criar um usuário.'
  } else if (values.senha.trim() && values.senha.trim().length < SENHA_MIN) {
    errors.senha = `A senha deve ter ao menos ${SENHA_MIN} caracteres.`
  }

  return errors
}
