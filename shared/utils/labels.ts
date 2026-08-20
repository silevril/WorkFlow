import type { RequestPriority, RequestStatus, UserRole } from '../types/domain'

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  waiting: 'Ожидание',
  resolved: 'Решена',
  closed: 'Закрыта',
  escalated: 'Эскалация'
}

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  critical: 'Критический',
  high: 'Высокий',
  normal: 'Обычный',
  low: 'Низкий'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Клиент',
  operator: 'Оператор',
  agent: 'Исполнитель',
  admin: 'Администратор'
}

export function requestNumber(num: number): string {
  return `WF-${String(num).padStart(4, '0')}`
}
