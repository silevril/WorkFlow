export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')
  const sql = getDb()
  const [row] = await sql`
    UPDATE notifications SET read_at = now()
    WHERE id = ${id} AND user_id = ${actor.id}
    RETURNING *
  `
  if (!row) throw apiFail(404, 'Уведомление не найдено', 'NOT_FOUND')
  return { notification: row }
})
