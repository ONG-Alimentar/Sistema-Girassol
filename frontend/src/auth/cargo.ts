/**
 * Rótulo de Cargo exibido na saudação da home ("Olá, {cargo}!").
 *
 * Lê os cargos reais do usuário (enviados pelo backend em /login e /me — ver
 * auth/UsuarioResponse.java e api/auth.ts). Quando o usuário tem mais de um cargo,
 * saúda pelo de maior alcance (ordem de PRIORIDADE). Fallback "Usuário" quando não
 * há cargo (ou é um nome fora do catálogo conhecido).
 */
const CARGO_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Admin',
  ASSISTENTE_SOCIAL: 'Assistente social',
  ADVOGADA: 'Jurídico',
  PSICOLOGO: 'Psicológico',
  VOLUNTARIO_INTERNO: 'Voluntário',
}

// Do mais privilegiado para o menos — ver docs/seguranca/rbac.md.
const PRIORIDADE = ['ADMINISTRADOR', 'ASSISTENTE_SOCIAL', 'ADVOGADA', 'PSICOLOGO', 'VOLUNTARIO_INTERNO']

export function cargoLabel(cargos: string[] | undefined): string {
  if (cargos && cargos.length > 0) {
    for (const nome of PRIORIDADE) {
      if (cargos.includes(nome)) return CARGO_LABELS[nome]
    }
    // Cargo fora do catálogo conhecido: mostra o próprio nome.
    return CARGO_LABELS[cargos[0]] ?? cargos[0]
  }
  return 'Usuário'
}
