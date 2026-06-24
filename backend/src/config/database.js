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

export async function withTransaction(callback) {
  const client = await getPool().connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function closeDatabaseConnection() {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}
