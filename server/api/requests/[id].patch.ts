import { z } from 'zod'
import { REQUEST_PRIORITIES } from '#shared/types/domain'
import { canAssignRequest, canAssignUser, canChangePriority, canEditDescription, canReadRequest } from '#shared/utils/authorization'
import { resolutionDueAt } from '#shared/utils/sla'

const bodySchema = z.object({
  title: z.string().trim().min(5).max(140).optional(),
  description: z.string().trim().min(10).max(4000).optional(),
  priority: z.enum(REQUEST_PRIORITIES).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  version: z.number().int().optional()
})

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiFail(400, 'Некорректные данные', 'VALIDATION', { issues: parsed.error.issues })
  }

  const sql = getDb()
  const [row] = await sql`SELECT * FROM requests WHERE id = ${id}`
  if (!row) throw apiFail(404, 'Заявка не найдена', 'NOT_FOUND')
  const current = mapRequest(row)
  if (!canReadRequest(actor, current)) throw apiFail(403, 'Нет доступа к этой заявке', 'FORBIDDEN')

  if (parsed.data.version !== undefined && parsed.data.version !== current.version) {
    throw apiFail(409, 'Заявка изменилась на сервере. Обновите данные.', 'VERSION_CONFLICT', {
      version: current.version
    })
  }

  if (current.status === 'closed' && (parsed.data.title || parsed.data.description)) {
    throw apiFail(409, 'После закрытия описание менять нельзя', 'REQUEST_LOCKED')
  }

  if ((parsed.data.title || parsed.data.description) && !canEditDescription(actor, current)) {
    throw apiFail(403, 'Нельзя изменить описание', 'FORBIDDEN')
  }

  if (parsed.data.priority && parsed.data.priority !== current.priority) {
    if (!canChangePriority(actor)) throw apiFail(403, 'Приоритет меняет оператор или администратор', 'FORBIDDEN')
  }

  let nextAssignee = current.assigneeId
  if (parsed.data.assigneeId !== undefined) {
    if (!canAssignRequest(actor)) throw apiFail(403, 'Назначать исполнителя может оператор или администратор', 'FORBIDDEN')
    if (parsed.data.assigneeId) {
      const [user] = await sql`SELECT id, role, status FROM users WHERE id = ${parsed.data.assigneeId}`
      if (!user) throw apiFail(404, 'Пользователь не найден', 'NOT_FOUND')
      if (!canAssignUser({ role: user.role as never, status: user.status as never })) {
        throw apiFail(409, 'Нельзя назначить деактивированного или неподходящего пользователя', 'ASSIGNEE_INACTIVE')
      }
      nextAssignee = user.id
    } else {
      nextAssignee = null
    }
  }

  const nextPriority = parsed.data.priority ?? current.priority
  const policies = await sql`SELECT * FROM sla_policies`
  const due = parsed.data.priority && parsed.data.priority !== current.priority
    ? resolutionDueAt(new Date(current.createdAt), nextPriority, policies as unknown as import('#shared/types/domain').SlaPolicy[])
    : new Date(current.slaDueAt ?? Date.now())

  const [updated] = await sql`
    UPDATE requests SET
      title = ${parsed.data.title ?? current.title},
      description = ${parsed.data.description ?? current.description},
      priority = ${nextPriority},
      assignee_id = ${nextAssignee},
      category_id = ${parsed.data.categoryId === undefined ? current.categoryId : parsed.data.categoryId},
      sla_due_at = ${due.toISOString()},
      status = ${current.status === 'new' && nextAssignee ? 'assigned' : current.status},
      version = version + 1,
      updated_at = now()
    WHERE id = ${id} AND version = ${current.version}
    RETURNING *
  `
  if (!updated) {
    throw apiFail(409, 'Заявка изменилась на сервере. Обновите данные.', 'VERSION_CONFLICT')
  }

  const request = mapRequest(mustRow(updated))
  if (parsed.data.priority && parsed.data.priority !== current.priority) {
    await addEvent(id, actor.id, 'priority_changed', { from: current.priority, to: parsed.data.priority })
  }
  if (parsed.data.assigneeId !== undefined && nextAssignee !== current.assigneeId) {
    await addEvent(id, actor.id, 'assigned', { assigneeId: nextAssignee })
    await notifyUsers(
      [nextAssignee, current.assigneeId],
      'assignment',
      `Назначение по заявке ${ticketLabel(request.number)}`,
      `${actor.name} изменил исполнителя.`,
      id
    )
  }
  return { request }
})
