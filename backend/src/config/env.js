import 'dotenv/config'

const parsedPort = Number.parseInt(process.env.PORT ?? '3000', 10)

if (Number.isNaN(parsedPort)) {
  throw new Error('PORT debe ser un número válido')
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsedPort,
})
