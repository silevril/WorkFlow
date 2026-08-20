import { describe, expect, it } from 'vitest'
import { DEFAULT_SLA, resolutionDueAt, slaState } from '../../shared/utils/sla'
import { isAllowedAttachment } from '../../shared/utils/attachments'

describe('SLA', () => {
  it('uses default critical resolution window of 60 minutes', () => {
    const created = new Date('2026-08-20T10:00:00Z')
    const due = resolutionDueAt(created, 'critical')
    expect(due.toISOString()).toBe('2026-08-20T11:00:00.000Z')
    expect(DEFAULT_SLA.critical.resolutionMinutes).toBe(60)
  })

  it('marks a past due date as overdue', () => {
    expect(slaState('2020-01-01T00:00:00Z', new Date('2026-01-01'))).toBe('overdue')
  })
})

describe('attachments', () => {
  it('rejects a sixth file', () => {
    const result = isAllowedAttachment('application/pdf', 100, 5)
    expect(result.ok).toBe(false)
  })

  it('accepts a small pdf', () => {
    expect(isAllowedAttachment('application/pdf', 1024, 0).ok).toBe(true)
  })
})
