import { AuthError } from '../../utils/auth.utils.js'
import {
  getAuthenticatedAdmin,
  loginAdmin,
  registerAdmin,
} from './auth.service.js'

function sendError(response, error) {
  if (error instanceof AuthError) {
    return response.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    })
  }

  console.error('Error interno en el módulo de autenticación')
  return response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'No se pudo completar la operación',
    },
  })
}

export async function register(request, response) {
  try {
    const result = await registerAdmin(request.body)
    return response.status(201).json(result)
  } catch (error) {
    return sendError(response, error)
  }
}

export async function login(request, response) {
  try {
    const result = await loginAdmin(request.body)
    return response.status(200).json(result)
  } catch (error) {
    return sendError(response, error)
  }
}

export async function me(request, response) {
  try {
    const result = await getAuthenticatedAdmin(request.auth.adminUserId)
    return response.status(200).json(result)
  } catch (error) {
    return sendError(response, error)
  }
}
