import { hasPermission } from './permissions.ts'
import type { Permission } from './permissions.ts'

/**
 * Rótulo de Cargo exibido na saudação da home ("Olá, {cargo}!").
 *
 * Derivação TEMPORÁRIA a partir das permissões: o tipo Usuario ainda não traz o
 * cargo (ele vem do #18/#46). Quando o backend enviar o cargo real, basta trocar
 * esta função por uma leitura direta — o resto da UI não muda.
 *
 * A ordem importa: o Administrador tem TODAS as permissões (ver rbac.md), então
 * checamos do mais privilegiado para o menos para não rotulá-lo como outro cargo.
 */
export function cargoLabel(perms: Permission[] | undefined): string {
  if (hasPermission(perms, 'CONTA:CREATE')) return 'Admin'
  if (hasPermission(perms, 'FAMILIA:READ')) return 'Assistente social'
  if (hasPermission(perms, 'JURIDICO:READ')) return 'Jurídico'
  if (hasPermission(perms, 'PSICOLOGICO:READ')) return 'Psicológico'
  if (hasPermission(perms, ['CESTA:READ', 'ROUPA:READ', 'VISITA:READ'])) return 'Voluntário'
  return 'Usuário'
}
