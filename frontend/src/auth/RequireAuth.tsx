import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

/**
 * Protege rotas que exigem apenas autenticação. Enquanto a sessão é restaurada,
 * não decide nada (evita um "flash" de redirecionamento). Sem usuário, manda ao
 * login guardando a rota de origem para redirecionar de volta após autenticar.
 *
 * Uso como route element de wrapper (renderiza <Outlet/>).
 */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p style={{ padding: '2rem' }}>Carregando…</p>
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
