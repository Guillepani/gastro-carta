import { apiRequest } from './apiClient.js'

export function listAdminRestaurants(options = {}) {
  return apiRequest('/admin/restaurants', { signal: options.signal })
}

export function listAdminCategories(restaurantId, options = {}) {
  return apiRequest(`/admin/restaurants/${restaurantId}/categories`, {
    signal: options.signal,
  })
}

export function createAdminCategory(restaurantId, payload) {
  return apiRequest(`/admin/restaurants/${restaurantId}/categories`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminCategory(categoryId, payload) {
  return apiRequest(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminCategory(categoryId) {
  return apiRequest(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
  })
}

export function listAdminSubcategories(restaurantId, options = {}) {
  return apiRequest(`/admin/restaurants/${restaurantId}/subcategories`, {
    signal: options.signal,
  })
}

export function createAdminSubcategory(restaurantId, payload) {
  return apiRequest(`/admin/restaurants/${restaurantId}/subcategories`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminSubcategory(subcategoryId, payload) {
  return apiRequest(`/admin/subcategories/${subcategoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminSubcategory(subcategoryId) {
  return apiRequest(`/admin/subcategories/${subcategoryId}`, {
    method: 'DELETE',
  })
}

export function listAdminProducts(restaurantId, options = {}) {
  return apiRequest(`/admin/restaurants/${restaurantId}/products`, {
    signal: options.signal,
  })
}

export function createAdminProduct(restaurantId, payload) {
  return apiRequest(`/admin/restaurants/${restaurantId}/products`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminProduct(productId, payload) {
  return apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminProduct(productId) {
  return apiRequest(`/admin/products/${productId}`, {
    method: 'DELETE',
  })
}

export function listAdminAllergens(options = {}) {
  return apiRequest('/admin/allergens', { signal: options.signal })
}
