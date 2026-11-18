import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p style={{ padding: '2rem' }}>Carregando…</p>
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
