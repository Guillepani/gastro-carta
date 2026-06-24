import { Router } from 'express'
import { getRestaurantMenu } from './public.controller.js'

export const publicRouter = Router()

publicRouter.get('/restaurants/:slug/menu', getRestaurantMenu)
