import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import GroupsIcon from '@mui/icons-material/Groups'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import LogoutIcon from '@mui/icons-material/Logout'
import { SunflowerLogo } from '../components/brand/SunflowerLogo.tsx'
import { useAuth } from '../auth/useAuth.ts'
import { MODULES } from '../navigation/modules.ts'

const BOTTOM_NAV_HEIGHT = 56

export function AppLayout() {
  const { user, can, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const visibleModules = MODULES.filter((m) => can(m.permission))

  async function handleLogout() {
    setDrawerOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const currentTab = location.pathname === '/'
    ? 'inicio'
    : location.pathname.startsWith('/familias')
      ? 'familias'
      : false

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={NavLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <SunflowerLogo size={28} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
              Sistema Girassol
            </Typography>
          </Box>

          <Button
            type="button"
            onClick={handleLogout}
            color="inherit"
            size="small"
            startIcon={<LogoutIcon />}
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }} role="presentation">
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {user?.nome ?? user?.email}
            </Typography>
          </Box>
          <Divider />
          <List>
            {visibleModules.map((m) => {
              const Icon = m.icon
              return (
                <ListItemButton
                  key={m.path}
                  component={NavLink}
                  to={`/${m.path}`}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ '&.active': { bgcolor: 'rgba(74, 47, 23, 0.12)' } }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={m.label} />
                </ListItemButton>
              )
            })}
          </List>
        </Box>
      </Drawer>

      <Container
        component="main"
        maxWidth="lg"
        sx={{ py: 3, pb: `calc(${BOTTOM_NAV_HEIGHT}px + 24px)` }}
      >
        <Outlet />
      </Container>

      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar }}
      >
        <BottomNavigation
          showLabels
          value={currentTab}
          sx={{ bgcolor: 'background.paper' }}
        >
          <BottomNavigationAction
            label="Início"
            value="inicio"
            icon={<HomeIcon />}
            onClick={() => navigate('/')}
          />
          {/* A aba Famílias só aparece para quem tem a permissão — o drawer e a
              home já filtram por can(); sem isto a aba levaria a /403. */}
          {can('FAMILIA:READ') && (
            <BottomNavigationAction
              label="Famílias"
              value="familias"
              icon={<GroupsIcon />}
              onClick={() => navigate('/familias')}
            />
          )}
          <BottomNavigationAction
            label="Mais"
            value="mais"
            icon={<MoreHorizIcon />}
            onClick={() => setDrawerOpen(true)}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
