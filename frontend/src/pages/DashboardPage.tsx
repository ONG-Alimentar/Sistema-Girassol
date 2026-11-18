import { useNavigate } from 'react-router-dom'
import { Box, Card, CardActionArea, Typography } from '@mui/material'
import { useAuth } from '../auth/useAuth.ts'
import { cargoLabel } from '../auth/cargo.ts'
import { MODULES } from '../navigation/modules.ts'

export function DashboardPage() {
  const { user, can } = useAuth()
  const navigate = useNavigate()

  const cargo = cargoLabel(user?.cargos)
  const shortcuts = MODULES.filter((m) => can(m.permission))

  return (
    <Box component="section">
      <Typography variant="h1" sx={{ fontSize: '1.75rem', mb: 0.5 }}>
        Olá, {cargo}!
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        {user?.nome ?? user?.email} — escolha um atalho para começar.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        }}
      >
        {shortcuts.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.path}>
              <CardActionArea
                onClick={() => navigate(`/${m.path}`)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  minHeight: 120,
                }}
              >
                <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography
                  variant="subtitle1"
                  component="h2"
                  sx={{ fontWeight: 700, textAlign: 'center' }}
                >
                  {m.label}
                </Typography>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
