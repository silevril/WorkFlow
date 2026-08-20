import { z } from 'zod'
import { REQUEST_STATUSES } from '#shared/types/domain'
import { canAssignUser, canReadRequest } from '#shared/utils/authorization'
import { validateTransition } from '#shared/utils/transitions'

const bodySchema = z.object({
  to: z.enum(REQUEST_STATUSES),
  reason: z.string().trim().max(500).optional(),
  resolutionText: z.string().trim().max(4000).optional(),
  assigneeId: z.string().uuid().optional(),
  version: z.number().int().optional()
})

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiFail(400, 'Некорректный переход', 'VALIDATION', { issues: parsed.error.issues })
  }

  const sql = getDb()
  const [row] = await sql`SELECT * FROM requests WHERE id = ${id}`
  if (!row) throw apiFail(404, 'Заявка не найдена', 'NOT_FOUND')
  const current = mapRequest(row)
  if (!canReadRequest(actor, current)) throw apiFail(403, 'Нет доступа к этой заявке', 'FORBIDDEN')

  if (parsed.data.version !== undefined && parsed.data.version !== current.version) {
    throw apiFail(409, 'Заявка изменилась на сервере. Обновите данные.', 'VERSION_CONFLICT')
  }

  const nextAssigneeId = parsed.data.assigneeId ?? current.assigneeId
  const check = validateTransition({
    from: current.status,
    input: parsed.data,
    role: actor.role,
    hasAssignee: Boolean(nextAssigneeId)
  })
  if (!check.ok) {
    throw apiFail(check.code === 'FORBIDDEN' ? 403 : 409, check.message, check.code)
  }

  if (parsed.data.assigneeId) {
    const [user] = await sql`SELECT id, role, status FROM users WHERE id = ${parsed.data.assigneeId}`
    if (!user || !canAssignUser({ role: user.role as never, status: user.status as never })) {
      throw apiFail(409, 'Нельзя назначить деактивированного пользователя', 'ASSIGNEE_INACTIVE')
    }
  }

  const closedAt = parsed.data.to === 'closed' ? new Date().toISOString() : current.closedAt
  const [updated] = await sql`
    UPDATE requests SET
      status = ${parsed.data.to},
      assignee_id = ${nextAssigneeId},
      waiting_reason = ${parsed.data.to === 'waiting' ? parsed.data.reason ?? null : current.waitingReason},
      escalation_reason = ${parsed.data.to === 'escalated' ? parsed.data.reason ?? null : current.escalationReason},
      resolution_text = ${parsed.data.resolutionText ?? current.resolutionText},
      close_reason = ${parsed.data.to === 'closed' ? parsed.data.reason ?? null : current.closeReason},
      closed_at = ${closedAt},
      sla_responded_at = ${current.slaRespondedAt ?? (parsed.data.to === 'assigned' || parsed.data.to === 'in_progress' ? new Date().toISOString() : null)},
      version = version + 1,
      updated_at = now()
    WHERE id = ${id} AND version = ${current.version}
    RETURNING *
  `
  if (!updated) throw apiFail(409, 'Заявка изменилась на сервере. Обновите данные.', 'VERSION_CONFLICT')

  const request = mapRequest(mustRow(updated))
  await addEvent(id, actor.id, 'status_changed', {
    from: current.status,
    to: parsed.data.to,
    reason: parsed.data.reason ?? null
  })

  const clients = await sql`SELECT id FROM users WHERE customer_id = ${request.customerId} AND role = 'client'`
  await notifyUsers(
    [request.assigneeId, ...clients.map(item => item.id)],
    parsed.data.to === 'escalated' ? 'escalation' : 'status',
    `Статус ${ticketLabel(request.number)}: ${parsed.data.to}`,
    parsed.data.reason || parsed.data.resolutionText || `${actor.name} изменил статус заявки.`,
    id
  )

  if (parsed.data.to === 'escalated') {
    await notifyOperators('escalation', `Эскалация ${ticketLabel(request.number)}`, parsed.data.reason || 'Заявка эскалирована', id)
  }

  return { request }
})
