import type { H3Event } from 'h3'
import type { PublicUser } from '#shared/types/domain'

const SESSION_NAME = 'wf-session'

export function sessionOptions(event: H3Event) {
  const password = useRuntimeConfig(event).sessionPassword as string
  if (!password || password.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_SESSION_PASSWORD должен быть не короче 32 символов',
      data: { code: 'SESSION_NOT_CONFIGURED' }
    })
  }
  return {
    password,
    name: SESSION_NAME,
    cookie: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    }
  }
}

export async function setUserSession(event: H3Event, userId: string) {
  const session = await useSession(event, sessionOptions(event))
  await session.update({ userId })
}

export async function clearUserSession(event: H3Event) {
  const session = await useSession(event, sessionOptions(event))
  await session.clear()
}

export async function getSessionUserId(event: H3Event): Promise<string | null> {
  const session = await useSession(event, sessionOptions(event))
  const userId = session.data.userId
  return typeof userId === 'string' ? userId : null
}

export function toPublicUser(row: object): PublicUser {
  const r = row as Record<string, unknown>
  return {
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    role: r.role as PublicUser['role'],
    status: r.status as PublicUser['status'],
    customerId: r.customerId ? String(r.customerId) : null
  }
}

export function mustRow<T extends object>(row: T | undefined, message = 'Запись не создана'): T {
  if (!row) throw apiFail(500, message, 'DB_ROW_MISSING')
  return row
}

export async function requireUser(event: H3Event) {
  const userId = await getSessionUserId(event)
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Нужна авторизация',
      data: { code: 'UNAUTHENTICATED' }
    })
  }
  const sql = getDb()
  const [user] = await sql`
    SELECT id, name, email, role, status, customer_id
    FROM users
    WHERE id = ${userId}
  `
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Сессия недействительна',
      data: { code: 'SESSION_INVALID' }
    })
  }
  if (user.status !== 'active') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Учётная запись деактивирована',
      data: { code: 'USER_INACTIVE' }
    })
  }
  return toPublicUser(user)
}

export async function requireRole(event: H3Event, roles: PublicUser['role'][]) {
  const user = await requireUser(event)
  if (!roles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Недостаточно прав',
      data: { code: 'FORBIDDEN', role: user.role }
    })
  }
  return user
}

export function apiFail(statusCode: number, statusMessage: string, code: string, extra?: Record<string, unknown>) {
  return createError({
    statusCode,
    statusMessage,
    data: { code, ...extra }
  })
}
