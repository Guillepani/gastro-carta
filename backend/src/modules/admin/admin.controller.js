import {
  createCategory,
  createProduct,
  createSubcategory,
  deleteCategory,
  deleteProduct,
  deleteSubcategory,
  getRestaurant,
  listAllergens,
  listCategories,
  listProducts,
  listRestaurants,
  listSubcategories,
  updateCategory,
  updateProduct,
  updateRestaurant,
  updateSubcategory,
} from './admin.service.js'
import { AdminError } from './admin.validators.js'

function sendError(response, error) {
  if (error instanceof AdminError) {
    return response.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    })
  }

  console.error('Error interno en la gestión privada de la carta')
  return response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'No se pudo completar la operación',
    },
  })
}

function controller(action, statusCode = 200) {
  return async (request, response) => {
    try {
      const result = await action(request)
      if (statusCode === 204) return response.status(204).send()
      return response.status(statusCode).json(result)
    } catch (error) {
      return sendError(response, error)
    }
  }
}

const adminId = (request) => request.auth.adminUserId

export const getRestaurants = controller((request) =>
  listRestaurants(adminId(request)),
)

export const getRestaurantById = controller((request) =>
  getRestaurant(adminId(request), request.params.restaurantId),
)

export const putRestaurant = controller((request) =>
  updateRestaurant(adminId(request), request.params.restaurantId, request.body),
)

export const getCategories = controller((request) =>
  listCategories(adminId(request), request.params.restaurantId),
)

export const postCategory = controller(
  (request) =>
    createCategory(adminId(request), request.params.restaurantId, request.body),
  201,
)

export const putCategory = controller((request) =>
  updateCategory(adminId(request), request.params.categoryId, request.body),
)

export const removeCategory = controller(
  (request) => deleteCategory(adminId(request), request.params.categoryId),
  204,
)

export const getSubcategories = controller((request) =>
  listSubcategories(adminId(request), request.params.restaurantId),
)

export const postSubcategory = controller(
  (request) =>
    createSubcategory(adminId(request), request.params.restaurantId, request.body),
  201,
)

export const putSubcategory = controller((request) =>
  updateSubcategory(adminId(request), request.params.subcategoryId, request.body),
)

export const removeSubcategory = controller(
  (request) => deleteSubcategory(adminId(request), request.params.subcategoryId),
  204,
)

export const getProducts = controller((request) =>
  listProducts(adminId(request), request.params.restaurantId),
)

export const postProduct = controller(
  (request) =>
    createProduct(adminId(request), request.params.restaurantId, request.body),
  201,
)

export const putProduct = controller((request) =>
  updateProduct(adminId(request), request.params.productId, request.body),
)

export const removeProduct = controller(
  (request) => deleteProduct(adminId(request), request.params.productId),
  204,
)

export const getAllergens = controller(() => listAllergens())
