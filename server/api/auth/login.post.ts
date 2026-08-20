import { z } from 'zod'
import bcrypt from 'bcryptjs'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiFail(400, 'Некорректный email или пароль', 'VALIDATION')
  }

  const sql = getDb()
  const email = parsed.data.email.trim().toLowerCase()
  const [user] = await sql`
    SELECT id, name, email, role, status, customer_id, password_hash
    FROM users
    WHERE lower(email) = ${email}
  `
  if (!user) {
    throw apiFail(401, 'Неверный email или пароль', 'INVALID_CREDENTIALS')
  }
  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!matches) {
    throw apiFail(401, 'Неверный email или пароль', 'INVALID_CREDENTIALS')
  }
  if (user.status !== 'active') {
    throw apiFail(403, 'Учётная запись деактивирована', 'USER_INACTIVE')
  }

  await setUserSession(event, user.id)
  return { user: toPublicUser(user) }
})
