import bcrypt from 'bcryptjs'
import type { RequestPriority, RequestStatus } from '#shared/types/domain'
import { DEFAULT_SLA, resolutionDueAt } from '#shared/utils/sla'

const DEMO_PASSWORD = 'DemoPass123!'

const CATEGORIES = [
  { name: 'Оборудование', description: 'Поломки и обслуживание техники' },
  { name: 'Сеть', description: 'Доступ, VPN, каналы связи' },
  { name: 'ПО', description: 'Прикладное ПО и лицензии' },
  { name: 'Доступ', description: 'Учётные записи и права' },
  { name: 'Прочее', description: 'Запросы вне стандартных категорий' }
]

const REQUEST_SEEDS: Array<{
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  customer: 'nord' | 'volta' | 'sila'
  hoursAgo: number
  comment?: string
}> = [
  { title: 'Не включается холодильная витрина на складе №2', description: 'После ночной смены витрина не выходит в рабочий режим. Температура +12 °C.', status: 'new', priority: 'critical', customer: 'nord', hoursAgo: 1 },
  { title: 'VPN отваливается у удалённых инженеров', description: 'С 08:00 туннель рвётся каждые 15 минут. Логи шлюза во вложении.', status: 'assigned', priority: 'high', customer: 'volta', hoursAgo: 3 },
  { title: 'Нужен доступ к порталу заявок для нового сотрудника', description: 'Иванова К.А., отдел закупок. Нужна роль клиента.', status: 'in_progress', priority: 'normal', customer: 'sila', hoursAgo: 6 },
  { title: 'Обновить прошивку считывателей на КПП', description: 'Производитель выпустил патч безопасности 4.12.', status: 'waiting', priority: 'high', customer: 'nord', hoursAgo: 12 },
  { title: 'Периодический сбой печати этикеток', description: 'Zebra ZT230 печатает пустую этикетку каждый третий раз.', status: 'resolved', priority: 'normal', customer: 'volta', hoursAgo: 20 },
  { title: 'Плановая замена ИБП в серверной', description: 'Работы согласованы на окно 02:00–04:00.', status: 'closed', priority: 'low', customer: 'sila', hoursAgo: 48 },
  { title: 'Камера №7 на рампе не пишет архив', description: 'Live есть, архив пуст с понедельника.', status: 'escalated', priority: 'high', customer: 'nord', hoursAgo: 8 },
  { title: 'Медленно открывается 1С на кассах', description: 'Кассы 3 и 4, время открытия чека > 20 секунд.', status: 'in_progress', priority: 'critical', customer: 'volta', hoursAgo: 2 },
  { title: 'Не приходят уведомления на почту security@', description: 'SMTP relay отвечает 550. Нужна диагностика.', status: 'assigned', priority: 'normal', customer: 'sila', hoursAgo: 10 },
  { title: 'Замена картриджей в МФУ бухгалтерии', description: 'Пустой чёрный и жёлтый. Модель HP E78223dn.', status: 'new', priority: 'low', customer: 'nord', hoursAgo: 5 },
  { title: 'Сбой турникета на входе B', description: 'Створка клинит, сотрудники проходят через служебный вход.', status: 'waiting', priority: 'high', customer: 'volta', hoursAgo: 15 },
  { title: 'Настроить резервное копирование камер', description: 'Нужен 14-дневный архив на NAS.', status: 'new', priority: 'normal', customer: 'sila', hoursAgo: 4 },
  { title: 'Обновить сертификат на внутреннем портале', description: 'Срок до конца недели. Сейчас self-signed.', status: 'assigned', priority: 'high', customer: 'nord', hoursAgo: 7 },
  { title: 'Шум в ИБП переговорной', description: 'Постоянный писк, нагрузка 18%. Не авария, но мешает встречам.', status: 'closed', priority: 'low', customer: 'volta', hoursAgo: 72 }
]

export async function seedDatabase(force = false) {
  const sql = getDb()
  const [{ count } = { count: 0 }] = await sql`SELECT count(*)::int AS count FROM users`
  if (count > 0 && !force) return { seeded: false }

  if (force) {
    await sql`TRUNCATE notifications, attachments, request_events, comments, requests, users, categories, sla_policies, customers RESTART IDENTITY CASCADE`
  }

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10)

  const nord = mustRow((await sql`
    INSERT INTO customers (name, email, phone, company)
    VALUES ('Анна Крылова', 'anna.krylova@nord-service.demo', '+7 921 100-10-10', 'НордСервис')
    RETURNING *
  `)[0])
  const volta = mustRow((await sql`
    INSERT INTO customers (name, email, phone, company)
    VALUES ('Павел Орлов', 'pavel.orlov@volta.demo', '+7 812 200-20-20', 'Вольта Ритейл')
    RETURNING *
  `)[0])
  const sila = mustRow((await sql`
    INSERT INTO customers (name, email, phone, company)
    VALUES ('Мария Белова', 'maria.belova@sila.demo', '+7 495 300-30-30', 'Сила Логистик')
    RETURNING *
  `)[0])

  const customers = { nord, volta, sila }

  const client = mustRow((await sql`
    INSERT INTO users (name, email, password_hash, role, status, customer_id)
    VALUES ('Анна Крылова', 'client@workflow.demo', ${hash}, 'client', 'active', ${nord.id})
    RETURNING *
  `)[0])
  await sql`
    INSERT INTO users (name, email, password_hash, role, status, customer_id)
    VALUES ('Павел Орлов', 'client2@workflow.demo', ${hash}, 'client', 'active', ${volta.id})
  `
  const operator = mustRow((await sql`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES ('Елена Морозова', 'operator@workflow.demo', ${hash}, 'operator', 'active')
    RETURNING *
  `)[0])
  const agent = mustRow((await sql`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES ('Игорь Савельев', 'agent@workflow.demo', ${hash}, 'agent', 'active')
    RETURNING *
  `)[0])
  const agent2 = mustRow((await sql`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES ('Дарья Немцова', 'agent2@workflow.demo', ${hash}, 'agent', 'active')
    RETURNING *
  `)[0])
  await sql`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES ('Сергей Архипов', 'inactive.agent@workflow.demo', ${hash}, 'agent', 'inactive')
  `
  await sql`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES ('Администратор WorkFlow', 'admin@workflow.demo', ${hash}, 'admin', 'active')
  `

  for (const [priority, values] of Object.entries(DEFAULT_SLA)) {
    await sql`
      INSERT INTO sla_policies (priority, response_minutes, resolution_minutes, is_active)
      VALUES (${priority}, ${values.responseMinutes}, ${values.resolutionMinutes}, true)
    `
  }

  const categoryRows = []
  for (const category of CATEGORIES) {
    const [row] = await sql`
      INSERT INTO categories (name, description, is_active)
      VALUES (${category.name}, ${category.description}, true)
      RETURNING *
    `
    categoryRows.push(row)
  }

  const policies = await sql`SELECT * FROM sla_policies`

  for (const [index, seed] of REQUEST_SEEDS.entries()) {
    const customer = mustRow(customers[seed.customer])
    const created = new Date(Date.now() - seed.hoursAgo * 3600_000)
    const due = resolutionDueAt(created, seed.priority, policies as unknown as import('#shared/types/domain').SlaPolicy[])
    const category = mustRow(categoryRows[index % categoryRows.length])
    const needsAssignee = !['new'].includes(seed.status)
    const assigneeId = needsAssignee ? (index % 2 === 0 ? mustRow(agent).id : mustRow(agent2).id) : null
    const closedAt = seed.status === 'closed' ? new Date() : null
    const waitingReason = seed.status === 'waiting' ? 'Ожидаем запчасть от поставщика' : null
    const escalationReason = seed.status === 'escalated' ? 'SLA под угрозой, нужен второй инженер' : null
    const resolutionText = ['resolved', 'closed'].includes(seed.status)
      ? 'Работы выполнены, оборудование в штатном режиме.'
      : null

    const request = mustRow((await sql`
      INSERT INTO requests (
        title, description, status, priority, customer_id, assignee_id, category_id,
        sla_due_at, waiting_reason, escalation_reason, resolution_text, created_at, updated_at, closed_at
      ) VALUES (
        ${seed.title}, ${seed.description}, ${seed.status}, ${seed.priority}, ${customer.id},
        ${assigneeId}, ${category.id}, ${due.toISOString()}, ${waitingReason}, ${escalationReason},
        ${resolutionText}, ${created.toISOString()}, ${created.toISOString()}, ${closedAt}
      )
      RETURNING *
    `)[0])

    await sql`
      INSERT INTO request_events (request_id, actor_id, type, payload, created_at)
      VALUES (${request.id}, ${client.id}, 'created', ${sql.json({ title: seed.title })}, ${created.toISOString()})
    `

    if (assigneeId) {
      await sql`
        INSERT INTO request_events (request_id, actor_id, type, payload)
        VALUES (${request.id}, ${operator.id}, 'assigned', ${sql.json({ assigneeId })})
      `
    }

    await sql`
      INSERT INTO comments (request_id, author_id, body, created_at)
      VALUES (
        ${request.id},
        ${seed.status === 'new' ? client.id : operator.id},
        ${seed.comment ?? 'Заявка зарегистрирована, ожидаем обновление по статусу.'},
        ${created.toISOString()}
      )
    `
  }

  const slaSoon = new Date(Date.now() + 25 * 60_000)
  await sql`
    INSERT INTO notifications (user_id, type, title, body, request_id)
    VALUES
      (${agent.id}, 'assignment', 'Назначена заявка', 'Вам назначена заявка по витрине на складе №2.', NULL),
      (${operator.id}, 'sla', 'SLA скоро истечёт', 'По критической заявке осталось меньше часа.', NULL),
      (${client.id}, 'status', 'Заявка взята в работу', 'Инженер приступил к диагностике.', NULL)
  `
  void slaSoon

  return { seeded: true }
}
