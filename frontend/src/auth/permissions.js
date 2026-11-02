// Helper puro de verificação de permissões. Isolado para ser reutilizável em
// rotas, guards e UI condicional (ex.: esconder botões de ação).

/**
 * Indica se a lista de permissões concede a(s) permissão(ões) exigida(s).
 *
 * @param {string[]|undefined} granted  Permissões do usuário (MODULO:ACAO).
 * @param {string|string[]} required  Permissão única, ou lista — basta UMA
 *   (semântica OR) para liberar.
 * @returns {boolean}
 */
export function hasPermission(granted, required) {
  if (!required) return true
  const set = new Set(granted ?? [])
  const list = Array.isArray(required) ? required : [required]
  return list.some((code) => set.has(code))
}
