import { query } from '../../config/database.js'

export class PublicMenuError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.name = 'PublicMenuError'
    this.statusCode = statusCode
    this.code = code
  }
}

function mapRestaurant(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    allergens: [],
  }
}

function mapGlobalAllergen(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    emoji: row.emoji,
    description: row.description,
  }
}

async function findPublicRestaurant(slug) {
  const result = await query(
    `SELECT id, name, slug, description
     FROM restaurants
     WHERE slug = $1 AND is_active = true`,
    [slug],
  )

  if (result.rowCount === 0) {
    throw new PublicMenuError(
      404,
      'RESTAURANT_NOT_FOUND',
      'El restaurante no existe o no está disponible',
    )
  }

  return result.rows[0]
}

async function loadMenuRows(restaurantId) {
  const [categories, subcategories, products, allergens] = await Promise.all([
    query(
      `SELECT id, name, slug, sort_order
       FROM categories
       WHERE restaurant_id = $1 AND is_active = true
       ORDER BY sort_order, name`,
      [restaurantId],
    ),
    query(
      `SELECT s.id, s.category_id, s.name, s.slug, s.sort_order
       FROM subcategories s
       JOIN categories c ON c.id = s.category_id AND c.is_active = true
       WHERE s.restaurant_id = $1 AND s.is_active = true
       ORDER BY s.sort_order, s.name`,
      [restaurantId],
    ),
    query(
      `SELECT p.id, p.category_id, p.subcategory_id, p.name, p.description,
              p.price, p.is_featured, p.sort_order
       FROM products p
       JOIN categories c ON c.id = p.category_id AND c.is_active = true
       LEFT JOIN subcategories s
         ON s.id = p.subcategory_id AND s.is_active = true
       WHERE p.restaurant_id = $1
         AND p.is_available = true
         AND (p.subcategory_id IS NULL OR s.id IS NOT NULL)
       ORDER BY p.sort_order, p.name`,
      [restaurantId],
    ),
    query(
      `SELECT id, name, slug, emoji, description
       FROM allergens
       ORDER BY name`,
    ),
  ])

  return {
    categoryRows: categories.rows,
    subcategoryRows: subcategories.rows,
    productRows: products.rows,
    allergenRows: allergens.rows,
  }
}

async function loadProductAllergens(productIds) {
  if (productIds.length === 0) return []

  const result = await query(
    `SELECT pa.product_id, a.id, a.name, a.slug, a.emoji
     FROM product_allergens pa
     JOIN allergens a ON a.id = pa.allergen_id
     WHERE pa.product_id = ANY($1::uuid[])
     ORDER BY a.name`,
    [productIds],
  )

  return result.rows
}

async function buildCategories({
  categoryRows,
  subcategoryRows,
  productRows,
}) {
  const categoriesById = new Map()
  const subcategoriesById = new Map()
  const productsById = new Map()

  const categories = categoryRows.map((row) => {
    const category = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order,
      products: [],
      subcategories: [],
    }
    categoriesById.set(row.id, category)
    return category
  })

  for (const row of subcategoryRows) {
    const category = categoriesById.get(row.category_id)
    if (!category) continue

    const subcategory = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      sortOrder: row.sort_order,
      products: [],
    }
    subcategoriesById.set(row.id, subcategory)
    category.subcategories.push(subcategory)
  }

  for (const row of productRows) {
    const category = categoriesById.get(row.category_id)
    if (!category) continue

    const product = mapProduct(row)
    productsById.set(row.id, product)

    const subcategory = row.subcategory_id
      ? subcategoriesById.get(row.subcategory_id)
      : null

    if (subcategory) {
      subcategory.products.push(product)
    } else {
      category.products.push(product)
    }
  }

  const productAllergens = await loadProductAllergens([...productsById.keys()])

  for (const row of productAllergens) {
    const product = productsById.get(row.product_id)
    if (!product) continue

    product.allergens.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      emoji: row.emoji,
    })
  }

  return categories
}

export async function getPublicMenu(slug) {
  const normalizedSlug = typeof slug === 'string' ? slug.trim().toLowerCase() : ''

  if (!normalizedSlug) {
    throw new PublicMenuError(
      400,
      'INVALID_RESTAURANT_SLUG',
      'El slug del restaurante no es válido',
    )
  }

  const restaurant = await findPublicRestaurant(normalizedSlug)
  const menuRows = await loadMenuRows(restaurant.id)
  const categories = await buildCategories(menuRows)

  return {
    restaurant: mapRestaurant(restaurant),
    categories,
    allergens: menuRows.allergenRows.map(mapGlobalAllergen),
  }
}
