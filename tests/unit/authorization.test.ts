import { describe, expect, it } from 'vitest'
import { canAssignUser, canReadRequest } from '../../shared/utils/authorization'

const client = { id: 'c1', role: 'client' as const, status: 'active' as const, customerId: 'cust-1' }
const agent = { id: 'a1', role: 'agent' as const, status: 'active' as const, customerId: null }
const operator = { id: 'o1', role: 'operator' as const, status: 'active' as const, customerId: null }

describe('authorization', () => {
  it('hides another customer request from a client', () => {
    expect(canReadRequest(client, { customerId: 'cust-2', assigneeId: null })).toBe(false)
    expect(canReadRequest(client, { customerId: 'cust-1', assigneeId: null })).toBe(true)
  })

  it('lets an agent see only assigned requests', () => {
    expect(canReadRequest(agent, { customerId: 'cust-1', assigneeId: 'a1' })).toBe(true)
    expect(canReadRequest(agent, { customerId: 'cust-1', assigneeId: 'other' })).toBe(false)
  })

  it('lets an operator see every request', () => {
    expect(canReadRequest(operator, { customerId: 'x', assigneeId: null })).toBe(true)
  })

  it('rejects an inactive assignee', () => {
    expect(canAssignUser({ role: 'agent', status: 'inactive' })).toBe(false)
    expect(canAssignUser({ role: 'agent', status: 'active' })).toBe(true)
  })
})
