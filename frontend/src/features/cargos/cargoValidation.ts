import type { CargoFormValues } from './types'

export type CargoFormErrors = Record<string, string>

export function validateCargo(values: CargoFormValues): CargoFormErrors {
  const errors: CargoFormErrors = {}

  if (!values.nome.trim()) {
    errors.nome = 'O nome é obrigatório.'
  }

  return errors
}
