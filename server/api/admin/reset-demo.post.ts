export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  await seedDatabase(true)
  return { ok: true, message: 'Демо-данные сброшены' }
})
