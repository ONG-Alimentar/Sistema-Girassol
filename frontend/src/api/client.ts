const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status?: number
  readonly body?: unknown

  constructor(message: string, options: { status?: number; body?: unknown } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.body = options.body
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | object | null
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  return text || null
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options

  const isJsonBody =
    body !== undefined &&
    body !== null &&
    typeof body !== 'string' &&
    !(body instanceof FormData)

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: isJsonBody ? JSON.stringify(body) : (body as BodyInit) }
      : {}),
    ...rest,
  })

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => null)
    let message = `Requisição falhou (${response.status})`
    if (
      errorBody &&
      typeof errorBody === 'object' &&
      'message' in errorBody &&
      typeof errorBody.message === 'string'
    ) {
      message = errorBody.message
    }
    throw new ApiError(message, { status: response.status, body: errorBody })
  }

  if (response.status === 204) return null as T
  return parseBody(response) as Promise<T>
}
