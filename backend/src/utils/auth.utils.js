import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class AuthError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
    this.code = code
  }
}

export function requireJwtConfiguration() {
  if (!env.jwtSecret) {
    throw new AuthError(
      500,
      'AUTH_NOT_CONFIGURED',
      'La autenticación no está configurada',
    )
  }
}

function requireText(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AuthError(400, 'VALIDATION_ERROR', `${field} es obligatorio`)
  }

  const normalizedValue = value.trim()
  if (normalizedValue.length > maxLength) {
    throw new AuthError(
      400,
      'VALIDATION_ERROR',
      `${field} supera la longitud máxima`,
    )
  }

  return normalizedValue
}

function validateEmail(value) {
  const email = requireText(value, 'email', 320).toLowerCase()

  if (!EMAIL_PATTERN.test(email)) {
    throw new AuthError(400, 'VALIDATION_ERROR', 'El email no es válido')
  }

  return email
}

function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 8) {
    throw new AuthError(
      400,
      'VALIDATION_ERROR',
      'La contraseña debe tener al menos 8 caracteres',
    )
  }

  if (Buffer.byteLength(value, 'utf8') > 72) {
    throw new AuthError(
      400,
      'VALIDATION_ERROR',
      'La contraseña supera la longitud máxima',
    )
  }

  return value
}

export function validateRegisterInput(input = {}) {
  const payload = input && typeof input === 'object' ? input : {}
  const restaurantSlug = payload.restaurantSlug

  if (
    restaurantSlug !== undefined &&
    (typeof restaurantSlug !== 'string' || restaurantSlug.length > 160)
  ) {
    throw new AuthError(
      400,
      'VALIDATION_ERROR',
      'restaurantSlug no es válido',
    )
  }

  return {
    name: requireText(payload.name, 'name', 120),
    email: validateEmail(payload.email),
    password: validatePassword(payload.password),
    restaurantName: requireText(payload.restaurantName, 'restaurantName', 160),
    restaurantSlug: restaurantSlug?.trim() || null,
  }
}

export function validateLoginInput(input = {}) {
  const payload = input && typeof input === 'object' ? input : {}

  return {
    email: validateEmail(payload.email),
    password: validatePassword(payload.password),
  }
}

export function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptSaltRounds)
}

export function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

export function signAuthToken(adminUserId) {
  requireJwtConfiguration()
  return jwt.sign({ adminUserId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

export function verifyAuthToken(token) {
  requireJwtConfiguration()

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (typeof payload !== 'object' || !payload.adminUserId) {
      throw new Error('Token sin identificador de admin')
    }
    return { adminUserId: payload.adminUserId }
  } catch {
    throw new AuthError(401, 'INVALID_TOKEN', 'Token inválido o expirado')
  }
}
