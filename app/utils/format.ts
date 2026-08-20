import type { Request } from '#shared/types/domain'

export function adaptRequest(input: Request): Request {
  return {
    ...input,
    title: input.title || 'Без названия',
    description: input.description || 'Описание отсутствует',
    slaDueAt: input.slaDueAt || null,
    assigneeId: input.assigneeId || null
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} Б`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`
}
