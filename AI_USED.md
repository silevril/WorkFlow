# AI_USED

Инструмент: Cursor Grok 4.6.

| Задача | Что предложил AI | Что принято / изменено |
| --- | --- | --- |
| Каркас Nuxt 4 | `create-nuxt` minimal + Tailwind v4 + Pinia | Принято. UI-kit не подключался. |
| Схема БД | users/customers/requests + events/SLA | Принято, добавлены `version` для 409 и `number` для WF-0001. |
| Переходы статусов | таблица allowed transitions | Вынесено в `shared/utils/transitions.ts`, покрыто Vitest. |
| Верстка | собственный paper/ink/copper стиль | Принято вместо generic dashboard. |
| Тесты | unit на rules + Playwright login | E2E требует живой Postgres; это ограничение задокументировано. |

AI не принимал продуктовые правила за студента: статусы, роли и SLA взяты из ТЗ и проверены тестами.
