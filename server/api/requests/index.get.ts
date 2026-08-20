import type { RequestPriority, RequestStatus } from '#shared/types/domain'
import { canReadRequest } from '#shared/utils/authorization'

const OPEN = ['new', 'assigned', 'in_progress', 'waiting', 'escalated']

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10))
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const status = typeof query.status === 'string' ? query.status : ''
  const priority = typeof query.priority === 'string' ? query.priority : ''
  const sort = typeof query.sort === 'string' ? query.sort : 'created_desc'
  const mine = query.mine === 'true' || query.mine === '1'
  const offset = (page - 1) * pageSize

  const sql = getDb()
  const like = q ? `%${q}%` : null
  const statuses = status === 'open' ? OPEN : status ? [status as RequestStatus] : null
  const priorityFilter = priority ? (priority as RequestPriority) : null

  const rows = await sql`
    SELECT
      r.*,
      c.name AS customer_name,
      c.company AS customer_company,
      u.name AS assignee_name,
      cat.name AS category_name,
      count(*) OVER()::int AS total_count
    FROM requests r
    LEFT JOIN customers c ON c.id = r.customer_id
    LEFT JOIN users u ON u.id = r.assignee_id
    LEFT JOIN categories cat ON cat.id = r.category_id
    WHERE r.is_archived = false
      AND (
        ${actor.role}::text IN ('admin', 'operator')
        OR (${actor.role}::text = 'agent' AND r.assignee_id = ${actor.id})
        OR (${actor.role}::text = 'client' AND r.customer_id = ${actor.customerId})
      )
      AND (${mine}::boolean = false OR r.assignee_id = ${actor.id} OR r.customer_id = ${actor.customerId})
      AND (${statuses}::text[] IS NULL OR r.status = ANY(${statuses}::text[]))
      AND (${priorityFilter}::text IS NULL OR r.priority = ${priorityFilter})
      AND (${like}::text IS NULL OR r.title ILIKE ${like} OR r.description ILIKE ${like})
    ORDER BY
      CASE WHEN ${sort} = 'sla_asc' THEN r.sla_due_at END ASC NULLS LAST,
      CASE WHEN ${sort} = 'created_asc' THEN r.created_at END ASC,
      CASE WHEN ${sort} = 'priority_desc' THEN
        CASE r.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END
      END ASC,
      r.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `

  const total = rows[0]?.totalCount ?? 0
  const items = rows.flatMap((row) => {
    const request = mapRequest(row)
    if (!canReadRequest(actor, request)) return []
    return [{
      ...request,
      customerName: (row.customerName as string | null) ?? null,
      customerCompany: (row.customerCompany as string | null) ?? null,
      assigneeName: (row.assigneeName as string | null) ?? null,
      categoryName: (row.categoryName as string | null) ?? null
    }]
  })

  return { items, total, page, pageSize }
})
