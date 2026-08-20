import postgres from 'postgres'
import { SCHEMA_SQL } from './schemaSql'

let client: postgres.Sql | null = null

export function getDb() {
  if (client) return client
  const url = useRuntimeConfig().databaseUrl as string
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_URL не задан',
      data: { code: 'DB_NOT_CONFIGURED' }
    })
  }
  client = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    transform: postgres.camel
  })
  return client
}

export async function ensureSchema() {
  const sql = getDb()
  await sql.unsafe(SCHEMA_SQL)
}

export function serializeDate(value: Date | string | null | undefined): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
