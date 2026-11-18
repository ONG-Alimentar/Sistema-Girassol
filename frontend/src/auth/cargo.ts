const CARGO_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Admin',
  ASSISTENTE_SOCIAL: 'Assistente social',
  ADVOGADA: 'Jurídico',
  PSICOLOGO: 'Psicológico',
  VOLUNTARIO_INTERNO: 'Voluntário',
}

const PRIORIDADE = ['ADMINISTRADOR', 'ASSISTENTE_SOCIAL', 'ADVOGADA', 'PSICOLOGO', 'VOLUNTARIO_INTERNO']

export function cargoLabel(cargos: string[] | undefined): string {
  if (cargos && cargos.length > 0) {
    for (const nome of PRIORIDADE) {
      if (cargos.includes(nome)) return CARGO_LABELS[nome]
    }
    return CARGO_LABELS[cargos[0]] ?? cargos[0]
  }
  return 'Usuário'
}
