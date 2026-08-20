import { ATTACHMENT_LIMITS } from '../types/domain'

export function isAllowedAttachment(mimeType: string, size: number, existingCount: number): {
  ok: boolean
  code?: string
  message?: string
} {
  if (existingCount >= ATTACHMENT_LIMITS.maxFilesPerRequest) {
    return {
      ok: false,
      code: 'TOO_MANY_FILES',
      message: `Не больше ${ATTACHMENT_LIMITS.maxFilesPerRequest} файлов на заявку.`
    }
  }
  if (size > ATTACHMENT_LIMITS.maxSizeBytes) {
    return {
      ok: false,
      code: 'FILE_TOO_LARGE',
      message: 'Файл больше 10 МБ.'
    }
  }
  if (!(ATTACHMENT_LIMITS.allowedMimeTypes as readonly string[]).includes(mimeType)) {
    return {
      ok: false,
      code: 'FILE_TYPE_FORBIDDEN',
      message: 'Разрешены PDF, PNG, JPEG, WebP, TXT и DOCX.'
    }
  }
  return { ok: true }
}
