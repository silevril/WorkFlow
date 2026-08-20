export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  if (actor.role === 'client') {
    return { users: [actor] }
  }
  const sql = getDb()
  const role = typeof getQuery(event).role === 'string' ? getQuery(event).role : ''
  const users = await sql`
    SELECT id, name, email, role, status, customer_id, created_at
    FROM users
    ORDER BY name ASC
  `
  const mapped = users.map(toPublicUser)
  return { users: role ? mapped.filter(user => user.role === role) : mapped }
})
