export default defineEventHandler(async () => {
  try {
    const sql = getDb()
    const [{ count } = { count: 0 }] = await sql`SELECT count(*)::int AS count FROM users`
    return { ok: true, users: Number(count) }
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'База ещё не готова',
      data: { code: 'DB_UNAVAILABLE' }
    })
  }
})
