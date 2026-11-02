import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import './index.css'

// basename acompanha o `base` do Vite (ver vite.config.ts): '/' em dev e
// '/Sistema-Girassol/' no build do GitHub Pages. Sem barra final para o router.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Elemento #root não encontrado')

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
