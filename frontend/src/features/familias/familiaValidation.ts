
import type { FamiliaFormValues } from './types';

export type FamiliaFormErrors = Record<string, string>;

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

    values.telefones.forEach((telefone, index) => {
    if (!telefone.numero.trim()) {
        errors[`telefones[${index}].numero`] =
        'O número do telefone é obrigatório.';
    }
    });

    values.enderecos.forEach((endereco, index) => {
    if (!endereco.rua.trim()) {
        errors[`enderecos[${index}].rua`] =
        'A rua é obrigatória.';
    }
    });

    values.dependentes.forEach((dependente, index) => {
    if (!dependente.nome.trim()) {
        errors[`dependentes[${index}].nome`] =
        'O nome do dependente é obrigatório.';
    }
    });

    values.problemasSaude.forEach((problema, index) => {
    if (!problema.descricao.trim()) {
        errors[`problemasSaude[${index}].descricao`] =
        'A descrição do problema de saúde é obrigatória.';
    }
    });

    values.medicamentos.forEach((medicamento, index) => {
    if (!medicamento.descricao.trim()) {
        errors[`medicamentos[${index}].descricao`] =
        'A descrição do medicamento é obrigatória.';
    }
    });

    values.substancias.forEach((substancia, index) => {
    if (!substancia.descricao.trim()) {
        errors[`substancias[${index}].descricao`] =
        'A descrição da substância é obrigatória.';
    }
    });

  return errors;
}
