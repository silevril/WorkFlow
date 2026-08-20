import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { canReadRequest } from '#shared/utils/authorization'
import { isAllowedAttachment } from '#shared/utils/attachments'

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiFail(400, 'Не указан идентификатор', 'VALIDATION')

  const request = await getRequestRow(id)
  if (!request) throw apiFail(404, 'Заявка не найдена', 'NOT_FOUND')
  if (!canReadRequest(actor, request)) throw apiFail(403, 'Нет доступа к этой заявке', 'FORBIDDEN')
  if (request.status === 'closed') throw apiFail(409, 'К закрытой заявке нельзя прикладывать файлы', 'REQUEST_LOCKED')

  const sql = getDb()
  const [{ count } = { count: 0 }] = await sql`SELECT count(*)::int AS count FROM attachments WHERE request_id = ${id}`

  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)
  if (!file || !file.data || !file.filename) {
    throw apiFail(400, 'Файл не передан', 'FILE_REQUIRED')
  }

  const mimeType = file.type || 'application/octet-stream'
  const allowed = isAllowedAttachment(mimeType, file.data.length, Number(count))
  if (!allowed.ok) {
    throw apiFail(400, allowed.message || 'Файл отклонён', allowed.code || 'FILE_REJECTED')
  }

  const storedName = `${randomUUID()}-${file.filename.replace(/[^\w.\-а-яА-Я ]+/g, '_')}`
  const dir = join(process.cwd(), '.data', 'uploads', id)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, storedName), file.data)
  const url = `/uploads/${id}/${storedName}`

  const [attachment] = await sql`
    INSERT INTO attachments (request_id, filename, mime_type, size, url, uploaded_by)
    VALUES (${id}, ${file.filename}, ${mimeType}, ${file.data.length}, ${url}, ${actor.id})
    RETURNING *
  `
  await addEvent(id, actor.id, 'attachment_added', { filename: file.filename })
  return { attachment }
})
