export const USER_ROLES = ['client', 'operator', 'agent', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['active', 'inactive'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const REQUEST_STATUSES = [
  'new',
  'assigned',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
  'escalated'
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const REQUEST_PRIORITIES = ['critical', 'high', 'normal', 'low'] as const
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number]

export const OPEN_STATUSES: RequestStatus[] = [
  'new',
  'assigned',
  'in_progress',
  'waiting',
  'escalated'
]

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  customerId: string | null
  createdAt: string
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  customerId: string | null
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  company: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export interface SlaPolicy {
  id: string
  priority: RequestPriority
  responseMinutes: number
  resolutionMinutes: number
  isActive: boolean
}

export interface Request {
  id: string
  number: number
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  customerId: string
  assigneeId: string | null
  categoryId: string | null
  slaDueAt: string | null
  slaRespondedAt: string | null
  waitingReason: string | null
  escalationReason: string | null
  resolutionText: string | null
  closeReason: string | null
  isArchived: boolean
  version: number
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

export interface RequestDetails extends Request {
  customer: Customer | null
  assignee: PublicUser | null
  category: Category | null
  comments: Comment[]
  events: RequestEvent[]
  attachments: Attachment[]
}

export interface Comment {
  id: string
  requestId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface RequestEvent {
  id: string
  requestId: string
  actorId: string | null
  actorName: string | null
  type: string
  payload: Record<string, unknown>
  createdAt: string
}

export interface Attachment {
  id: string
  requestId: string
  filename: string
  mimeType: string
  size: number
  url: string
  uploadedBy: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  requestId: string | null
  readAt: string | null
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface RequestFilters {
  status?: RequestStatus | 'open' | ''
  priority?: RequestPriority | ''
  q?: string
  page?: number
  pageSize?: number
  sort?: 'created_desc' | 'created_asc' | 'sla_asc' | 'priority_desc'
  assigneeId?: string
  customerId?: string
  mine?: boolean
}

export interface ApiErrorBody {
  statusCode: number
  statusMessage: string
  data?: {
    code: string
    [key: string]: unknown
  }
}

export interface TransitionInput {
  to: RequestStatus
  reason?: string
  resolutionText?: string
  assigneeId?: string
  version?: number
}

export const ATTACHMENT_LIMITS = {
  maxSizeBytes: 10 * 1024 * 1024,
  maxFilesPerRequest: 5,
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const
