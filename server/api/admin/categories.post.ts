import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).optional().nullable(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiFail(400, 'Проверьте поля категории', 'VALIDATION')
  const sql = getDb()
  const [category] = await sql`
    INSERT INTO categories (name, description, is_active)
    VALUES (${parsed.data.name}, ${parsed.data.description ?? null}, ${parsed.data.isActive ?? true})
    RETURNING *
  `
  return { category }
})
