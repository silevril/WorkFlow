export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const sql = getDb()
  const notifications = await sql`
    SELECT * FROM notifications
    WHERE user_id = ${actor.id}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return { notifications }
})
