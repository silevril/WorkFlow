import { z } from 'zod'
import { USER_ROLES, USER_STATUSES } from '#shared/types/domain'

const bodySchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  name: z.string().trim().min(2).max(80).optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiFail(400, 'Некорректные данные', 'VALIDATION')

  const sql = getDb()
  const [current] = await sql`SELECT * FROM users WHERE id = ${id}`
  if (!current) throw apiFail(404, 'Пользователь не найден', 'NOT_FOUND')

  const [updated] = await sql`
    UPDATE users SET
      role = ${parsed.data.role ?? current.role},
      status = ${parsed.data.status ?? current.status},
      name = ${parsed.data.name ?? current.name}
    WHERE id = ${id}
    RETURNING id, name, email, role, status, customer_id, created_at
  `
  return { user: toPublicUser(mustRow(updated)) }
})
