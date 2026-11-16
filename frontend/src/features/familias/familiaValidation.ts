
import type { FamiliaFormValues } from './types';

export type FamiliaFormErrors =
  Partial<Record<keyof FamiliaFormValues, string>>;

export function validateFamilia(
  values: FamiliaFormValues
): FamiliaFormErrors {
  const errors: FamiliaFormErrors = {};

  if (!values.nome.trim()) {
    errors.nome = 'O nome é obrigatório.';
  }

  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = 'E-mail inválido.';
  }

  if (values.observacoes.length > 2000) {
    errors.observacoes =
      'As observações devem ter no máximo 2000 caracteres.';
  }

  return errors;
}
