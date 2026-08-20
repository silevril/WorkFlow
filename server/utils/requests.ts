import type { PublicUser, Request, RequestPriority, RequestStatus } from '#shared/types/domain'
import { requestNumber } from '#shared/utils/labels'

export function mapRequest(row: object): Request {
  const data = row as Record<string, unknown>
  return {
    id: String(data.id),
    number: Number(data.number),
    title: String(data.title),
    description: String(data.description),
    status: data.status as RequestStatus,
    priority: data.priority as RequestPriority,
    customerId: String(data.customerId),
    assigneeId: data.assigneeId ? String(data.assigneeId) : null,
    categoryId: data.categoryId ? String(data.categoryId) : null,
    slaDueAt: data.slaDueAt ? new Date(data.slaDueAt as string).toISOString() : null,
    slaRespondedAt: data.slaRespondedAt ? new Date(data.slaRespondedAt as string).toISOString() : null,
    waitingReason: (data.waitingReason as string | null) ?? null,
    escalationReason: (data.escalationReason as string | null) ?? null,
    resolutionText: (data.resolutionText as string | null) ?? null,
    closeReason: (data.closeReason as string | null) ?? null,
    isArchived: Boolean(data.isArchived),
    version: Number(data.version),
    createdAt: new Date(data.createdAt as string).toISOString(),
    updatedAt: new Date(data.updatedAt as string).toISOString(),
    closedAt: data.closedAt ? new Date(data.closedAt as string).toISOString() : null
  }
}

export async function getRequestRow(id: string) {
  const sql = getDb()
  const [row] = await sql`SELECT * FROM requests WHERE id = ${id}`
  return row ? mapRequest(row) : null
}

export async function addEvent(
  requestId: string,
  actorId: string | null,
  type: string,
  payload: Record<string, unknown> = {}
) {
  const sql = getDb()
  await sql`
    INSERT INTO request_events (request_id, actor_id, type, payload)
    VALUES (${requestId}, ${actorId}, ${type}, ${sql.json(JSON.parse(JSON.stringify(payload)) as never)})
  `
}

export async function notifyUsers(
  userIds: Array<string | null | undefined>,
  type: string,
  title: string,
  body: string,
  requestId?: string | null
) {
  const sql = getDb()
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))]
  for (const userId of unique) {
    await sql`
      INSERT INTO notifications (user_id, type, title, body, request_id)
      VALUES (${userId}, ${type}, ${title}, ${body}, ${requestId ?? null})
    `
  }
}

export async function notifyOperators(type: string, title: string, body: string, requestId?: string | null) {
  const sql = getDb()
  const operators = await sql`
    SELECT id FROM users WHERE role IN ('operator', 'admin') AND status = 'active'
  `
  await notifyUsers(operators.map(user => user.id), type, title, body, requestId)
}

export function ticketLabel(number: number) {
  return requestNumber(number)
}

export function scopeRequestsSql(actor: PublicUser) {
  if (actor.role === 'admin' || actor.role === 'operator') {
    return { kind: 'all' as const }
  }
  if (actor.role === 'agent') {
    return { kind: 'assignee' as const, id: actor.id }
  }
  return { kind: 'customer' as const, id: actor.customerId }
}
