import { createContext } from 'react'

/**
 * Contexto de autenticação. Valor:
 * @typedef {Object} AuthValue
 * @property {import('../api/auth.js').Usuario|null} user  Usuário atual.
 * @property {boolean} loading  true enquanto a sessão é restaurada no boot.
 * @property {(cred: { email: string, senha: string }) => Promise<void>} login
 * @property {() => Promise<void>} logout
 * @property {(required: string|string[]) => boolean} can  Checa permissão.
 */
export const AuthContext = createContext(null)
