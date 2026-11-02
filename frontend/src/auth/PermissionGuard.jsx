import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth.js'

/**
 * Libera o conteúdo apenas se o usuário tiver a(s) permissão(ões) exigida(s).
 *
 * Dois modos de uso:
 *  - Guard de rota: envolve o elemento da página; `redirect` leva a /403.
 *      <Route path="familias" element={
 *        <PermissionGuard permission="FAMILIA:READ" redirect><FamiliasPage/></PermissionGuard>} />
 *  - UI condicional: sem `redirect`, apenas oculta (ou mostra `fallback`).
 *      <PermissionGuard permission="FAMILIA:CREATE"><BotaoNova/></PermissionGuard>
 *
 * @param {Object} props
 * @param {string|string[]} props.permission  Permissão(ões); basta uma (OR).
 * @param {boolean} [props.redirect=false]  Redireciona para /403 se faltar.
 * @param {React.ReactNode} [props.fallback=null]  Render quando faltar e sem redirect.
 * @param {React.ReactNode} [props.children]
 */
export function PermissionGuard({
  permission,
  redirect = false,
  fallback = null,
  children,
}) {
  const { can } = useAuth()

  if (can(permission)) return children ?? null
  if (redirect) return <Navigate to="/403" replace />
  return fallback
}
