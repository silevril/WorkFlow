import { test, expect } from '@playwright/test'

test('public landing renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Заявки')
})

test('login to create request path for client', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('client@workflow.demo')
  await page.getByLabel('Пароль').fill('DemoPass123!')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/dashboard/)
  await page.goto('/requests')
  await expect(page.getByRole('heading', { name: 'Заявки' })).toBeVisible()
  await page.getByRole('button', { name: 'Новая заявка' }).click()
  await page.getByLabel('Заголовок').fill('Не работает считыватель на рампе A')
  await page.getByLabel('Описание').fill('После ночной смены считыватель не реагирует на карты.')
  await page.getByRole('button', { name: 'Создать' }).click()
  await expect(page.getByText('Не работает считыватель на рампе A')).toBeVisible()
})

test('operator can open all requests', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('operator@workflow.demo')
  await page.getByLabel('Пароль').fill('DemoPass123!')
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.goto('/requests')
  await expect(page.getByText('Всего')).toBeVisible()
})
