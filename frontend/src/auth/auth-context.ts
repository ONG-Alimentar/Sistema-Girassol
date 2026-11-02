import { createContext } from 'react'
import type { Credenciais, Usuario } from '../api/auth.ts'
import type { Permission } from './permissions.ts'

export interface AuthValue {
  /** Usuário atual, ou null se não autenticado. */
  user: Usuario | null
  /** true enquanto a sessão é restaurada no boot. */
  loading: boolean
  login: (credenciais: Credenciais) => Promise<void>
  logout: () => Promise<void>
  /** Checa se o usuário tem a(s) permissão(ões) (OR entre a lista). */
  can: (required: Permission | Permission[]) => boolean
}

export const AuthContext = createContext<AuthValue | null>(null)
