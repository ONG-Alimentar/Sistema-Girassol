import { lazy, Suspense } from 'react'
import { LoadingState } from './components/common/LoadingState'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PermissionGuard } from './auth/PermissionGuard.tsx'
import { RequireAuth } from './auth/RequireAuth.tsx'
import { MODULES } from './navigation/modules.ts'
import { AppLayout } from './layouts/AppLayout.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { ModulePlaceholder } from './pages/ModulePlaceholder.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'

// Exemplos carregados apenas em desenvolvimento, sem entrar no menu de produção.
const ExampleListPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleListPage').then((module) => ({ default: module.ExampleListPage }))) : () => null
const ExampleDetailPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleDetailPage').then((module) => ({ default: module.ExampleDetailPage }))) : () => null
const ExampleEditPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleEditPage').then((module) => ({ default: module.ExampleEditPage }))) : () => null

// Os módulos protegidos vêm do registro único em navigation/modules.ts
// (compartilhado com o drawer e a home). Cada um vira uma rota cujo elemento é
// envolvido por PermissionGuard (redirect → /403 quando falta a permissão).

/** Árvore de rotas da aplicação. */
export function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Autenticadas: RequireAuth protege todo o grupo */}
      <Route element={<RequireAuth />}>
        {import.meta.env.DEV && (
          <>
            <Route path="examples/listagem" element={<Suspense fallback={<LoadingState />}><ExampleListPage /></Suspense>} />
            <Route path="examples/listagem/:id" element={<Suspense fallback={<LoadingState />}><ExampleDetailPage /></Suspense>} />
            <Route path="examples/listagem/:id/editar" element={<Suspense fallback={<LoadingState />}><ExampleEditPage /></Suspense>} />
          </>
        )}
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {MODULES.map((m) => (
            <Route
              key={m.path}
              path={m.path}
              element={
                <PermissionGuard permission={m.permission} redirect>
                  <ModulePlaceholder title={m.label} />
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
