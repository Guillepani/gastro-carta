import { readFile } from 'node:fs/promises'
import bcrypt from 'bcrypt'
import { parse } from 'csv-parse/sync'
import {
  closeDatabaseConnection,
  withTransaction,
} from '../config/database.js'
import { env } from '../config/env.js'

const CSV_URL = new URL('../../data/gastro_carta_seed.csv', import.meta.url)
const RESTAURANT_NAME = 'Las Delicias de Isa'
const RESTAURANT_SLUG = 'las-delicias-de-isa'
const DEMO_ADMIN_NAME = 'Administrador Demo'
const REQUIRED_COLUMNS = [
  'category',
  'subcategory',
  'name',
  'description',
  'price',
  'allergens',
  'isAvailable',
]

const ALLERGEN_SLUGS = Object.freeze({
  altramuces: 'altramuces',
  apio: 'apio',
  cacahuetes: 'cacahuetes',
  crustaceos: 'crustaceos',
  frutos_secos: 'frutos-de-cascara',
  gluten: 'gluten',
  huevos: 'huevo',
  lacteos: 'leche',
  moluscos: 'moluscos',
  mostaza: 'mostaza',
  pescado: 'pescado',
  sesamo: 'sesamo',
  soja: 'soja',
  sulfitos: 'sulfitos',
})

function requireSeedConfiguration() {
  const missingVariables = []

  if (!env.databaseUrl) missingVariables.push('DATABASE_URL')
  if (!env.demoAdminEmail) missingVariables.push('DEMO_ADMIN_EMAIL')
  if (!env.demoAdminPassword) missingVariables.push('DEMO_ADMIN_PASSWORD')

  if (missingVariables.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missingVariables.join(', ')}`)
  }
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseBoolean(value, rowNumber) {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`Valor isAvailable inválido en la fila ${rowNumber}`)
}

function validateAndNormalizeRows(records) {
  if (records.length === 0) {
    throw new Error('El CSV no contiene productos')
  }

  const columns = Object.keys(records[0])
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !columns.includes(column))

  if (missingColumns.length > 0) {
    throw new Error(`Faltan columnas en el CSV: ${missingColumns.join(', ')}`)
  }

  return records.map((record, index) => {
    const rowNumber = index + 2
    const price = Number(record.price)

    if (!record.category || !record.subcategory || !record.name) {
      throw new Error(`Faltan datos obligatorios en la fila ${rowNumber}`)
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Precio inválido en la fila ${rowNumber}`)
    }

    const allergenSlugs = record.allergens
      .split('|')
      .map((allergen) => allergen.trim())
      .filter(Boolean)
      .map((allergen) => {
        const slug = ALLERGEN_SLUGS[allergen]
        if (!slug) {
          throw new Error(`Alérgeno desconocido en la fila ${rowNumber}: ${allergen}`)
        }
        return slug
      })

    return {
      category: record.category,
      subcategory: record.subcategory,
      name: record.name,
      description: record.description || null,
      price,
      allergenSlugs: [...new Set(allergenSlugs)],
      isAvailable: parseBoolean(record.isAvailable, rowNumber),
    }
  })
}

async function readSeedRows() {
  const csv = await readFile(CSV_URL, 'utf8')
  const records = parse(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  return validateAndNormalizeRows(records)
}

async function upsertAdmin(client, passwordHash) {
  const result = await client.query(
    `INSERT INTO admin_users (email, password_hash, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (lower(email)) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         updated_at = now()
     RETURNING id`,
    [env.demoAdminEmail, passwordHash, DEMO_ADMIN_NAME],
  )

  return result.rows[0].id
}

async function upsertRestaurant(client, adminUserId) {
  const result = await client.query(
    `INSERT INTO restaurants (admin_user_id, name, slug, description, email)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE
     SET admin_user_id = EXCLUDED.admin_user_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         email = EXCLUDED.email,
         is_active = true,
         updated_at = now()
     RETURNING id`,
    [
      adminUserId,
      RESTAURANT_NAME,
      RESTAURANT_SLUG,
      'Restaurante demo del proyecto Gastro Carta.',
      env.demoAdminEmail,
    ],
  )

  return result.rows[0].id
}

async function loadAllergens(client) {
  const slugs = [...new Set(Object.values(ALLERGEN_SLUGS))]
  const result = await client.query(
    'SELECT id, slug FROM allergens WHERE slug = ANY($1::text[])',
    [slugs],
  )
  const allergensBySlug = new Map(result.rows.map((row) => [row.slug, row.id]))
  const missingAllergens = slugs.filter((slug) => !allergensBySlug.has(slug))

  if (missingAllergens.length > 0) {
    throw new Error(`Faltan alérgenos globales: ${missingAllergens.join(', ')}`)
  }

  return allergensBySlug
}

async function upsertCategory(client, restaurantId, name, sortOrder) {
  const result = await client.query(
    `INSERT INTO categories (restaurant_id, name, slug, sort_order)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (restaurant_id, slug) DO UPDATE
     SET name = EXCLUDED.name,
         sort_order = EXCLUDED.sort_order,
         is_active = true,
         updated_at = now()
     RETURNING id`,
    [restaurantId, name, slugify(name), sortOrder],
  )

  return result.rows[0].id
}

async function upsertSubcategory(
  client,
  restaurantId,
  categoryId,
  name,
  sortOrder,
) {
  const result = await client.query(
    `INSERT INTO subcategories (
       restaurant_id,
       category_id,
       name,
       slug,
       sort_order
     )
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (category_id, slug) DO UPDATE
     SET restaurant_id = EXCLUDED.restaurant_id,
         name = EXCLUDED.name,
         sort_order = EXCLUDED.sort_order,
         is_active = true,
         updated_at = now()
     RETURNING id`,
    [restaurantId, categoryId, name, slugify(name), sortOrder],
  )

  return result.rows[0].id
}

async function upsertProduct(
  client,
  restaurantId,
  categoryId,
  subcategoryId,
  product,
  sortOrder,
) {
  const existingProduct = await client.query(
    `SELECT id
     FROM products
     WHERE restaurant_id = $1
       AND category_id = $2
       AND subcategory_id IS NOT DISTINCT FROM $3
       AND name = $4
     ORDER BY created_at
     LIMIT 1`,
    [restaurantId, categoryId, subcategoryId, product.name],
  )

  if (existingProduct.rowCount > 0) {
    const productId = existingProduct.rows[0].id
    await client.query(
      `UPDATE products
       SET description = $2,
           price = $3,
           is_available = $4,
           sort_order = $5,
           updated_at = now()
       WHERE id = $1`,
      [
        productId,
        product.description,
        product.price,
        product.isAvailable,
        sortOrder,
      ],
    )
    return productId
  }

  const insertedProduct = await client.query(
    `INSERT INTO products (
       restaurant_id,
       category_id,
       subcategory_id,
       name,
       description,
       price,
       is_available,
       sort_order
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      restaurantId,
      categoryId,
      subcategoryId,
      product.name,
      product.description,
      product.price,
      product.isAvailable,
      sortOrder,
    ],
  )

  return insertedProduct.rows[0].id
}

async function replaceProductAllergens(
  client,
  productId,
  allergenSlugs,
  allergensBySlug,
) {
  await client.query('DELETE FROM product_allergens WHERE product_id = $1', [
    productId,
  ])

  for (const slug of allergenSlugs) {
    await client.query(
      `INSERT INTO product_allergens (product_id, allergen_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [productId, allergensBySlug.get(slug)],
    )
  }
}

async function importMenu(client, restaurantId, products, allergensBySlug) {
  const categoryIds = new Map()
  const subcategoryIds = new Map()
  const categorySortOrders = new Map()
  const subcategorySortOrders = new Map()
  const productSortOrders = new Map()

  for (const product of products) {
    const categorySlug = slugify(product.category)
    let categoryId = categoryIds.get(categorySlug)

    if (!categoryId) {
      const categorySortOrder = categorySortOrders.size
      categoryId = await upsertCategory(
        client,
        restaurantId,
        product.category,
        categorySortOrder,
      )
      categoryIds.set(categorySlug, categoryId)
      categorySortOrders.set(categorySlug, categorySortOrder)
    }

    const subcategorySlug = slugify(product.subcategory)
    const subcategoryKey = `${categoryId}:${subcategorySlug}`
    let subcategoryId = subcategoryIds.get(subcategoryKey)

    if (!subcategoryId) {
      const subcategorySortOrder = subcategorySortOrders.get(categoryId) ?? 0
      subcategoryId = await upsertSubcategory(
        client,
        restaurantId,
        categoryId,
        product.subcategory,
        subcategorySortOrder,
      )
      subcategoryIds.set(subcategoryKey, subcategoryId)
      subcategorySortOrders.set(categoryId, subcategorySortOrder + 1)
    }

    const productSortOrder = productSortOrders.get(subcategoryId) ?? 0
    const productId = await upsertProduct(
      client,
      restaurantId,
      categoryId,
      subcategoryId,
      product,
      productSortOrder,
    )
    productSortOrders.set(subcategoryId, productSortOrder + 1)

    await replaceProductAllergens(
      client,
      productId,
      product.allergenSlugs,
      allergensBySlug,
    )
  }
}

async function getSeedCounts(client, restaurantId) {
  const result = await client.query(
    `SELECT
       (SELECT count(*)::integer FROM restaurants) AS restaurants,
       (SELECT count(*)::integer FROM categories WHERE restaurant_id = $1)
         AS categories,
       (SELECT count(*)::integer FROM subcategories WHERE restaurant_id = $1)
         AS subcategories,
       (SELECT count(*)::integer FROM products WHERE restaurant_id = $1)
         AS products,
       (
         SELECT count(*)::integer
         FROM product_allergens pa
         JOIN products p ON p.id = pa.product_id
         WHERE p.restaurant_id = $1
       ) AS product_allergens`,
    [restaurantId],
  )

  return result.rows[0]
}

function isSafeErrorMessage(message) {
  const secrets = [env.databaseUrl, env.jwtSecret, env.demoAdminPassword].filter(
    Boolean,
  )
  return !secrets.some((secret) => message.includes(secret))
}

async function seedDemoRestaurant() {
  requireSeedConfiguration()
  const products = await readSeedRows()
  const passwordHash = await bcrypt.hash(
    env.demoAdminPassword,
    env.bcryptSaltRounds,
  )

  return withTransaction(async (client) => {
    const adminUserId = await upsertAdmin(client, passwordHash)
    const restaurantId = await upsertRestaurant(client, adminUserId)
    const allergensBySlug = await loadAllergens(client)
    await importMenu(client, restaurantId, products, allergensBySlug)
    return getSeedCounts(client, restaurantId)
  })
}

try {
  const counts = await seedDemoRestaurant()
  console.log('Seed demo completado')
  console.log(JSON.stringify(counts, null, 2))
} catch (error) {
  console.error('No se pudo ejecutar el seed demo')
  console.error(`Tipo: ${error.name}`)
  if (error.code) console.error(`Código: ${error.code}`)
  if (isSafeErrorMessage(error.message)) {
    console.error(`Detalle: ${error.message}`)
  }
  process.exitCode = 1
} finally {
  await closeDatabaseConnection()
}
