import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth.ts'
import type { Permission } from './permissions.ts'

interface PermissionGuardProps {
  permission: Permission | Permission[]
  redirect?: boolean
  fallback?: ReactNode
  children?: ReactNode
}

export function PermissionGuard({
  permission,
  redirect = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can } = useAuth()

  if (can(permission)) return <>{children}</>
  if (redirect) return <Navigate to="/403" replace />
  return <>{fallback}</>
}
