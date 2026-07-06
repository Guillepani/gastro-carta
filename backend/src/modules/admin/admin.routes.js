import { Router } from 'express'
import { requireAuth } from '../../middlewares/requireAuth.js'
import {
  getAllergens,
  getCategories,
  getProducts,
  getRestaurantById,
  getRestaurants,
  getSubcategories,
  postCategory,
  postProduct,
  postSubcategory,
  putCategory,
  putProduct,
  putRestaurant,
  putSubcategory,
  removeCategory,
  removeProduct,
  removeSubcategory,
} from './admin.controller.js'

export const adminRouter = Router()

adminRouter.use(requireAuth)

adminRouter.get('/restaurants', getRestaurants)
adminRouter.get('/restaurants/:restaurantId', getRestaurantById)
adminRouter.put('/restaurants/:restaurantId', putRestaurant)

adminRouter.get('/restaurants/:restaurantId/categories', getCategories)
adminRouter.post('/restaurants/:restaurantId/categories', postCategory)
adminRouter.put('/categories/:categoryId', putCategory)
adminRouter.delete('/categories/:categoryId', removeCategory)

adminRouter.get('/restaurants/:restaurantId/subcategories', getSubcategories)
adminRouter.post('/restaurants/:restaurantId/subcategories', postSubcategory)
adminRouter.put('/subcategories/:subcategoryId', putSubcategory)
adminRouter.delete('/subcategories/:subcategoryId', removeSubcategory)

adminRouter.get('/restaurants/:restaurantId/products', getProducts)
adminRouter.post('/restaurants/:restaurantId/products', postProduct)
adminRouter.put('/products/:productId', putProduct)
adminRouter.delete('/products/:productId', removeProduct)

adminRouter.get('/allergens', getAllergens)
