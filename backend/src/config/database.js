import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

let pool

export class DatabaseConfigurationError extends Error {
  constructor() {
    super('DATABASE_URL no está configurada')
    this.name = 'DatabaseConfigurationError'
  }
}

function getPool() {
  if (!env.databaseUrl) {
    throw new DatabaseConfigurationError()
  }

  if (!pool) {
    pool = new Pool({ connectionString: env.databaseUrl })
  }

  return pool
}

export function query(text, params) {
  return getPool().query(text, params)
}

export async function checkDatabaseConnection() {
  await query('SELECT 1')
  return true
}
