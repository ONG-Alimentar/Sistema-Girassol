import { useContext } from 'react'
import { AuthContext } from './auth-context.ts'

/** Acessa o contexto de autenticação. Deve estar dentro de <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}
