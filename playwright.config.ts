import { defineConfig, devices } from '@playwright/test'

const databaseUrl = process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL || 'postgres://workflow:workflow@localhost:5432/workflow'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 3000',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          NUXT_DATABASE_URL: databaseUrl,
          NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD || 'workflow-dev-session-password-32ch'
        }
      }
})
