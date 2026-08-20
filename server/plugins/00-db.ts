export default defineNitroPlugin(async () => {
  try {
    await ensureSchema()
    await seedDatabase(false)
  } catch (error) {
    console.error('[workflow] database bootstrap failed', error)
  }
})
