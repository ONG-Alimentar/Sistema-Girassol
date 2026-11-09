import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { LoginDecorations } from '../components/brand/LoginDecorations.tsx'
import { SunflowerLogo } from '../components/brand/SunflowerLogo.tsx'
import { useAuth } from '../auth/useAuth.ts'
import { useToast } from '../hooks/useToast.ts'

/** Tela de login (wireframe Login.png). Após autenticar, volta para a rota de
 *  origem (ou a home). Erros são mostrados via toast. */
export function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    try {
      await login({ email, senha })
      navigate(from, { replace: true })
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível entrar.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <LoginDecorations />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
        {/* Marca */}
        <Box
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 4 }}
        >
          <SunflowerLogo size={96} />
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1 }}>
            Sistema
          </Typography>
          <Typography component="h1" variant="h3" sx={{ color: 'primary.main', fontWeight: 800, mt: -0.5 }}>
            Girassol
          </Typography>
        </Box>

        {/* Formulário */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="email"
              label="Usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              type={mostrarSenha ? 'text' : 'password'}
              label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setMostrarSenha((v) => !v)}
                        edge="end"
                      >
                        {mostrarSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={enviando}
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 1, py: 1.5 }}
            >
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>

            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => showToast('Recuperação de senha em breve.', 'info')}
              sx={{ color: 'text.secondary', alignSelf: 'center', fontWeight: 600 }}
            >
              Esqueceu sua senha?
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
