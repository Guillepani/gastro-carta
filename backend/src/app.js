import express from 'express'
import { handleInvalidJson } from './middlewares/handleInvalidJson.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { publicRouter } from './modules/public/public.routes.js'
import { healthRouter } from './routes/health.routes.js'

export const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/public', publicRouter)
app.use(handleInvalidJson)
