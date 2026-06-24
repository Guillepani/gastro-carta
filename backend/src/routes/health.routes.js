import { Router } from 'express'
import {
  checkDatabaseConnection,
  DatabaseConfigurationError,
} from '../config/database.js'

export const healthRouter = Router()

healthRouter.get('/', (_request, response) => {
  response.status(200).json({ status: 'ok' })
})

healthRouter.get('/database', async (_request, response) => {
  try {
    await checkDatabaseConnection()
    response.status(200).json({ status: 'ok', database: 'connected' })
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      return response.status(503).json({
        status: 'error',
        database: 'not_configured',
        message: error.message,
      })
    }

    console.error('No se pudo comprobar la conexión con la base de datos')
    return response.status(503).json({
      status: 'error',
      database: 'unavailable',
      message: 'No se pudo conectar con la base de datos',
    })
  }
})
