
export interface FamiliaRequest {
  nome: string;
  nomeSocial: string | null;
  dataNascimento: string | null;
  genero: string | null;
  estadoCivil: string | null;
  indicacao: string | null;
  nomeMae: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  nis: string | null;
  naturalidade: string | null;
  observacoes: string | null;
}

export interface FamiliaResponse extends FamiliaRequest {
  id: number;
  dataCadastro: string | null;
}

export type FamiliaFormValues = {
  [K in keyof FamiliaRequest]: string;
};

export const emptyFamiliaForm: FamiliaFormValues = {
  nome: '',
  nomeSocial: '',
  dataNascimento: '',
  genero: '',
  estadoCivil: '',
  indicacao: '',
  nomeMae: '',
  email: '',
  cpf: '',
  rg: '',
  nis: '',
  naturalidade: '',
  observacoes: '',
};

export function toFamiliaRequest(
  values: FamiliaFormValues
): FamiliaRequest {
  const optional = (value: string) =>
    value.trim() === '' ? null : value.trim();

  return {
    nome: values.nome.trim(),
    nomeSocial: optional(values.nomeSocial),
    dataNascimento: optional(values.dataNascimento),
    genero: optional(values.genero),
    estadoCivil: optional(values.estadoCivil),
    indicacao: optional(values.indicacao),
    nomeMae: optional(values.nomeMae),
    email: optional(values.email),
    cpf: optional(values.cpf),
    rg: optional(values.rg),
    nis: optional(values.nis),
    naturalidade: optional(values.naturalidade),
    observacoes: optional(values.observacoes),
  };
}

export function toFamiliaFormValues(
  familia: FamiliaResponse
): FamiliaFormValues {
  return {
    nome: familia.nome ?? '',
    nomeSocial: familia.nomeSocial ?? '',
    dataNascimento: familia.dataNascimento ?? '',
    genero: familia.genero ?? '',
    estadoCivil: familia.estadoCivil ?? '',
    indicacao: familia.indicacao ?? '',
    nomeMae: familia.nomeMae ?? '',
    email: familia.email ?? '',
    cpf: familia.cpf ?? '',
    rg: familia.rg ?? '',
    nis: familia.nis ?? '',
    naturalidade: familia.naturalidade ?? '',
    observacoes: familia.observacoes ?? '',
  };
}
