import { z } from 'zod'
import bcrypt from 'bcryptjs'

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  company: z.string().trim().min(2).max(120)
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiFail(400, 'Проверьте поля регистрации', 'VALIDATION', { issues: parsed.error.issues })
  }

  const sql = getDb()
  const email = parsed.data.email.trim().toLowerCase()
  const [existing] = await sql`SELECT id FROM users WHERE lower(email) = ${email}`
  if (existing) {
    throw apiFail(409, 'Пользователь с таким email уже есть', 'EMAIL_TAKEN')
  }

  const customer = mustRow((await sql`
    INSERT INTO customers (name, email, phone, company)
    VALUES (${parsed.data.name}, ${email}, NULL, ${parsed.data.company})
    RETURNING *
  `)[0])
  const hash = await bcrypt.hash(parsed.data.password, 10)
  const user = mustRow((await sql`
    INSERT INTO users (name, email, password_hash, role, status, customer_id)
    VALUES (${parsed.data.name}, ${email}, ${hash}, 'client', 'active', ${customer.id})
    RETURNING id, name, email, role, status, customer_id
  `)[0])
  await setUserSession(event, user.id)
  return { user: toPublicUser(user) }
})
