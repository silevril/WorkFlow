import { z } from 'zod'
import { REQUEST_PRIORITIES } from '#shared/types/domain'

const bodySchema = z.object({
  responseMinutes: z.number().int().min(5).max(10080),
  resolutionMinutes: z.number().int().min(15).max(20160),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const priority = getRouterParam(event, 'priority')
  if (!priority || !REQUEST_PRIORITIES.includes(priority as typeof REQUEST_PRIORITIES[number])) {
    throw apiFail(400, 'Неизвестный приоритет', 'VALIDATION')
  }
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiFail(400, 'Некорректные значения SLA', 'VALIDATION')
  const sql = getDb()
  const [policy] = await sql`
    UPDATE sla_policies SET
      response_minutes = ${parsed.data.responseMinutes},
      resolution_minutes = ${parsed.data.resolutionMinutes},
      is_active = ${parsed.data.isActive ?? true}
    WHERE priority = ${priority}
    RETURNING *
  `
  if (!policy) throw apiFail(404, 'Политика SLA не найдена', 'NOT_FOUND')
  return { policy }
})
