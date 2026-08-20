import { canReadRequest } from '#shared/utils/authorization'

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')

  const sql = getDb()
  const [row] = await sql`SELECT * FROM requests WHERE id = ${id}`
  if (!row) throw apiFail(404, 'Заявка не найдена', 'NOT_FOUND')
  const request = mapRequest(row)
  if (!canReadRequest(actor, request)) {
    throw apiFail(403, 'Нет доступа к этой заявке', 'FORBIDDEN')
  }

  const [customer] = await sql`SELECT * FROM customers WHERE id = ${request.customerId}`
  const [assignee] = request.assigneeId
    ? await sql`SELECT id, name, email, role, status, customer_id FROM users WHERE id = ${request.assigneeId}`
    : []
  const [category] = request.categoryId
    ? await sql`SELECT * FROM categories WHERE id = ${request.categoryId}`
    : []

  const comments = await sql`
    SELECT c.id, c.request_id, c.author_id, c.body, c.created_at, u.name AS author_name
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.request_id = ${id}
    ORDER BY c.created_at ASC
  `
  const events = await sql`
    SELECT e.*, u.name AS actor_name
    FROM request_events e
    LEFT JOIN users u ON u.id = e.actor_id
    WHERE e.request_id = ${id}
    ORDER BY e.created_at ASC
  `
  const attachments = await sql`
    SELECT * FROM attachments WHERE request_id = ${id} ORDER BY created_at ASC
  `

  return {
    request: {
      ...request,
      customer: customer ?? null,
      assignee: assignee ? toPublicUser(assignee) : null,
      category: category ?? null,
      comments,
      events,
      attachments
    }
  }
})
