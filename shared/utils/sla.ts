import type { RequestPriority, SlaPolicy } from '../types/domain'

export const DEFAULT_SLA: Record<RequestPriority, { responseMinutes: number, resolutionMinutes: number }> = {
  critical: { responseMinutes: 15, resolutionMinutes: 60 },
  high: { responseMinutes: 60, resolutionMinutes: 240 },
  normal: { responseMinutes: 240, resolutionMinutes: 1440 },
  low: { responseMinutes: 480, resolutionMinutes: 4320 }
}

export function resolutionDueAt(createdAt: Date, priority: RequestPriority, policies?: SlaPolicy[]): Date {
  const policy = policies?.find(item => item.priority === priority && item.isActive)
  const minutes = policy?.resolutionMinutes ?? DEFAULT_SLA[priority].resolutionMinutes
  return new Date(createdAt.getTime() + minutes * 60_000)
}

export function slaState(dueAt: string | null, now = new Date()): 'ok' | 'soon' | 'overdue' | 'none' {
  if (!dueAt) return 'none'
  const due = new Date(dueAt).getTime()
  const diff = due - now.getTime()
  if (diff < 0) return 'overdue'
  if (diff < 60 * 60_000) return 'soon'
  return 'ok'
}

export function minutesUntil(dueAt: string | null, now = new Date()): number | null {
  if (!dueAt) return null
  return Math.round((new Date(dueAt).getTime() - now.getTime()) / 60_000)
}
