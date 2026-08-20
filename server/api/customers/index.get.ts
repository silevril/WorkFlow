import { canViewCustomers } from '#shared/utils/authorization'

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  if (!canViewCustomers(actor)) throw apiFail(403, 'Недостаточно прав', 'FORBIDDEN')
  const sql = getDb()
  const q = typeof getQuery(event).q === 'string' ? `%${getQuery(event).q}%` : null
  const customers = await sql`
    SELECT c.*, count(r.id)::int AS requests_count
    FROM customers c
    LEFT JOIN requests r ON r.customer_id = c.id AND r.is_archived = false
    WHERE ${q}::text IS NULL OR c.name ILIKE ${q} OR c.company ILIKE ${q} OR c.email ILIKE ${q}
    GROUP BY c.id
    ORDER BY c.company ASC
  `
  return { customers }
})
