import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutlined'
import PinOutlinedIcon from '@mui/icons-material/PinOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { LoginDecorations } from '../components/brand/LoginDecorations.tsx'
import { SunflowerLogo } from '../components/brand/SunflowerLogo.tsx'
import * as authApi from '../api/auth.ts'
import { getApiFieldErrors } from '../api/errors.ts'
import { ApiError } from '../api/client.ts'
import { useToast } from '../hooks/useToast.ts'

type Etapa = 'email' | 'codigo' | 'novaSenha'

const SENHA_MIN = 8

export function RecuperarSenhaPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState<Etapa>('email')
  const [enviando, setEnviando] = useState(false)

  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroCodigo, setErroCodigo] = useState<string | null>(null)
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({})

  async function handleSolicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    try {
      await authApi.solicitarRecuperacaoSenha(email)
      showToast('Se o email existir, enviamos um código de verificação.', 'info')
      setEtapa('codigo')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível enviar o código.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  async function handleValidarCodigo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    setErroCodigo(null)
    try {
      await authApi.validarCodigoRecuperacao(email, codigo)
      setEtapa('novaSenha')
    } catch (e) {
      const campos = getApiFieldErrors(e)
      setErroCodigo(campos.codigo ?? (e instanceof Error ? e.message : 'Código inválido.'))
    } finally {
      setEnviando(false)
    }
  }

  async function handleRedefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviando(true)
    setErrosSenha({})
    try {
      await authApi.redefinirSenha({ email, codigo, novaSenha, confirmarSenha })
      showToast('Senha redefinida com sucesso! Faça login com a nova senha.', 'success')
      navigate('/login', { replace: true })
    } catch (e) {
      const campos = getApiFieldErrors(e)
      if (Object.keys(campos).length > 0) {
        setErrosSenha(campos)
      } else {
        showToast(e instanceof ApiError ? e.message : 'Não foi possível redefinir a senha.', 'error')
      }
    } finally {
      setEnviando(false)
    }
  }

  async function reenviarCodigo() {
    setEnviando(true)
    try {
      await authApi.solicitarRecuperacaoSenha(email)
      showToast('Reenviamos o código de verificação.', 'info')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível reenviar o código.', 'error')
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

        {etapa === 'email' && (
          <Box component="form" onSubmit={handleSolicitar} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Informe o email da sua conta. Enviaremos um código de verificação para
                redefinir sua senha.
              </Typography>
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon color="primary" />
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
                {enviando ? 'Enviando…' : 'Enviar código'}
              </Button>
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => navigate('/login')}
                sx={{ color: 'text.secondary', alignSelf: 'center', fontWeight: 600 }}
              >
                Voltar para o login
              </Link>
            </Box>
          </Box>
        )}

        {etapa === 'codigo' && (
          <Box component="form" onSubmit={handleValidarCodigo} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Digite o código de 6 dígitos enviado para <strong>{email}</strong>.
              </Typography>
              <TextField
                label="Código de verificação"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
                inputMode="numeric"
                error={!!erroCodigo}
                helperText={erroCodigo ?? ' '}
                slotProps={{
                  htmlInput: { maxLength: 6, style: { letterSpacing: '0.5em', textAlign: 'center' } },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PinOutlinedIcon color="primary" />
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
                disabled={enviando || codigo.length !== 6}
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1, py: 1.5 }}
              >
                {enviando ? 'Validando…' : 'Validar código'}
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => setEtapa('email')}
                  sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <ArrowBackIcon fontSize="small" /> Trocar email
                </Link>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={reenviarCodigo}
                  sx={{ color: 'text.secondary', fontWeight: 600 }}
                >
                  Reenviar código
                </Link>
              </Box>
            </Box>
          </Box>
        )}

        {etapa === 'novaSenha' && (
          <Box component="form" onSubmit={handleRedefinir} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Cadastre sua nova senha (mínimo de {SENHA_MIN} caracteres).
              </Typography>
              <TextField
                type={mostrarSenha ? 'text' : 'password'}
                label="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                autoFocus
                autoComplete="new-password"
                error={!!errosSenha.novaSenha}
                helperText={errosSenha.novaSenha ?? ' '}
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
              <TextField
                type={mostrarSenha ? 'text' : 'password'}
                label="Confirmar nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                autoComplete="new-password"
                error={!!errosSenha.confirmarSenha}
                helperText={errosSenha.confirmarSenha ?? ' '}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="primary" />
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
                {enviando ? 'Salvando…' : 'Redefinir senha'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
