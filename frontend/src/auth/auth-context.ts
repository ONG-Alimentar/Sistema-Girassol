import { createContext } from 'react'
import type { Credenciais, Usuario } from '../api/auth.ts'
import type { Permission } from './permissions.ts'

export interface AuthValue {
  user: Usuario | null
  loading: boolean
  login: (credenciais: Credenciais) => Promise<void>
  logout: () => Promise<void>
  can: (required: Permission | Permission[]) => boolean
}

export const AuthContext = createContext<AuthValue | null>(null)
