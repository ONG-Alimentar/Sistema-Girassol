import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'
import type { Permission } from '../auth/permissions.ts'

interface NavItem {
  to: string
  label: string
  permission: Permission
}

// Itens de navegação e a permissão que cada um exige. O menu só mostra o que o
// usuário pode acessar — a proteção real fica nas rotas (PermissionGuard).
const NAV_ITEMS: NavItem[] = [
  { to: '/familias', label: 'Famílias', permission: 'FAMILIA:READ' },
  { to: '/cestas', label: 'Cestas', permission: 'CESTA:READ' },
  { to: '/roupas', label: 'Roupas', permission: 'ROUPA:READ' },
  { to: '/visitas', label: 'Visitas', permission: 'VISITA:READ' },
  { to: '/juridico', label: 'Jurídico', permission: 'JURIDICO:READ' },
  { to: '/psicologico', label: 'Psicológico', permission: 'PSICOLOGICO:READ' },
]

/** Layout das rotas autenticadas: cabeçalho com navegação + <Outlet/>. */
export function AppLayout() {
  const { user, can, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <NavLink to="/" style={{ fontWeight: 700 }}>
          Girassol
        </NavLink>
        <nav style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          {NAV_ITEMS.filter((item) => can(item.permission)).map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span style={{ color: '#666' }}>{user?.nome ?? user?.email}</span>
        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
