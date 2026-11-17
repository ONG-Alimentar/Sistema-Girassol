
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
  telefones: TelefoneRequest[];
  enderecos: EnderecoRequest[];
  dependentes: DependenteRequest[];
  problemasSaude: ProblemaSaudeRequest[];
 medicamentos: MedicamentoRequest[];
 substancias: SubstanciaRequest[];
 situacaoSocioeconomica: SituacaoSocioeconomicaRequest | null;
 servicosIds: number[];
}

export interface FamiliaResponse extends FamiliaRequest {
  id: number;
  dataCadastro: string | null;
  situacaoSocioeconomica: SituacaoSocioeconomicaResponse | null;
}

export interface TelefoneFormValues {
  id?: number;
  numero: string;
}

export type FamiliaFormValues = {
  [K in Exclude<keyof FamiliaRequest, 'telefones' | 'enderecos' | 'dependentes' 
    | 'problemasSaude' | 'medicamentos' | 'substancias' | 'situacaoSocioeconomica' | 'servicosIds'>]: string;
} & {
  telefones: TelefoneFormValues[];
  enderecos: EnderecoFormValues[];
  dependentes: DependenteFormValues[];
  problemasSaude: ProblemaSaudeFormValues[];
  medicamentos: MedicamentoFormValues[];
  substancias: SubstanciaFormValues[];
  situacaoSocioeconomica: SituacaoSocioeconomicaFormValues;
  servicosIds: string[];
};

export interface ServicoResponse {
  id: number;
  nome: string;
}

export const emptySituacaoSocioeconomica: SituacaoSocioeconomicaFormValues = {
  profissao: '',
  escolaridade: '',
  tipoMoradia: '',
  renda: '',
  beneficio: '',
  acessoAlimentacao: '',
};

export interface TelefoneRequest {
  id: number | null;
  numero: string;
}

export interface TelefoneResponse {
  id: number;
  numero: string;
}

export interface EnderecoFormValues {
  id?: number;
  rua: string;
  bairro: string;
  numero: string;
  complemento: string;
  cidade: string;
  cep: string;
}

export interface EnderecoRequest {
  id: number | null;
  rua: string;
  bairro: string;
  numero: string;
  complemento: string;
  cidade: string;
  cep: string;
}

export interface EnderecoResponse extends EnderecoRequest {}

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
  telefones: [],
  enderecos: [],
  dependentes: [],
  problemasSaude: [],
  medicamentos: [],
  substancias: [],
  situacaoSocioeconomica: { ...emptySituacaoSocioeconomica },
  servicosIds: [],
};

export interface DependenteFormValues {
  id?: number;
  nome: string;
  dataNascimento: string;
  parentesco: string;
  ocupacao: string;
}

export interface DependenteRequest {
  id: number | null;
  nome: string;
  dataNascimento: string | null;
  parentesco: string;
  ocupacao: string;
}

export interface DependenteResponse
  extends Omit<DependenteRequest, 'id'> {
  id: number;
}

export interface ProblemaSaudeFormValues {
  id?: number;
  descricao: string;
  gravidade: string;
}

export interface ProblemaSaudeRequest {
  id: number | null;
  descricao: string;
  gravidade: string;
}

export interface ProblemaSaudeResponse
  extends Omit<ProblemaSaudeRequest, 'id'> {
  id: number;
}

export interface MedicamentoFormValues {
  id?: number;
  descricao: string;
  dosagem: string;
}

export interface MedicamentoRequest {
  id: number | null;
  descricao: string;
  dosagem: string;
}

export interface MedicamentoResponse
  extends Omit<MedicamentoRequest, 'id'> {
  id: number;
}

export interface SubstanciaFormValues {
  id?: number;
  descricao: string;
}

export interface SubstanciaRequest {
  id: number | null;
  descricao: string;
}

export interface SubstanciaResponse
  extends Omit<SubstanciaRequest, 'id'> {
  id: number;
}

export type TipoMoradia =
  | 'PROPRIA'
  | 'ALUGADA'
  | 'CEDIDA'
  | 'OCUPACAO_IRREGULAR'
  | 'SITUACAO_DE_RUA';

export type Renda =
  | 'SEM_RENDA'
  | 'ATE_1_SALARIO_MINIMO'
  | 'DE_1_A_2_SALARIOS_MINIMOS'
  | 'DE_2_A_3_SALARIOS_MINIMOS'
  | 'ACIMA_DE_3_SALARIOS_MINIMOS';

  export interface SituacaoSocioeconomicaFormValues {
  profissao: string;
  escolaridade: string;
  tipoMoradia: TipoMoradia | '';
  renda: Renda | '';
  beneficio: string;
  acessoAlimentacao: 'sim' | 'nao' | '';
}

export interface SituacaoSocioeconomicaRequest {
  profissao: string | null;
  escolaridade: string | null;
  tipoMoradia: TipoMoradia | null;
  renda: Renda | null;
  beneficio: string | null;
  acessoAlimentacao: boolean | null;
}

export interface SituacaoSocioeconomicaResponse
  extends SituacaoSocioeconomicaRequest {
  id: number;
}

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
    telefones: values.telefones.map((telefone) => ({
        id: telefone.id ?? null,
        numero: telefone.numero.trim(),
    })),
    enderecos: values.enderecos.map((endereco) => ({
        ...endereco,
        id: endereco.id ?? null,
    })),
    dependentes: values.dependentes.map((dependente) => ({
        id: dependente.id ?? null,
        nome: dependente.nome.trim(),
        dataNascimento: optional(dependente.dataNascimento),
        parentesco: dependente.parentesco.trim(),
        ocupacao: dependente.ocupacao.trim(),
    })),
    problemasSaude: values.problemasSaude.map((problema) => ({
        id: problema.id ?? null,
        descricao: problema.descricao.trim(),
        gravidade: problema.gravidade.trim(),
    })),
    medicamentos: values.medicamentos.map((medicamento) => ({
        id: medicamento.id ?? null,
        descricao: medicamento.descricao.trim(),
        dosagem: medicamento.dosagem.trim(),
    })),
    substancias: values.substancias.map((substancia) => ({
        id: substancia.id ?? null,
        descricao: substancia.descricao.trim(),
    })),
    situacaoSocioeconomica: {
        profissao: optional(values.situacaoSocioeconomica.profissao),
        escolaridade: optional(values.situacaoSocioeconomica.escolaridade),
        tipoMoradia:
            values.situacaoSocioeconomica.tipoMoradia || null,
        renda:
            values.situacaoSocioeconomica.renda || null,
        beneficio:
            optional(values.situacaoSocioeconomica.beneficio),
        acessoAlimentacao:
            values.situacaoSocioeconomica.acessoAlimentacao === 'sim'
            ? true
            : values.situacaoSocioeconomica.acessoAlimentacao === 'nao'
                ? false
                : null,
    },
    servicosIds: values.servicosIds.map(Number),
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
    telefones: familia.telefones.map((telefone) => ({
        id: telefone.id ?? undefined,
        numero: telefone.numero,
    })),
    enderecos: (familia.enderecos ?? []).map((endereco) => ({
        ...endereco,
        id: endereco.id ?? undefined,
    })),
    dependentes: (familia.dependentes ?? []).map((dependente) => ({
        id: dependente.id ?? undefined,
        nome: dependente.nome ?? '',
        dataNascimento: dependente.dataNascimento ?? '',
        parentesco: dependente.parentesco ?? '',
        ocupacao: dependente.ocupacao ?? '',
    })),
    problemasSaude: (familia.problemasSaude ?? []).map((problema) => ({
        id: problema.id ?? undefined,
        descricao: problema.descricao ?? '',
        gravidade: problema.gravidade ?? '',
    })),

    medicamentos: (familia.medicamentos ?? []).map((medicamento) => ({
        id: medicamento.id ?? undefined,
        descricao: medicamento.descricao ?? '',
        dosagem: medicamento.dosagem ?? '',
    })),

    substancias: (familia.substancias ?? []).map((substancia) => ({
        id: substancia.id ?? undefined,
        descricao: substancia.descricao ?? '',
    })),

    situacaoSocioeconomica: {
        profissao:
            familia.situacaoSocioeconomica?.profissao ?? '',

        escolaridade:
            familia.situacaoSocioeconomica?.escolaridade ?? '',

        tipoMoradia:
            familia.situacaoSocioeconomica?.tipoMoradia ?? '',

        renda:
            familia.situacaoSocioeconomica?.renda ?? '',

        beneficio:
            familia.situacaoSocioeconomica?.beneficio ?? '',

        acessoAlimentacao:
            familia.situacaoSocioeconomica?.acessoAlimentacao === true
            ? 'sim'
            : familia.situacaoSocioeconomica?.acessoAlimentacao === false
                ? 'nao'
                : '',
    },
    servicosIds: (familia.servicosIds ?? []).map(String),
  };
}
