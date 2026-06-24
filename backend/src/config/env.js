import 'dotenv/config'

const parsedPort = Number.parseInt(process.env.PORT ?? '3000', 10)
const parsedBcryptSaltRounds = Number.parseInt(
  process.env.BCRYPT_SALT_ROUNDS ?? '12',
  10,
)

if (Number.isNaN(parsedPort)) {
  throw new Error('PORT debe ser un número válido')
}

if (Number.isNaN(parsedBcryptSaltRounds) || parsedBcryptSaltRounds < 1) {
  throw new Error('BCRYPT_SALT_ROUNDS debe ser un entero positivo')
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsedPort,
  databaseUrl: process.env.DATABASE_URL?.trim() || null,
  jwtSecret: process.env.JWT_SECRET?.trim() || null,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  bcryptSaltRounds: parsedBcryptSaltRounds,
  demoAdminEmail: process.env.DEMO_ADMIN_EMAIL?.trim().toLowerCase() || null,
  demoAdminPassword: process.env.DEMO_ADMIN_PASSWORD || null,
})
