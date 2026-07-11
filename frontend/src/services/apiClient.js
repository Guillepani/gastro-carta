const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const AUTH_TOKEN_KEY = 'gastro_carta_admin_token'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function getStoredAuthToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function storeAuthToken(token) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}

export async function apiRequest(path, options = {}) {
  const token = getStoredAuthToken()
  const hasBody = options.body !== undefined
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = {
    Accept: 'application/json',
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || 'No se pudo completar la petición',
      response.status,
      data?.error?.code,
    )
  }

  return data
}
