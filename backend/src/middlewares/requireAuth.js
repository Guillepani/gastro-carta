import { AuthError, verifyAuthToken } from '../utils/auth.utils.js'

export function requireAuth(request, response, next) {
  const authorization = request.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return response.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Se necesita un token de acceso',
      },
    })
  }

  try {
    request.auth = verifyAuthToken(authorization.slice(7).trim())
    return next()
  } catch (error) {
    const statusCode = error instanceof AuthError ? error.statusCode : 401
    const code = error instanceof AuthError ? error.code : 'INVALID_TOKEN'
    const message =
      error instanceof AuthError ? error.message : 'Token inválido o expirado'

    return response.status(statusCode).json({ error: { code, message } })
  }
}
