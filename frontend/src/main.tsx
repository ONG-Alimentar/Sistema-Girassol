import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { ToastProvider } from './context/ToastProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* basename = subpath do deploy (GitHub Pages serve em /Sistema-Girassol/).
        import.meta.env.BASE_URL vem do `base` do vite.config: '/Sistema-Girassol/'
        no build e '/' em dev — sem isto, nenhuma rota casa em prod e tudo cai no
        fallback '* → /404'. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        {/* AuthProvider precisa envolver as rotas: RequireAuth/LoginPage usam
            useAuth(), e é ele quem importa a camada de API (api/auth.ts). Sem
            montá-lo, useAuth() quebra e a API é removida por tree-shaking. */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);