import type { Request, UserRole, UserStatus } from '../types/domain'

export interface AuthActor {
  id: string
  role: UserRole
  status: UserStatus
  customerId: string | null
}

export function canReadRequest(actor: AuthActor, request: Pick<Request, 'customerId' | 'assigneeId'>): boolean {
  if (actor.role === 'admin' || actor.role === 'operator') return true
  if (actor.role === 'agent') return request.assigneeId === actor.id
  if (actor.role === 'client') return Boolean(actor.customerId) && request.customerId === actor.customerId
  return false
}

export function canCreateRequest(actor: AuthActor): boolean {
  return actor.role === 'client' || actor.role === 'operator' || actor.role === 'admin'
}

export function canAssignRequest(actor: AuthActor): boolean {
  return actor.role === 'operator' || actor.role === 'admin'
}

export function canChangePriority(actor: AuthActor): boolean {
  return actor.role === 'operator' || actor.role === 'admin'
}

export function canComment(actor: AuthActor, request: Pick<Request, 'customerId' | 'assigneeId' | 'status'>): boolean {
  if (request.status === 'closed') return false
  return canReadRequest(actor, request)
}

export function canEditDescription(actor: AuthActor, request: Pick<Request, 'status' | 'customerId' | 'assigneeId'>): boolean {
  if (request.status === 'closed') return false
  if (actor.role === 'admin' || actor.role === 'operator') return true
  if (actor.role === 'client') return request.customerId === actor.customerId && request.status === 'new'
  return false
}

export function canManageUsers(actor: AuthActor): boolean {
  return actor.role === 'admin'
}

export function canViewCustomers(actor: AuthActor): boolean {
  return actor.role === 'operator' || actor.role === 'admin'
}

export function canViewAllRequests(actor: AuthActor): boolean {
  return actor.role === 'operator' || actor.role === 'admin'
}

export function canAssignUser(assignee: { role: UserRole, status: UserStatus }): boolean {
  if (assignee.status !== 'active') return false
  return assignee.role === 'agent' || assignee.role === 'operator' || assignee.role === 'admin'
}
