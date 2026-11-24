import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { LoadingState } from './components/common/LoadingState'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PermissionGuard } from './auth/PermissionGuard.tsx'
import { RequireAuth } from './auth/RequireAuth.tsx'
import type { Permission } from './auth/permissions.ts'
import { MODULES } from './navigation/modules.ts'
import { AppLayout } from './layouts/AppLayout.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { ForbiddenPage } from './pages/ForbiddenPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { ModulePlaceholder } from './pages/ModulePlaceholder.tsx'
import { UsuarioDetailPage } from './pages/admin/UsuarioDetailPage'
import { UsuarioFormPage } from './pages/admin/UsuarioFormPage'
import { CargoDetailPage } from './pages/admin/CargoDetailPage'
import { CargoFormPage } from './pages/admin/CargoFormPage'
import { PermissaoDetailPage } from './pages/admin/PermissaoDetailPage'
import { FamiliaDetailPage } from './pages/familias/FamiliaDetailPage.tsx'
import { CestaDetailPage } from './pages/cestas/CestaDetailPage'
import { CestaFormPage } from './pages/cestas/CestaFormPage'
import { RoupaDetailPage } from './pages/roupas/RoupaDetailPage'
import { RoupaFormPage } from './pages/roupas/RoupaFormPage'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { FamiliaFormPage } from './pages/FamiliaFormPage';

const ExampleListPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleListPage').then((module) => ({ default: module.ExampleListPage }))) : () => null
const ExampleDetailPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleDetailPage').then((module) => ({ default: module.ExampleDetailPage }))) : () => null
const ExampleEditPage = import.meta.env.DEV ? lazy(() => import('./pages/examples/ExampleEditPage').then((module) => ({ default: module.ExampleEditPage }))) : () => null

const ADMIN_DETAIL_ROUTES: { path: string; permission: Permission; element: ReactNode }[] = [
  { path: 'admin/usuarios/:id', permission: 'USUARIO:READ', element: <UsuarioDetailPage /> },
  { path: 'admin/cargos/:id', permission: 'CARGO:READ', element: <CargoDetailPage /> },
  { path: 'admin/permissoes/:id', permission: 'PERMISSAO:READ', element: <PermissaoDetailPage /> },
]

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
          <Route
            path="familias/nova"
            element={
              <PermissionGuard permission="FAMILIA:CREATE" redirect>
                <FamiliaFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="familias/:id/editar"
            element={
              <PermissionGuard permission="FAMILIA:UPDATE" redirect>
                <FamiliaFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="familias/:id"
            element={
              <PermissionGuard permission="FAMILIA:READ" redirect>
                <FamiliaDetailPage />
              </PermissionGuard>
            }
          />
          {/* Administração RBAC (#3): criação e edição de Usuário e Cargo.
              A listagem e o detalhe vêm do registro de MÓDULOS / ADMIN_DETAIL_ROUTES abaixo. */}
          <Route
            path="admin/usuarios/novo"
            element={
              <PermissionGuard permission="USUARIO:CREATE" redirect>
                <UsuarioFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/usuarios/:id/editar"
            element={
              <PermissionGuard permission="USUARIO:UPDATE" redirect>
                <UsuarioFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/cargos/novo"
            element={
              <PermissionGuard permission="CARGO:CREATE" redirect>
                <CargoFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="admin/cargos/:id/editar"
            element={
              <PermissionGuard permission="CARGO:UPDATE" redirect>
                <CargoFormPage />
              </PermissionGuard>
            }
          />
          {/* Doações de cesta (#6): criação, edição e detalhe. A listagem
              /cestas vem do registro de MÓDULOS abaixo (component). */}
          <Route
            path="cestas/novo"
            element={
              <PermissionGuard permission="CESTA:CREATE" redirect>
                <CestaFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="cestas/:id/editar"
            element={
              <PermissionGuard permission="CESTA:UPDATE" redirect>
                <CestaFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="cestas/:id"
            element={
              <PermissionGuard permission="CESTA:READ" redirect>
                <CestaDetailPage />
              </PermissionGuard>
            }
          />
          {/* Doações de roupa (#7): criação e detalhe. Sem edição — não há
              ROUPA:UPDATE no RBAC atual. A listagem /roupas vem do registro
              de MÓDULOS abaixo (component). */}
          <Route
            path="roupas/novo"
            element={
              <PermissionGuard permission="ROUPA:CREATE" redirect>
                <RoupaFormPage />
              </PermissionGuard>
            }
          />
          <Route
            path="roupas/:id"
            element={
              <PermissionGuard permission="ROUPA:READ" redirect>
                <RoupaDetailPage />
              </PermissionGuard>
            }
          />
          {MODULES.map((m) => {
            const Page = m.component
            return (
              <Route
                key={m.path}
                path={m.path}
                element={
                  <PermissionGuard permission={m.permission} redirect>
                    {Page ? <Page /> : <ModulePlaceholder title={m.label} />}
                  </PermissionGuard>
                }
              />
            )
          })}
          {ADMIN_DETAIL_ROUTES.map((r) => (
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

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
