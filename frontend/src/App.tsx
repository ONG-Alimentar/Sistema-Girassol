import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { ToastProvider } from './context/ToastProvider.tsx';

/**
 * Raiz da aplicação: router + providers + rotas. Extraída de main.tsx para ser
 * testável (main.tsx só faz o createRoot no DOM).
 *
 * basename = subpath do deploy. Vem do `base` do vite.config via
 * import.meta.env.BASE_URL ('/Sistema-Girassol/' no build do GitHub Pages, '/'
 * em dev). Sem isto, nenhuma rota casa em prod e tudo cai no fallback '* → /404'.
 *
 * AuthProvider precisa envolver as rotas: RequireAuth/LoginPage usam useAuth(),
 * e é ele quem importa a camada de API (api/auth.ts). Sem montá-lo, useAuth()
 * quebra e a API some do bundle por tree-shaking.
 */
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
