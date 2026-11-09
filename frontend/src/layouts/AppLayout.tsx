import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import { SunflowerLogo } from '../components/brand/SunflowerLogo.tsx'
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

/**
 * Layout das rotas autenticadas: barra superior (âmbar) com navegação + o
 * conteúdo da rota (<Outlet/>). O estilo vem todo do tema (src/theme.ts); a
 * estrutura/itens de navegação são do #30.
 */
export function AppLayout() {
  const { user, can, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component={NavLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <SunflowerLogo size={32} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
              Sistema Girassol
            </Typography>
          </Box>

          <Box component="nav" sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
            {NAV_ITEMS.filter((item) => can(item.permission)).map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                color="inherit"
                sx={{
                  fontWeight: 600,
                  '&.active': { bgcolor: 'rgba(74, 47, 23, 0.12)' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.nome ?? user?.email}
          </Typography>
          <Button
            type="button"
            onClick={handleLogout}
            variant="contained"
            color="primary"
            size="small"
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
