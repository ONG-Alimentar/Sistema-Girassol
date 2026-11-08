import { Navigate, Route, Routes } from 'react-router-dom'
import { PermissionGuard } from './auth/PermissionGuard.tsx'
import { RequireAuth } from './auth/RequireAuth.tsx'
import type { Permission } from './auth/permissions.ts'
import { AppLayout } from './layouts/AppLayout.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
//import { LoginPage } from './pages/LoginPage.tsx'
import { ModulePlaceholder } from './pages/ModulePlaceholder.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { FieldsTest } from './pages/FieldsTest.tsx'

interface ModuleRoute {
  path: string
  title: string
  permission: Permission
}

// Módulos protegidos por permissão. Cada um vira uma rota cujo elemento é
// envolvido por PermissionGuard (redirect → /403 quando falta a permissão).
const MODULES: ModuleRoute[] = [
  { path: 'familias', title: 'Famílias', permission: 'FAMILIA:READ' },
  { path: 'cestas', title: 'Cestas', permission: 'CESTA:READ' },
  { path: 'roupas', title: 'Roupas', permission: 'ROUPA:READ' },
  { path: 'visitas', title: 'Visitas', permission: 'VISITA:READ' },
  { path: 'juridico', title: 'Jurídico', permission: 'JURIDICO:READ' },
  { path: 'psicologico', title: 'Psicológico', permission: 'PSICOLOGICO:READ' },
]

/** Árvore de rotas da aplicação. */
export function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/teste-campos" element={<FieldsTest />} />

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
