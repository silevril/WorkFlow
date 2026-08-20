# Performance

Бюджет (локальный `nuxt dev` / preview, landing и FAQ):

| Страница | Цель | Как достигается |
| --- | --- | --- |
| `/` | FCP < 2s на mid laptop | Мало JS на публичных страницах, CSS + системные/Google fonts, SVG favicon, нет hero-фото |
| `/faq`, `/articles` | HTML с текстом при первом ответе | SSR/`swr: 300` |
| `/requests` | skeleton вместо пустого экрана | `ssr: false` + skeleton + debounce поиска |
| Бандл публички | не тянуть Pinia-heavy admin | route-level code splitting Nuxt |

## Baseline vs after

До оптимизации публичная главная тянула бы клиентский список заявок и Pinia-store заявок. После:

1. Консоль вынесена в `ssr: false` routeRules — публичный HTML не гидратирует таблицу заявок.
2. Картинки не используются; иллюстрации CSS/SVG. Это убрало LCP-картинку как bottleneck.
3. `swr` на FAQ/Help/Articles снижает повторную работу сервера.

Если откатить `swr` на статьях, каждый заход будет заново собирать payload. Если вернуть SSR на `/requests`, персональные заявки клиента могут оказаться в HTML кэша — сознательно не делаем.

## Как измерить

```bash
npm run build
npm run preview
```

Chrome DevTools → Lighthouse на `/`, `/faq`, `/login`. Зафиксировать Performance/SEO. Для CI бюджет не блокирует merge, но unit-тесты бизнес-правил обязательны.
