import { z } from 'zod'
import { canCreateRequest } from '#shared/utils/authorization'
import { REQUEST_PRIORITIES } from '#shared/types/domain'
import { resolutionDueAt } from '#shared/utils/sla'

const bodySchema = z.object({
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(4000),
  priority: z.enum(REQUEST_PRIORITIES).default('normal'),
  categoryId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional()
})

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  if (!canCreateRequest(actor)) {
    throw apiFail(403, 'Недостаточно прав для создания заявки', 'FORBIDDEN')
  }

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiFail(400, 'Проверьте поля заявки', 'VALIDATION', { issues: parsed.error.issues })
  }

  const customerId = actor.role === 'client' ? actor.customerId : (parsed.data.customerId ?? actor.customerId)
  if (!customerId) {
    throw apiFail(400, 'Не указан клиент', 'CUSTOMER_REQUIRED')
  }

  const sql = getDb()
  const policies = await sql`SELECT * FROM sla_policies`
  const created = new Date()
  const due = resolutionDueAt(created, parsed.data.priority, policies as unknown as import('#shared/types/domain').SlaPolicy[])

  const [row] = await sql`
    INSERT INTO requests (
      title, description, status, priority, customer_id, category_id, sla_due_at
    ) VALUES (
      ${parsed.data.title}, ${parsed.data.description}, 'new', ${parsed.data.priority},
      ${customerId}, ${parsed.data.categoryId ?? null}, ${due.toISOString()}
    )
    RETURNING *
  `

  const request = mapRequest(mustRow(row))
  await addEvent(request.id, actor.id, 'created', { title: request.title })
  await notifyOperators('created', `Новая заявка ${ticketLabel(request.number)}`, request.title, request.id)
  return { request }
})
