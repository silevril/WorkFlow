import type { RequestStatus, TransitionInput, UserRole } from '../types/domain'

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  new: ['assigned', 'escalated'],
  assigned: ['in_progress', 'escalated'],
  in_progress: ['waiting', 'resolved', 'escalated'],
  waiting: ['in_progress'],
  resolved: ['closed'],
  escalated: ['assigned'],
  closed: []
}

export interface TransitionContext {
  from: RequestStatus
  input: TransitionInput
  role: UserRole
  hasAssignee: boolean
}

export interface TransitionFailure {
  ok: false
  code: string
  message: string
}

export interface TransitionSuccess {
  ok: true
}

export type TransitionResult = TransitionSuccess | TransitionFailure

export function canTransitionStatus(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function validateTransition(ctx: TransitionContext): TransitionResult {
  const { from, input, role } = ctx
  const to = input.to

  if (from === 'closed') {
    return { ok: false, code: 'REQUEST_LOCKED', message: 'Закрытую заявку нельзя изменять.' }
  }

  if (!canTransitionStatus(from, to)) {
    return {
      ok: false,
      code: 'INVALID_TRANSITION',
      message: `Переход ${from} → ${to} запрещён.`
    }
  }

  if (to === 'assigned' && !input.assigneeId && !ctx.hasAssignee) {
    return { ok: false, code: 'ASSIGNEE_REQUIRED', message: 'Нужно назначить исполнителя.' }
  }

  if (to === 'waiting' && !input.reason?.trim()) {
    return { ok: false, code: 'WAITING_REASON_REQUIRED', message: 'Для ожидания обязательна причина.' }
  }

  if (to === 'resolved' && !input.resolutionText?.trim()) {
    return {
      ok: false,
      code: 'RESOLUTION_REQUIRED',
      message: 'Для решения обязателен непустой текст результата.'
    }
  }

  if (to === 'escalated') {
    if (role !== 'operator' && role !== 'admin') {
      return { ok: false, code: 'FORBIDDEN', message: 'Эскалация доступна только оператору или администратору.' }
    }
    if (!input.reason?.trim()) {
      return { ok: false, code: 'ESCALATION_REASON_REQUIRED', message: 'Для эскалации обязательна причина.' }
    }
  }

  if (to === 'closed' && role === 'agent') {
    return { ok: false, code: 'FORBIDDEN', message: 'Исполнитель не может закрыть заявку.' }
  }

  return { ok: true }
}
