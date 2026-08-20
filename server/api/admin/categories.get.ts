export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const sql = getDb()
  const categories = await sql`SELECT * FROM categories ORDER BY name ASC`
  return { categories }
})
