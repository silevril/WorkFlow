export default defineEventHandler(async (event) => {
  await requireUser(event)
  const sql = getDb()
  const categories = await sql`
    SELECT * FROM categories WHERE is_active = true ORDER BY name ASC
  `
  return { categories }
})
