import { slugify } from '../../utils/slug.utils.js'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class AdminError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.name = 'AdminError'
    this.statusCode = statusCode
    this.code = code
  }
}

export function validateId(value, field = 'id') {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new AdminError(400, 'VALIDATION_ERROR', `${field} no es válido`)
  }
  return value
}

function payloadObject(input) {
  return input && typeof input === 'object' && !Array.isArray(input) ? input : {}
}

function requiredText(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AdminError(400, 'VALIDATION_ERROR', `${field} es obligatorio`)
  }
  const normalized = value.trim()
  if (normalized.length > maxLength) {
    throw new AdminError(400, 'VALIDATION_ERROR', `${field} es demasiado largo`)
  }
  return normalized
}

function optionalText(value, field, maxLength) {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') {
    throw new AdminError(400, 'VALIDATION_ERROR', `${field} no es válido`)
  }
  const normalized = value.trim()
  if (normalized.length > maxLength) {
    throw new AdminError(400, 'VALIDATION_ERROR', `${field} es demasiado largo`)
  }
  return normalized || null
}

function optionalBoolean(value, field, defaultValue) {
  if (value === undefined) return defaultValue
  if (typeof value !== 'boolean') {
    throw new AdminError(400, 'VALIDATION_ERROR', `${field} debe ser booleano`)
  }
  return value
}

function optionalSortOrder(value, defaultValue) {
  if (value === undefined) return defaultValue
  if (!Number.isInteger(value) || value < 0) {
    throw new AdminError(
      400,
      'VALIDATION_ERROR',
      'sortOrder debe ser un entero no negativo',
    )
  }
  return value
}

function normalizedSlug(value, fallback, maxLength = 120) {
  if (value !== undefined && typeof value !== 'string') {
    throw new AdminError(400, 'VALIDATION_ERROR', 'slug no es válido')
  }
  const slug = slugify(value?.trim() || fallback)
  if (!slug || slug.length > maxLength) {
    throw new AdminError(400, 'VALIDATION_ERROR', 'slug no es válido')
  }
  return slug
}

function ensureMutableFields(data) {
  if (Object.values(data).every((value) => value === undefined)) {
    throw new AdminError(400, 'VALIDATION_ERROR', 'No hay campos para actualizar')
  }
  return data
}

function validateAllergenIds(value, defaultValue) {
  if (value === undefined) return defaultValue
  if (!Array.isArray(value)) {
    throw new AdminError(400, 'VALIDATION_ERROR', 'allergenIds debe ser un array')
  }
  return [...new Set(value.map((id) => validateId(id, 'allergenId')))]
}

function validatePrice(value, required) {
  if (value === undefined && !required) return undefined
  const price = typeof value === 'string' && value.trim() ? Number(value) : value
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    throw new AdminError(400, 'VALIDATION_ERROR', 'price debe ser un número no negativo')
  }
  if (
    Math.abs(Math.round(price * 100) - price * 100) > 1e-8 ||
    price > 99999999.99
  ) {
    throw new AdminError(400, 'VALIDATION_ERROR', 'price no tiene un formato válido')
  }
  return price
}

export function validateRestaurantUpdate(input) {
  const payload = payloadObject(input)
  const name =
    payload.name === undefined ? undefined : requiredText(payload.name, 'name', 160)
  const slug =
    payload.slug === undefined
      ? undefined
      : normalizedSlug(payload.slug, name || '', 160)
  return ensureMutableFields({
    name,
    slug,
    description: optionalText(payload.description, 'description', 5000),
  })
}

export function validateCategoryCreate(input) {
  const payload = payloadObject(input)
  const name = requiredText(payload.name, 'name', 120)
  return {
    name,
    slug: normalizedSlug(payload.slug, name),
    sortOrder: optionalSortOrder(payload.sortOrder, 0),
    isActive: optionalBoolean(payload.isActive, 'isActive', true),
  }
}

export function validateCategoryUpdate(input) {
  const payload = payloadObject(input)
  const name =
    payload.name === undefined ? undefined : requiredText(payload.name, 'name', 120)
  return ensureMutableFields({
    name,
    slug:
      payload.slug === undefined ? undefined : normalizedSlug(payload.slug, name || ''),
    sortOrder: optionalSortOrder(payload.sortOrder, undefined),
    isActive: optionalBoolean(payload.isActive, 'isActive', undefined),
  })
}

export function validateSubcategoryCreate(input) {
  const payload = payloadObject(input)
  const name = requiredText(payload.name, 'name', 120)
  return {
    categoryId: validateId(payload.categoryId, 'categoryId'),
    name,
    slug: normalizedSlug(payload.slug, name),
    sortOrder: optionalSortOrder(payload.sortOrder, 0),
    isActive: optionalBoolean(payload.isActive, 'isActive', true),
  }
}

export function validateSubcategoryUpdate(input) {
  const payload = payloadObject(input)
  const name =
    payload.name === undefined ? undefined : requiredText(payload.name, 'name', 120)
  return ensureMutableFields({
    categoryId:
      payload.categoryId === undefined
        ? undefined
        : validateId(payload.categoryId, 'categoryId'),
    name,
    slug:
      payload.slug === undefined ? undefined : normalizedSlug(payload.slug, name || ''),
    sortOrder: optionalSortOrder(payload.sortOrder, undefined),
    isActive: optionalBoolean(payload.isActive, 'isActive', undefined),
  })
}

export function validateProductCreate(input) {
  const payload = payloadObject(input)
  return {
    categoryId: validateId(payload.categoryId, 'categoryId'),
    subcategoryId:
      payload.subcategoryId === null || payload.subcategoryId === undefined
        ? null
        : validateId(payload.subcategoryId, 'subcategoryId'),
    name: requiredText(payload.name, 'name', 160),
    description: optionalText(payload.description, 'description', 5000) ?? null,
    price: validatePrice(payload.price, true),
    isAvailable: optionalBoolean(payload.isAvailable, 'isAvailable', true),
    isFeatured: optionalBoolean(payload.isFeatured, 'isFeatured', false),
    sortOrder: optionalSortOrder(payload.sortOrder, 0),
    allergenIds: validateAllergenIds(payload.allergenIds, []),
  }
}

export function validateProductUpdate(input) {
  const payload = payloadObject(input)
  return ensureMutableFields({
    categoryId:
      payload.categoryId === undefined
        ? undefined
        : validateId(payload.categoryId, 'categoryId'),
    subcategoryId:
      payload.subcategoryId === undefined
        ? undefined
        : payload.subcategoryId === null
          ? null
          : validateId(payload.subcategoryId, 'subcategoryId'),
    name:
      payload.name === undefined ? undefined : requiredText(payload.name, 'name', 160),
    description: optionalText(payload.description, 'description', 5000),
    price: validatePrice(payload.price, false),
    isAvailable: optionalBoolean(payload.isAvailable, 'isAvailable', undefined),
    isFeatured: optionalBoolean(payload.isFeatured, 'isFeatured', undefined),
    sortOrder: optionalSortOrder(payload.sortOrder, undefined),
    allergenIds: validateAllergenIds(payload.allergenIds, undefined),
  })
}
