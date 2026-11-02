import { Navigate, Route, Routes } from 'react-router-dom'
import { PermissionGuard } from './auth/PermissionGuard.jsx'
import { RequireAuth } from './auth/RequireAuth.jsx'
import { AppLayout } from './layouts/AppLayout.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { ForbiddenPage } from './pages/ForbiddenPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ModulePlaceholder } from './pages/ModulePlaceholder.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

// Módulos protegidos por permissão. Cada um vira uma rota cujo elemento é
// envolvido por PermissionGuard (redirect → /403 quando falta a permissão).
const MODULES = [
  { path: 'familias', title: 'Famílias', permission: 'FAMILIA:READ' },
  { path: 'cestas', title: 'Cestas', permission: 'CESTA:READ' },
  { path: 'roupas', title: 'Roupas', permission: 'ROUPA:READ' },
  { path: 'visitas', title: 'Visitas', permission: 'VISITA:READ' },
  { path: 'juridico', title: 'Jurídico', permission: 'JURIDICO:READ' },
  { path: 'psicologico', title: 'Psicológico', permission: 'PSICOLOGICO:READ' },
]

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Autenticadas: RequireAuth protege todo o grupo */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {MODULES.map((m) => (
            <Route
              key={m.path}
              path={m.path}
              element={
                <PermissionGuard permission={m.permission} redirect>
                  <ModulePlaceholder title={m.title} />
                </PermissionGuard>
              }
            />
          ))}
          <Route path="403" element={<ForbiddenPage />} />
        </Route>
      </Route>

      {/* Fallbacks */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
