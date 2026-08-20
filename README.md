# WorkFlow

Веб-приложение для корпоративных сервисных заявок. Клиент создаёт заявку, оператор назначает исполнителя, инженер ведёт работу, оператор или клиент закрывает результат. Проект закрывает учебное ТЗ на 9 уровней и при этом остаётся портфолио-репозиторием.

## Проблема

Заявки живут в почте, мессенджерах и телефонных заметках. Сроки, ответственный и история работы теряются. WorkFlow собирает этот контур в одном месте с ролями, SLA и серверной проверкой прав.

## Стек

Nuxt 4, Vue 3, TypeScript, Nitro, PostgreSQL, Pinia, Zod, Vitest, Playwright, Docker, Tailwind CSS.

## Учебные аккаунты

Пароль для всех: `DemoPass123!`

| Роль | Email |
| --- | --- |
| Client | client@workflow.demo |
| Operator | operator@workflow.demo |
| Agent | agent@workflow.demo |
| Admin | admin@workflow.demo |

## Запуск

Нужны Node 22+ и Docker.

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run dev
```

Приложение: http://localhost:3000

Полный стек (приложение + Postgres):

```bash
docker compose up --build
```

Сброс demo-данных: админ → Аналитика → «Сбросить demo-данные» (`POST /api/admin/reset-demo`).

## Демо-сценарий

1. Войти как client и создать заявку.
2. Открыть список и карточку.
3. Войти как operator, назначить `agent@workflow.demo`.
4. Войти как agent, перевести в работу, написать комментарий и результат.
5. Снова operator/client — закрыть заявку.
6. Посмотреть уведомления и историю.
7. Admin: SLA и аналитика.

## Где что лежит

- `app/` — UI, страницы, composables, Pinia.
- `server/` — Nitro API, PostgreSQL, сессии, seed.
- `shared/` — типы, переходы статусов, права, SLA. Этот код нельзя связывать с Vue или Nitro.

Подробности: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/TRADEOFFS.md](docs/TRADEOFFS.md), [docs/PERFORMANCE.md](docs/PERFORMANCE.md), [AI_USED.md](AI_USED.md).

## Тесты

```bash
npm run test
npm run typecheck
npm run lint
npx playwright install chromium
npm run test:e2e
```

## Известные ограничения

- Demo URL для дистанционной приёмки нужно задеплоить отдельно (Render / Fly / VPS). Локально проект поднимается одной командой Docker.
- Вложения хранятся на диске контейнера, не в S3.
- Undo статуса не делает невозможный обратный переход: для приоритета rollback реальный.
