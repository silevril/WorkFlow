export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'operator'])
  const sql = getDb()
  const policies = await sql`SELECT * FROM sla_policies ORDER BY
    CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END
  `
  return { policies }
})
