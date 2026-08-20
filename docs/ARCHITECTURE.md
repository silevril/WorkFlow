# Архитектура WorkFlow

```
[Vue pages / components]
        │  composables (orchestration)
        ▼
[Nitro /api/*] ── session cookie ── PostgreSQL
        ▲
        └── shared/utils (transitions, authorization, SLA)
```

## Контексты Nuxt 4

| Контекст | Путь | Можно импортировать |
| --- | --- | --- |
| App | `app/` | Vue, Pinia, `$fetch`, компоненты |
| Server | `server/` | Node, postgres, bcrypt, файлы |
| Shared | `shared/` | Только чистый TypeScript |

Граница соблюдается так: UI не содержит правил перехода статуса. Компонент вызывает API, сервер вызывает `validateTransition` из `shared/`.

## Слои

1. **UI** — страницы и переиспользуемые карточки/фильтры/timeline.
2. **Orchestration** — `useRequestsList`, `useRequestMutations`, `useAuth`.
3. **App state** — Pinia только для UI-настроек и Undo. Список заявок — server state через `useAsyncData` + URL.
4. **Data access** — `server/utils/db.ts` и API-handlers.
5. **Business rules** — `shared/utils/transitions.ts`, `authorization.ts`, `sla.ts`.

## Почему состояние разложено так

- Фильтры списка — **URL state**: ссылка `/requests?status=open&page=2` восстанавливается после F5.
- Поисковая строка до debounce — **local state**.
- Плотность интерфейса и свёрнутость сайдбара — **Pinia + localStorage**.
- Текущий пользователь — **cookie-сессия на сервере**, на клиенте `useState`.
- Заявки не кладём в один глобальный store: иначе «Мои задачи» пришлось бы переписывать store.

## Поток данных: клик → БД

1. Оператор нажимает «Назначить».
2. `useRequestMutations.patchRequest` шлёт `PATCH /api/requests/:id`.
3. Handler читает сессию, грузит заявку, проверяет `canAssignRequest` и `canAssignUser`.
4. UPDATE с `version = version + 1`; при гонке — 409.
5. Пишется `request_events` и notification исполнителю.
6. UI обновляет карточку.

## ADR-lite

### ADR 1. Cookie-сессия вместо JWT в localStorage

Сессия httpOnly через `h3 useSession`. Токен не светится в JS-бандле, logout инвалидирует cookie сразу.

### ADR 2. Правила статусов в shared, не в компонентах

Иначе карточка, список и будущий мобильный клиент начнут расходиться. Тесты гоняют чистые функции без Nuxt.

### ADR 3. Optimistic update только для приоритета

Смена приоритета обратима и не ломает workflow. Смена статуса имеет обязательные поля и побочные эффекты — её отправляем синхронно с сервером.

## Диаграмма доменов

```
auth ──► users
       ──► customers ──► requests ──► comments
                                   ──► attachments
                                   ──► events
requests ──► notifications
sla_policies ──► requests.slaDueAt
```
