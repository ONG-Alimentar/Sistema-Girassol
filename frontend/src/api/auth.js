// Endpoints de autenticação. Contrato mínimo enquanto o mecanismo definitivo
// (sessão × JWT) não é fechado no backend — ver docs/seguranca/rbac.md.
import { apiFetch } from './client.js'

/**
 * @typedef {Object} Usuario
 * @property {number} id
 * @property {string} email
 * @property {string} [nome]
 * @property {string[]} permissions  Autoridades no formato MODULO:ACAO.
 */

/**
 * Autentica o usuário.
 * @param {{ email: string, senha: string }} credenciais
 * @returns {Promise<Usuario>}
 */
export function login(credenciais) {
  return apiFetch('/api/auth/login', { method: 'POST', body: credenciais })
}

/** Encerra a sessão atual no backend. */
export function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' })
}

/**
 * Retorna o usuário autenticado e suas permissões, ou null se não houver
 * sessão (backend responde 401).
 * @returns {Promise<Usuario|null>}
 */
export async function me() {
  try {
    return await apiFetch('/api/auth/me')
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}
