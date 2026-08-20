import { describe, expect, it } from 'vitest'
import { validateTransition } from '../../shared/utils/transitions'

describe('status transitions', () => {
  it('forbids closing a new request', () => {
    const result = validateTransition({
      from: 'new',
      input: { to: 'closed' },
      role: 'operator',
      hasAssignee: true
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('INVALID_TRANSITION')
  })

  it('requires a waiting reason', () => {
    const result = validateTransition({
      from: 'in_progress',
      input: { to: 'waiting', reason: '   ' },
      role: 'agent',
      hasAssignee: true
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('WAITING_REASON_REQUIRED')
  })

  it('requires resolution text', () => {
    const result = validateTransition({
      from: 'in_progress',
      input: { to: 'resolved' },
      role: 'agent',
      hasAssignee: true
    })
    expect(result.ok).toBe(false)
  })

  it('allows assign when an engineer is present', () => {
    const result = validateTransition({
      from: 'new',
      input: { to: 'assigned', assigneeId: 'agent-1' },
      role: 'operator',
      hasAssignee: true
    })
    expect(result).toEqual({ ok: true })
  })

  it('allows only operator/admin to escalate', () => {
    const agent = validateTransition({
      from: 'in_progress',
      input: { to: 'escalated', reason: 'SLA risk' },
      role: 'agent',
      hasAssignee: true
    })
    expect(agent.ok).toBe(false)
    const operator = validateTransition({
      from: 'in_progress',
      input: { to: 'escalated', reason: 'SLA risk' },
      role: 'operator',
      hasAssignee: true
    })
    expect(operator.ok).toBe(true)
  })
})
