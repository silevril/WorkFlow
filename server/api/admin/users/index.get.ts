export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const sql = getDb()
  const users = await sql`
    SELECT id, name, email, role, status, customer_id, created_at
    FROM users
    ORDER BY created_at DESC
  `
  return { users: users.map(toPublicUser) }
})
