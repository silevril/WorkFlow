export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'operator'])
  const sql = getDb()

  const byStatus = await sql`
    SELECT status, count(*)::int AS count
    FROM requests
    WHERE is_archived = false
    GROUP BY status
  `
  const byPriority = await sql`
    SELECT priority, count(*)::int AS count
    FROM requests
    WHERE is_archived = false
    GROUP BY priority
  `
  const slaRisk = await sql`
    SELECT count(*)::int AS overdue
    FROM requests
    WHERE is_archived = false
      AND status NOT IN ('closed', 'resolved')
      AND sla_due_at IS NOT NULL
      AND sla_due_at < now()
  `
  const load = await sql`
    SELECT u.id, u.name, count(r.id)::int AS open_count
    FROM users u
    LEFT JOIN requests r ON r.assignee_id = u.id AND r.is_archived = false AND r.status NOT IN ('closed', 'resolved')
    WHERE u.role = 'agent' AND u.status = 'active'
    GROUP BY u.id, u.name
    ORDER BY open_count DESC
  `

  return {
    byStatus: byStatus as unknown as Array<{ status: string, count: number }>,
    byPriority: byPriority as unknown as Array<{ priority: string, count: number }>,
    overdue: Number(slaRisk[0]?.overdue ?? 0),
    agentLoad: load as unknown as Array<{ id: string, name: string, openCount: number }>
  }
})
