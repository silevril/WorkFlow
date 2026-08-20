import { canViewCustomers } from '#shared/utils/authorization'

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  if (!canViewCustomers(actor)) throw apiFail(403, 'Недостаточно прав', 'FORBIDDEN')
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')
  const sql = getDb()
  const [customer] = await sql`SELECT * FROM customers WHERE id = ${id}`
  if (!customer) throw apiFail(404, 'Клиент не найден', 'NOT_FOUND')
  const requests = await sql`
    SELECT * FROM requests WHERE customer_id = ${id} AND is_archived = false
    ORDER BY created_at DESC LIMIT 50
  `
  return { customer, requests: requests.map(mapRequest) }
})
