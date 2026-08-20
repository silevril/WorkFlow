export default defineEventHandler(async (event) => {
  const latency = Number(useRuntimeConfig().apiLatencyMs || 0)
  if (latency > 0) {
    await new Promise(resolve => setTimeout(resolve, latency))
  }

  const chaos = getHeader(event, 'x-workflow-chaos')
  if (!chaos) return
  if (chaos === '500') {
    throw createError({ statusCode: 500, statusMessage: 'Смоделированная ошибка сервера', data: { code: 'CHAOS_500' } })
  }
  if (chaos === '429') {
    throw createError({ statusCode: 429, statusMessage: 'Слишком много запросов', data: { code: 'CHAOS_429' } })
  }
  if (chaos === '409') {
    throw createError({ statusCode: 409, statusMessage: 'Конфликт версии', data: { code: 'CHAOS_409' } })
  }
})
