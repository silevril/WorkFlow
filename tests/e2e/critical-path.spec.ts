import { test, expect, type Page } from '@playwright/test'

async function waitForApp(page: Page) {
  await page.waitForSelector('html[data-hydrated="true"]', { timeout: 20_000 })
}

async function loginAs(page: Page, email: string, password = 'DemoPass123!') {
  await page.goto('/login')
  await waitForApp(page)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль').fill(password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 20_000 })
}

test('public landing renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Заявки')
})

test('seeded API accepts demo login', async ({ request }) => {
  await expect.poll(async () => {
    const health = await request.get('/api/health')
    if (!health.ok()) return 0
    const body = await health.json() as { users?: number }
    return body.users ?? 0
  }, { timeout: 30_000 }).toBeGreaterThan(0)

  const res = await request.post('/api/auth/login', {
    data: { email: 'client@workflow.demo', password: 'DemoPass123!' }
  })
  expect(res.ok(), await res.text()).toBeTruthy()
})

test('login to create request path for client', async ({ page }) => {
  await loginAs(page, 'client@workflow.demo')
  await page.goto('/requests')
  await waitForApp(page)
  await expect(page.getByRole('heading', { name: 'Заявки' })).toBeVisible()
  await page.getByRole('button', { name: 'Новая заявка' }).click()
  await page.getByLabel('Заголовок').fill('Не работает считыватель на рампе A')
  await page.getByLabel('Описание').fill('После ночной смены считыватель не реагирует на карты.')
  await page.getByRole('button', { name: 'Создать' }).click()
  await expect(page.getByText('Не работает считыватель на рампе A')).toBeVisible({ timeout: 15_000 })
})

test('operator can open all requests', async ({ page }) => {
  await loginAs(page, 'operator@workflow.demo')
  await page.goto('/requests')
  await waitForApp(page)
  await expect(page.getByText('Всего')).toBeVisible({ timeout: 15_000 })
})
