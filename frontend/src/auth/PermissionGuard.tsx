import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth.ts'
import type { Permission } from './permissions.ts'

interface PermissionGuardProps {
  /** Permissão(ões) exigida(s); basta uma (OR). */
  permission: Permission | Permission[]
  /** Se true, redireciona para /403 quando faltar (uso como guard de rota). */
  redirect?: boolean
  /** Render quando faltar a permissão e `redirect` for false. */
  fallback?: ReactNode
  children?: ReactNode
}

/**
 * Libera o conteúdo apenas se o usuário tiver a(s) permissão(ões) exigida(s).
 *
 * Dois modos de uso:
 *  - Guard de rota: envolve o elemento da página; `redirect` leva a /403.
 *      <Route path="familias" element={
 *        <PermissionGuard permission="FAMILIA:READ" redirect><FamiliasPage/></PermissionGuard>} />
 *  - UI condicional: sem `redirect`, apenas oculta (ou mostra `fallback`).
 *      <PermissionGuard permission="FAMILIA:CREATE"><BotaoNova/></PermissionGuard>
 */
export function PermissionGuard({
  permission,
  redirect = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can } = useAuth()

  if (can(permission)) return <>{children}</>
  if (redirect) return <Navigate to="/403" replace />
  return <>{fallback}</>
}
