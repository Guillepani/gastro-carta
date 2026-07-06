import { query, withTransaction } from '../../config/database.js'
import {
  AdminError,
  validateCategoryCreate,
  validateCategoryUpdate,
  validateId,
  validateProductCreate,
  validateProductUpdate,
  validateRestaurantUpdate,
  validateSubcategoryCreate,
  validateSubcategoryUpdate,
} from './admin.validators.js'

const database = { query }

function mapRestaurant(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    address: row.address,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapCategory(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapSubcategory(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAllergen(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji,
    description: row.description,
  }
}

function mapProduct(row, allergens = []) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    isAvailable: row.is_available,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    allergens,
  }
}

function notFound(resource) {
  throw new AdminError(404, 'RESOURCE_NOT_FOUND', `${resource} no existe`)
}

function conflict(message) {
  throw new AdminError(409, 'RESOURCE_CONFLICT', message)
}

function translateDatabaseError(error, duplicateMessage) {
  if (error instanceof AdminError) return error
  if (error.code === '23505') {
    return new AdminError(409, 'DUPLICATE_RESOURCE', duplicateMessage)
  }
  return error
}

async function findOwnedRestaurant(db, adminUserId, restaurantId, lock = false) {
  validateId(restaurantId, 'restaurantId')
  const result = await db.query(
    `SELECT id, name, slug, description, address, phone, email,
            is_active, created_at, updated_at
     FROM restaurants
     WHERE id = $1 AND admin_user_id = $2
     ${lock ? 'FOR UPDATE' : ''}`,
    [restaurantId, adminUserId],
  )
  if (result.rowCount === 0) notFound('El restaurante')
  return result.rows[0]
}

async function findOwnedCategory(db, adminUserId, categoryId, lock = false) {
  validateId(categoryId, 'categoryId')
  const result = await db.query(
    `SELECT c.id, c.restaurant_id, c.name, c.slug, c.sort_order,
            c.is_active, c.created_at, c.updated_at
     FROM categories c
     JOIN restaurants r ON r.id = c.restaurant_id
     WHERE c.id = $1 AND r.admin_user_id = $2
     ${lock ? 'FOR UPDATE OF c' : ''}`,
    [categoryId, adminUserId],
  )
  if (result.rowCount === 0) notFound('La categoría')
  return result.rows[0]
}

async function findOwnedSubcategory(db, adminUserId, subcategoryId, lock = false) {
  validateId(subcategoryId, 'subcategoryId')
  const result = await db.query(
    `SELECT s.id, s.restaurant_id, s.category_id, s.name, s.slug,
            s.sort_order, s.is_active, s.created_at, s.updated_at
     FROM subcategories s
     JOIN restaurants r ON r.id = s.restaurant_id
     WHERE s.id = $1 AND r.admin_user_id = $2
     ${lock ? 'FOR UPDATE OF s' : ''}`,
    [subcategoryId, adminUserId],
  )
  if (result.rowCount === 0) notFound('La subcategoría')
  return result.rows[0]
}

async function findOwnedProduct(db, adminUserId, productId, lock = false) {
  validateId(productId, 'productId')
  const result = await db.query(
    `SELECT p.id, p.restaurant_id, p.category_id, p.subcategory_id,
            p.name, p.description, p.price, p.is_available, p.is_featured,
            p.sort_order, p.created_at, p.updated_at
     FROM products p
     JOIN restaurants r ON r.id = p.restaurant_id
     WHERE p.id = $1 AND r.admin_user_id = $2
     ${lock ? 'FOR UPDATE OF p' : ''}`,
    [productId, adminUserId],
  )
  if (result.rowCount === 0) notFound('El producto')
  return result.rows[0]
}

async function assertCategoryInRestaurant(db, categoryId, restaurantId) {
  const result = await db.query(
    'SELECT 1 FROM categories WHERE id = $1 AND restaurant_id = $2',
    [categoryId, restaurantId],
  )
  if (result.rowCount === 0) {
    throw new AdminError(
      400,
      'INVALID_RELATION',
      'La categoría no pertenece al restaurante',
    )
  }
}

async function assertSubcategoryInCategory(
  db,
  subcategoryId,
  categoryId,
  restaurantId,
) {
  if (!subcategoryId) return
  const result = await db.query(
    `SELECT 1 FROM subcategories
     WHERE id = $1 AND category_id = $2 AND restaurant_id = $3`,
    [subcategoryId, categoryId, restaurantId],
  )
  if (result.rowCount === 0) {
    throw new AdminError(
      400,
      'INVALID_RELATION',
      'La subcategoría no pertenece a la categoría indicada',
    )
  }
}

async function assertAllergensExist(db, allergenIds) {
  if (allergenIds.length === 0) return
  const result = await db.query(
    'SELECT id FROM allergens WHERE id = ANY($1::uuid[])',
    [allergenIds],
  )
  if (result.rowCount !== allergenIds.length) {
    throw new AdminError(
      400,
      'INVALID_ALLERGENS',
      'Uno o más alérgenos no existen',
    )
  }
}

async function replaceProductAllergens(db, productId, allergenIds) {
  await db.query('DELETE FROM product_allergens WHERE product_id = $1', [productId])
  if (allergenIds.length > 0) {
    await db.query(
      `INSERT INTO product_allergens (product_id, allergen_id)
       SELECT $1, allergen_id
       FROM unnest($2::uuid[]) AS values_table(allergen_id)
       ON CONFLICT DO NOTHING`,
      [productId, allergenIds],
    )
  }
}

async function loadProductAllergens(db, productIds) {
  if (productIds.length === 0) return new Map()
  const result = await db.query(
    `SELECT pa.product_id, a.id, a.name, a.slug, a.emoji, a.description
     FROM product_allergens pa
     JOIN allergens a ON a.id = pa.allergen_id
     WHERE pa.product_id = ANY($1::uuid[])
     ORDER BY a.name`,
    [productIds],
  )
  const byProduct = new Map()
  for (const row of result.rows) {
    const allergens = byProduct.get(row.product_id) ?? []
    allergens.push(mapAllergen(row))
    byProduct.set(row.product_id, allergens)
  }
  return byProduct
}

async function loadProductResponse(db, row) {
  const allergens = await loadProductAllergens(db, [row.id])
  return mapProduct(row, allergens.get(row.id) ?? [])
}

function buildUpdateQuery(table, id, data, columns, returning) {
  const entries = Object.entries(columns).filter(([key]) => data[key] !== undefined)
  const values = entries.map(([key]) => data[key])
  const assignments = entries.map(
    ([, column], index) => `${column} = $${index + 1}`,
  )
  assignments.push('updated_at = now()')
  values.push(id)
  return {
    text: `UPDATE ${table}
           SET ${assignments.join(', ')}
           WHERE id = $${values.length}
           RETURNING ${returning}`,
    values,
  }
}

export async function listRestaurants(adminUserId) {
  const result = await query(
    `SELECT id, name, slug, description, address, phone, email,
            is_active, created_at, updated_at
     FROM restaurants
     WHERE admin_user_id = $1
     ORDER BY created_at, name`,
    [adminUserId],
  )
  return result.rows.map(mapRestaurant)
}

export async function getRestaurant(adminUserId, restaurantId) {
  return mapRestaurant(
    await findOwnedRestaurant(database, adminUserId, restaurantId),
  )
}

export async function updateRestaurant(adminUserId, restaurantId, input) {
  const data = validateRestaurantUpdate(input)
  await findOwnedRestaurant(database, adminUserId, restaurantId)
  const update = buildUpdateQuery(
    'restaurants',
    restaurantId,
    data,
    { name: 'name', slug: 'slug', description: 'description' },
    `id, name, slug, description, address, phone, email,
     is_active, created_at, updated_at`,
  )
  try {
    return mapRestaurant((await query(update.text, update.values)).rows[0])
  } catch (error) {
    throw translateDatabaseError(error, 'El slug del restaurante ya está en uso')
  }
}

export async function listCategories(adminUserId, restaurantId) {
  await findOwnedRestaurant(database, adminUserId, restaurantId)
  const result = await query(
    `SELECT id, restaurant_id, name, slug, sort_order, is_active,
            created_at, updated_at
     FROM categories
     WHERE restaurant_id = $1
     ORDER BY sort_order, name`,
    [restaurantId],
  )
  return result.rows.map(mapCategory)
}

export async function createCategory(adminUserId, restaurantId, input) {
  const data = validateCategoryCreate(input)
  await findOwnedRestaurant(database, adminUserId, restaurantId)
  try {
    const result = await query(
      `INSERT INTO categories (
         restaurant_id, name, slug, sort_order, is_active
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING id, restaurant_id, name, slug, sort_order, is_active,
                 created_at, updated_at`,
      [restaurantId, data.name, data.slug, data.sortOrder, data.isActive],
    )
    return mapCategory(result.rows[0])
  } catch (error) {
    throw translateDatabaseError(error, 'Ya existe una categoría con ese slug')
  }
}

export async function updateCategory(adminUserId, categoryId, input) {
  const data = validateCategoryUpdate(input)
  await findOwnedCategory(database, adminUserId, categoryId)
  const update = buildUpdateQuery(
    'categories',
    categoryId,
    data,
    {
      name: 'name',
      slug: 'slug',
      sortOrder: 'sort_order',
      isActive: 'is_active',
    },
    `id, restaurant_id, name, slug, sort_order, is_active,
     created_at, updated_at`,
  )
  try {
    return mapCategory((await query(update.text, update.values)).rows[0])
  } catch (error) {
    throw translateDatabaseError(error, 'Ya existe una categoría con ese slug')
  }
}

export async function deleteCategory(adminUserId, categoryId) {
  return withTransaction(async (client) => {
    const category = await findOwnedCategory(client, adminUserId, categoryId, true)
    const dependencies = await client.query(
      `SELECT
         (SELECT count(*)::integer FROM subcategories WHERE category_id = $1)
           AS subcategories,
         (SELECT count(*)::integer FROM products WHERE category_id = $1)
           AS products`,
      [category.id],
    )
    const counts = dependencies.rows[0]
    if (counts.subcategories > 0 || counts.products > 0) {
      conflict('No se puede borrar una categoría con subcategorías o productos')
    }
    await client.query('DELETE FROM categories WHERE id = $1', [category.id])
  })
}

export async function listSubcategories(adminUserId, restaurantId) {
  await findOwnedRestaurant(database, adminUserId, restaurantId)
  const result = await query(
    `SELECT id, restaurant_id, category_id, name, slug, sort_order,
            is_active, created_at, updated_at
     FROM subcategories
     WHERE restaurant_id = $1
     ORDER BY sort_order, name`,
    [restaurantId],
  )
  return result.rows.map(mapSubcategory)
}

export async function createSubcategory(adminUserId, restaurantId, input) {
  const data = validateSubcategoryCreate(input)
  await findOwnedRestaurant(database, adminUserId, restaurantId)
  await assertCategoryInRestaurant(database, data.categoryId, restaurantId)
  try {
    const result = await query(
      `INSERT INTO subcategories (
         restaurant_id, category_id, name, slug, sort_order, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, restaurant_id, category_id, name, slug, sort_order,
                 is_active, created_at, updated_at`,
      [
        restaurantId,
        data.categoryId,
        data.name,
        data.slug,
        data.sortOrder,
        data.isActive,
      ],
    )
    return mapSubcategory(result.rows[0])
  } catch (error) {
    throw translateDatabaseError(error, 'Ya existe una subcategoría con ese slug')
  }
}

export async function updateSubcategory(adminUserId, subcategoryId, input) {
  const data = validateSubcategoryUpdate(input)
  const current = await findOwnedSubcategory(database, adminUserId, subcategoryId)
  if (data.categoryId !== undefined) {
    await assertCategoryInRestaurant(database, data.categoryId, current.restaurant_id)
    if (data.categoryId !== current.category_id) {
      const dependencies = await query(
        'SELECT count(*)::integer AS products FROM products WHERE subcategory_id = $1',
        [subcategoryId],
      )
      if (dependencies.rows[0].products > 0) {
        conflict('No se puede mover una subcategoría que contiene productos')
      }
    }
  }
  const update = buildUpdateQuery(
    'subcategories',
    subcategoryId,
    data,
    {
      categoryId: 'category_id',
      name: 'name',
      slug: 'slug',
      sortOrder: 'sort_order',
      isActive: 'is_active',
    },
    `id, restaurant_id, category_id, name, slug, sort_order,
     is_active, created_at, updated_at`,
  )
  try {
    return mapSubcategory((await query(update.text, update.values)).rows[0])
  } catch (error) {
    throw translateDatabaseError(error, 'Ya existe una subcategoría con ese slug')
  }
}

export async function deleteSubcategory(adminUserId, subcategoryId) {
  return withTransaction(async (client) => {
    const subcategory = await findOwnedSubcategory(
      client,
      adminUserId,
      subcategoryId,
      true,
    )
    const dependencies = await client.query(
      'SELECT count(*)::integer AS products FROM products WHERE subcategory_id = $1',
      [subcategory.id],
    )
    if (dependencies.rows[0].products > 0) {
      conflict('No se puede borrar una subcategoría con productos')
    }
    await client.query('DELETE FROM subcategories WHERE id = $1', [subcategory.id])
  })
}

export async function listProducts(adminUserId, restaurantId) {
  await findOwnedRestaurant(database, adminUserId, restaurantId)
  const result = await query(
    `SELECT id, restaurant_id, category_id, subcategory_id, name, description,
            price, is_available, is_featured, sort_order, created_at, updated_at
     FROM products
     WHERE restaurant_id = $1
     ORDER BY sort_order, name`,
    [restaurantId],
  )
  const allergens = await loadProductAllergens(
    database,
    result.rows.map((row) => row.id),
  )
  return result.rows.map((row) => mapProduct(row, allergens.get(row.id) ?? []))
}

export async function createProduct(adminUserId, restaurantId, input) {
  const data = validateProductCreate(input)
  return withTransaction(async (client) => {
    await findOwnedRestaurant(client, adminUserId, restaurantId, true)
    await assertCategoryInRestaurant(client, data.categoryId, restaurantId)
    await assertSubcategoryInCategory(
      client,
      data.subcategoryId,
      data.categoryId,
      restaurantId,
    )
    await assertAllergensExist(client, data.allergenIds)
    const result = await client.query(
      `INSERT INTO products (
         restaurant_id, category_id, subcategory_id, name, description,
         price, is_available, is_featured, sort_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, restaurant_id, category_id, subcategory_id, name,
                 description, price, is_available, is_featured, sort_order,
                 created_at, updated_at`,
      [
        restaurantId,
        data.categoryId,
        data.subcategoryId,
        data.name,
        data.description,
        data.price,
        data.isAvailable,
        data.isFeatured,
        data.sortOrder,
      ],
    )
    await replaceProductAllergens(client, result.rows[0].id, data.allergenIds)
    return loadProductResponse(client, result.rows[0])
  })
}

export async function updateProduct(adminUserId, productId, input) {
  const data = validateProductUpdate(input)
  return withTransaction(async (client) => {
    const current = await findOwnedProduct(client, adminUserId, productId, true)
    const categoryId = data.categoryId ?? current.category_id
    const subcategoryId =
      data.subcategoryId === undefined ? current.subcategory_id : data.subcategoryId

    await assertCategoryInRestaurant(client, categoryId, current.restaurant_id)
    await assertSubcategoryInCategory(
      client,
      subcategoryId,
      categoryId,
      current.restaurant_id,
    )
    if (data.allergenIds !== undefined) {
      await assertAllergensExist(client, data.allergenIds)
    }

    const update = buildUpdateQuery(
      'products',
      productId,
      data,
      {
        categoryId: 'category_id',
        subcategoryId: 'subcategory_id',
        name: 'name',
        description: 'description',
        price: 'price',
        isAvailable: 'is_available',
        isFeatured: 'is_featured',
        sortOrder: 'sort_order',
      },
      `id, restaurant_id, category_id, subcategory_id, name, description,
       price, is_available, is_featured, sort_order, created_at, updated_at`,
    )
    const updated = (await client.query(update.text, update.values)).rows[0]
    if (data.allergenIds !== undefined) {
      await replaceProductAllergens(client, productId, data.allergenIds)
    }
    return loadProductResponse(client, updated)
  })
}

export async function deleteProduct(adminUserId, productId) {
  return withTransaction(async (client) => {
    const product = await findOwnedProduct(client, adminUserId, productId, true)
    await client.query('DELETE FROM products WHERE id = $1', [product.id])
  })
}

export async function listAllergens() {
  const result = await query(
    'SELECT id, name, slug, emoji, description FROM allergens ORDER BY name',
  )
  return result.rows.map(mapAllergen)
}
