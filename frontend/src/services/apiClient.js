const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
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
