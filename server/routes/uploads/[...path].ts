import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { canReadRequest } from '#shared/utils/authorization'

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const pathParam = getRouterParam(event, 'path') || ''
  const [requestId, ...rest] = pathParam.split('/').filter(Boolean)
  const filename = rest.join('/')
  if (!requestId || !filename) throw apiFail(400, 'Некорректный путь', 'VALIDATION')

  const request = await getRequestRow(requestId)
  if (!request) throw apiFail(404, 'Файл не найден', 'NOT_FOUND')
  if (!canReadRequest(actor, request)) throw apiFail(403, 'Нет доступа', 'FORBIDDEN')

  const filePath = join(process.cwd(), '.data', 'uploads', requestId, filename)
  try {
    await stat(filePath)
  } catch {
    throw apiFail(404, 'Файл не найден', 'NOT_FOUND')
  }
  return sendStream(event, createReadStream(filePath))
})
