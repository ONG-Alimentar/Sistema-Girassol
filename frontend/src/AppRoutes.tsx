import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { LoadingState } from './components/common/LoadingState'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PermissionGuard } from './auth/PermissionGuard.tsx'
import { RequireAuth } from './auth/RequireAuth.tsx'
import type { Permission } from './auth/permissions.ts'
import { AppLayout } from './layouts/AppLayout.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { ModulePlaceholder } from './pages/ModulePlaceholder.tsx'
import { UsuariosPage } from './pages/admin/UsuariosPage'
import { CargosPage } from './pages/admin/CargosPage'
import { PermissoesPage } from './pages/admin/PermissoesPage'
import { NotFoundPage } from './pages/NotFoundPage.tsx'

// Exemplos carregados apenas em desenvolvimento, sem entrar no menu de produção.
const ExampleListPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleListPage').then((module) => ({ default: module.ExampleListPage }))) : () => null
const ExampleDetailPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleDetailPage').then((module) => ({ default: module.ExampleDetailPage }))) : () => null

interface ModuleRoute {
  path: string
  title: string
  permission: Permission
}

// Telas de administração RBAC (#3): páginas reais (não placeholders), cada uma
// protegida pela permissão de leitura da sua entidade.
const ADMIN_ROUTES: { path: string; permission: Permission; element: ReactNode }[] = [
  { path: 'admin/usuarios', permission: 'USUARIO:READ', element: <UsuariosPage /> },
  { path: 'admin/cargos', permission: 'CARGO:READ', element: <CargosPage /> },
  { path: 'admin/permissoes', permission: 'PERMISSAO:READ', element: <PermissoesPage /> },
]

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
      <Route path="/login" element={<LoginPage />} />

      {/* Autenticadas: RequireAuth protege todo o grupo */}
      <Route element={<RequireAuth />}>
        {import.meta.env.DEV && (
          <>
            <Route path="examples/listagem" element={<Suspense fallback={<LoadingState />}><ExampleListPage /></Suspense>} />
            <Route path="examples/listagem/:id" element={<Suspense fallback={<LoadingState />}><ExampleDetailPage /></Suspense>} />
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
                  <ModulePlaceholder title={m.title} />
                </PermissionGuard>
              }
            />
          ))}
          {ADMIN_ROUTES.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <PermissionGuard permission={r.permission} redirect>
                  {r.element}
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
