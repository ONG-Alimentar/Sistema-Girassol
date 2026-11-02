// Cliente de API centralizado: um único ponto para base URL, headers e
// tratamento de erro. Todas as chamadas ao backend passam por `apiFetch`.

// Base da API, configurável por ambiente (ver .env / VITE_API_URL). Sem barra
// final para evitar '//' ao concatenar com o path.
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

/** Erro de API com o status HTTP e o corpo já parseado (quando houver). */
export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function parseBody(response) {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  return text || null
}

/**
 * Faz uma requisição ao backend.
 *
 * @param {string} path  Caminho relativo à API (ex.: '/api/auth/me').
 * @param {RequestInit & { body?: unknown }} [options]  `body` é serializado
 *   como JSON automaticamente quando não for string/FormData.
 * @returns {Promise<unknown>} Corpo da resposta (JSON ou texto); null em 204.
 * @throws {ApiError} Quando a resposta não é 2xx.
 */
export async function apiFetch(path, options = {}) {
  const { body, headers, ...rest } = options

  const isJsonBody =
    body !== undefined &&
    body !== null &&
    typeof body !== 'string' &&
    !(body instanceof FormData)

  const response = await fetch(`${API_URL}${path}`, {
    // Inclui cookies de sessão; compatível com autenticação por cookie no
    // backend. Se adotarmos JWT no header, isto é inofensivo.
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: isJsonBody ? JSON.stringify(body) : body }
      : {}),
    ...rest,
  })

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => null)
    const message =
      (errorBody && typeof errorBody === 'object' && errorBody.message) ||
      `Requisição falhou (${response.status})`
    throw new ApiError(message, { status: response.status, body: errorBody })
  }

  if (response.status === 204) return null
  return parseBody(response)
}
