import { query, withTransaction } from '../../config/database.js'
import {
  AuthError,
  comparePassword,
  hashPassword,
  requireJwtConfiguration,
  signAuthToken,
  validateLoginInput,
  validateRegisterInput,
} from '../../utils/auth.utils.js'
import { slugify } from '../../utils/slug.utils.js'

const TEMPLATE_CATEGORIES = [
  { name: 'Entrantes', slug: 'entrantes' },
  { name: 'Principales', slug: 'principales' },
  { name: 'Postres', slug: 'postres' },
  { name: 'Bebidas', slug: 'bebidas' },
]

function mapAdmin(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRestaurant(row) {
  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    menuTheme: row.menu_theme || 'classic',
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function createSlug(inputSlug, restaurantName) {
  const slug = slugify(inputSlug || restaurantName)

  if (!slug || slug.length > 160) {
    throw new AuthError(
      400,
      'VALIDATION_ERROR',
      'No se puede generar un slug válido para el restaurante',
    )
  }

  return slug
}

async function assertRegistrationIsAvailable(client, email, slug) {
  const [adminResult, restaurantResult] = await Promise.all([
    client.query('SELECT 1 FROM admin_users WHERE lower(email) = $1', [email]),
    client.query('SELECT 1 FROM restaurants WHERE slug = $1', [slug]),
  ])

  if (adminResult.rowCount > 0) {
    throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'El email ya está registrado')
  }

  if (restaurantResult.rowCount > 0) {
    throw new AuthError(
      409,
      'SLUG_ALREADY_EXISTS',
      'El slug del restaurante ya está en uso',
    )
  }
}

async function insertTemplateCategories(client, restaurantId) {
  for (const [sortOrder, category] of TEMPLATE_CATEGORIES.entries()) {
    await client.query(
      `INSERT INTO categories (restaurant_id, name, slug, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [restaurantId, category.name, category.slug, sortOrder],
    )
  }
}

function translateUniqueViolation(error) {
  if (error.code !== '23505') return error

  if (error.constraint === 'admin_users_email_unique_idx') {
    return new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'El email ya está registrado')
  }

  if (error.constraint === 'restaurants_slug_key') {
    return new AuthError(
      409,
      'SLUG_ALREADY_EXISTS',
      'El slug del restaurante ya está en uso',
    )
  }

  return new AuthError(409, 'RESOURCE_ALREADY_EXISTS', 'El registro ya existe')
}

async function findRestaurantByAdminId(database, adminUserId) {
  const result = await database.query(
    `SELECT id, name, slug, description, address, phone, email,
            menu_theme, is_active, created_at, updated_at
     FROM restaurants
     WHERE admin_user_id = $1
     ORDER BY created_at
     LIMIT 1`,
    [adminUserId],
  )

  return result.rows[0] ?? null
}

export async function registerAdmin(input) {
  requireJwtConfiguration()
  const data = validateRegisterInput(input)
  const restaurantSlug = createSlug(data.restaurantSlug, data.restaurantName)
  const passwordHash = await hashPassword(data.password)

  let registration

  try {
    registration = await withTransaction(async (client) => {
      await assertRegistrationIsAvailable(client, data.email, restaurantSlug)

      const adminResult = await client.query(
        `INSERT INTO admin_users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at, updated_at`,
        [data.name, data.email, passwordHash],
      )
      const admin = adminResult.rows[0]

      const restaurantResult = await client.query(
        `INSERT INTO restaurants (admin_user_id, name, slug, email)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, slug, description, address, phone, email,
                   menu_theme, is_active, created_at, updated_at`,
        [admin.id, data.restaurantName, restaurantSlug, data.email],
      )
      const restaurant = restaurantResult.rows[0]

      await insertTemplateCategories(client, restaurant.id)
      return { admin, restaurant, token: signAuthToken(admin.id) }
    })
  } catch (error) {
    throw translateUniqueViolation(error)
  }

  return {
    admin: mapAdmin(registration.admin),
    restaurant: mapRestaurant(registration.restaurant),
    token: registration.token,
  }
}

export async function loginAdmin(input) {
  requireJwtConfiguration()
  const data = validateLoginInput(input)
  const adminResult = await query(
    `SELECT id, name, email, password_hash, created_at, updated_at
     FROM admin_users
     WHERE lower(email) = $1`,
    [data.email],
  )
  const admin = adminResult.rows[0]

  if (!admin || !(await comparePassword(data.password, admin.password_hash))) {
    throw new AuthError(
      401,
      'INVALID_CREDENTIALS',
      'Email o contraseña incorrectos',
    )
  }

  const restaurant = await findRestaurantByAdminId({ query }, admin.id)

  return {
    admin: mapAdmin(admin),
    restaurant: mapRestaurant(restaurant),
    token: signAuthToken(admin.id),
  }
}

export async function getAuthenticatedAdmin(adminUserId) {
  const adminResult = await query(
    `SELECT id, name, email, created_at, updated_at
     FROM admin_users
     WHERE id = $1`,
    [adminUserId],
  )
  const admin = adminResult.rows[0]

  if (!admin) {
    throw new AuthError(401, 'INVALID_TOKEN', 'El usuario autenticado no existe')
  }

  const restaurant = await findRestaurantByAdminId({ query }, admin.id)
  return { admin: mapAdmin(admin), restaurant: mapRestaurant(restaurant) }
}
