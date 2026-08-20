import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(400).optional().nullable(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiFail(400, 'Некорректные данные', 'VALIDATION')
  const sql = getDb()
  const [current] = await sql`SELECT * FROM categories WHERE id = ${id}`
  if (!current) throw apiFail(404, 'Категория не найдена', 'NOT_FOUND')
  const [category] = await sql`
    UPDATE categories SET
      name = ${parsed.data.name ?? current.name},
      description = ${parsed.data.description === undefined ? current.description : parsed.data.description},
      is_active = ${parsed.data.isActive ?? current.isActive}
    WHERE id = ${id}
    RETURNING *
  `
  return { category }
})
