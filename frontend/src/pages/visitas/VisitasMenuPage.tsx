import { Avatar, Button, Paper, Stack, Typography } from '@mui/material'
import EventNoteIcon from '@mui/icons-material/EventNote'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export function VisitasMenuPage() {
  const navigate = useNavigate()
  const { can } = useAuth()

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 650, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 56, height: 56 }}>
              <EventNoteIcon aria-hidden="true" />
            </Avatar>
            <Typography component="h1" variant="h4">Registro de visitas</Typography>
          </Stack>
          {can('VISITA:CREATE') && (
            <Button variant="outlined" fullWidth sx={{ py: 2 }} onClick={() => navigate('/visitas/nova')}>
              Cadastrar nova visita
            </Button>
          )}
          {can('VISITA:READ') && (
            <Button variant="outlined" fullWidth sx={{ py: 2 }} onClick={() => navigate('/visitas/listagem')}>
              Consultar visitas registradas
            </Button>
          )}
        </Stack>
      </Paper>
      <Button variant="outlined" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}>Voltar</Button>
    </Stack>
  )
}
