import { z } from 'zod'
import { canComment } from '#shared/utils/authorization'

const bodySchema = z.object({
  body: z.string().trim().min(1).max(4000),
  idempotencyKey: z.string().min(8).max(80).optional()
})

const recentKeys = new Map<string, number>()

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiFail(400, 'Комментарий не может быть пустым', 'VALIDATION')
  }

  const request = await getRequestRow(id)
  if (!request) throw apiFail(404, 'Заявка не найдена', 'NOT_FOUND')
  if (!canComment(actor, request)) {
    throw apiFail(403, 'Нельзя комментировать эту заявку', 'FORBIDDEN')
  }

  const key = parsed.data.idempotencyKey ? `${actor.id}:${id}:${parsed.data.idempotencyKey}` : null
  if (key) {
    const last = recentKeys.get(key)
    if (last && Date.now() - last < 15_000) {
      throw apiFail(409, 'Повторная отправка комментария проигнорирована', 'DUPLICATE_COMMENT')
    }
    recentKeys.set(key, Date.now())
  }

  const sql = getDb()
  const comment = mustRow((await sql`
    INSERT INTO comments (request_id, author_id, body)
    VALUES (${id}, ${actor.id}, ${parsed.data.body})
    RETURNING *
  `)[0])
  await addEvent(id, actor.id, 'commented', { commentId: comment.id })
  return {
    comment: {
      ...comment,
      authorName: actor.name
    }
  }
})
