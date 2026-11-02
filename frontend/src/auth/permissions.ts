// Catálogo de permissões do RBAC (docs/seguranca/rbac.md), no formato
// MODULO:ACAO. Tipar como união literal faz o compilador recusar códigos
// inexistentes em guards, rotas e UI condicional.
export type Permission =
  | 'CONTA:CREATE'
  | 'SENHA:UPDATE_SELF'
  | 'FAMILIA:READ' | 'FAMILIA:CREATE' | 'FAMILIA:UPDATE' | 'FAMILIA:DELETE'
  | 'DOCUMENTACAO:READ' | 'DOCUMENTACAO:CREATE' | 'DOCUMENTACAO:DELETE'
  | 'PROJETO:READ' | 'PROJETO:CREATE' | 'PROJETO:UPDATE' | 'PROJETO:DELETE'
  | 'FINANCEIRO:READ' | 'FINANCEIRO:CREATE' | 'FINANCEIRO:UPDATE' | 'FINANCEIRO:DELETE'
  | 'VOL_EXTERNO:READ' | 'VOL_EXTERNO:CREATE' | 'VOL_EXTERNO:UPDATE' | 'VOL_EXTERNO:DELETE'
  | 'CESTA:READ' | 'CESTA:CREATE' | 'CESTA:DELETE'
  | 'ROUPA:READ' | 'ROUPA:CREATE' | 'ROUPA:DELETE'
  | 'VISITA:READ' | 'VISITA:CREATE' | 'VISITA:DELETE'
  | 'JURIDICO:READ' | 'JURIDICO:CREATE' | 'JURIDICO:UPDATE' | 'JURIDICO:DELETE'
  | 'PSICOLOGICO:READ' | 'PSICOLOGICO:CREATE' | 'PSICOLOGICO:UPDATE' | 'PSICOLOGICO:DELETE'

/**
 * Indica se a lista de permissões concede a(s) permissão(ões) exigida(s).
 * Com uma lista em `required`, basta UMA (semântica OR).
 */
export function hasPermission(
  granted: Permission[] | undefined,
  required: Permission | Permission[],
): boolean {
  const set = new Set(granted ?? [])
  const list = Array.isArray(required) ? required : [required]
  return list.some((code) => set.has(code))
}
