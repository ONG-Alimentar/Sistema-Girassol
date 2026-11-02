import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { AuthContext } from './auth-context.js'
import { hasPermission } from './permissions.js'

/**
 * Provedor de autenticação. No boot, tenta restaurar a sessão via /auth/me e
 * expõe usuário, permissões e as ações de login/logout para toda a árvore.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credenciais) => {
    const u = await authApi.login(credenciais)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const can = useCallback(
    (required) => hasPermission(user?.permissions, required),
    [user],
  )

  const value = useMemo(
    () => ({ user, loading, login, logout, can }),
    [user, loading, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
