# Задачи реализации

Порядок обязательный. Каждый шаг с проверкой заканчивается её запуском: команду и ключевые строки
вывода сохрани для отчёта. Проверку, которую не удалось запустить, в отчёте помечай «не запускал» и объясняй почему.

1. Прочитай `AGENTS.md`, спеку этого изменения `specs/application-security/spec.md` и документацию:
   `docs/architecture/microfrontends.md` (разделы «Как сейчас правильно», «Подводные камни»,
   «Lazy-чанки через shell»), `docs/architecture/frontend.md`, `docs/performance.md`.
2. Изучи один текущий микрофронт целиком: manifest, экспорт роута клиента, общий webpack helper,
   сервер, регистрацию в Nx и в workspaces. Поручи это субагенту `explorer`
   (`.agents/agents/explorer.md`) — он вернёт ответ с file:line, не забивая твой контекст.
3. Добавь продукт со значениями из раздела «Публичный контракт» спеки: manifest, роут клиента,
   API сервера, загрузку инвентаря и все состояния страницы. Пункт меню берётся из manifest —
   не прописывай его в shell. Заведи `.env` продукта со своими портами и добавь проекты в скрипты
   `dev`, `dev:prod`, `build:prod:run` и в `tsconfig.json` — шаги 5–6 «Как сейчас правильно»: без этого
   продукт не поднимется в `npm run dev`.
4. Если кажется, что нужно менять общий код (загрузчик или прокси shell, `src/microfrontends/common/`),
   остановись и пройди скилл `safe-change` до правки.
5. Проверь границы архитектуры и владение рантаймом: `npm run check:architecture`.
6. Проверь, что страница уехала в lazy-чанк и baseline не вырос: `npm run check:bundle`. Регрессию расследуй,
   а не ослабляй проверку. Если lazy-чанк не собирается или не грузится через shell, меняй только
   конфиг этого продукта по рецепту «Lazy-чанки через shell».
7. Добавь сценарий памяти для своего роута на `tests/memlab/create-route-pagination-scenario.js`
   (навигация из меню, пагинация до последней страницы, уход со страницы) —
   `tests/memlab/application-security.scenario.js`. Запускается на поднятом приложении, см. шаг 11.
8. Запусти `npm run lint` и полную сборку `npm run build`, исправь найденные регрессии.
   Какие ещё проверки нужны для твоего класса изменений — подскажет скилл `performance-check`.
9. Подними приложение как в production: `npm run start:prod -- --build` в фоне (адрес shell —
   http://localhost:4300; dev-сервер для замеров не подходит). Открой `/application-security` через
   MCP chrome-devtools (`navigate_page`, `take_screenshot`, `list_console_messages`): пункт в меню есть,
   таблица отрисована, в консоли нет 404/504 на entry или чанк. Без этого шага сценарий «чанк грузится
   через shell» не подтверждён — сборка этого не показывает.
10. На том же приложении: `WEB_VITALS_BASE_URL=http://localhost:4300 npm run check:web-vitals -- /application-security`.
    Бюджет превышен — скилл `web-vitals-check` (трейс, `LCPBreakdown`), а не догадки.
11. На том же приложении: `MEMLAB_APP_BASE_URL=http://localhost:4300 npm run check:memory -- tests/memlab/application-security.scenario.js`.
    Длинный вывод упавшей проверки отдай субагенту `log-analyst`.
12. Останови production-приложение и проверь локальную разработку на тех же портах: `npm run dev` в фоне,
    открой `/application-security` через MCP и перезагрузи URL. В консоли не должно быть
    `Failed to fetch dynamically imported module` — так проявляются продукт без `.env`, продукт не в скрипте
    `dev` и dev-сервер, который отдаёт entry не из `/` («Подводные камни» в docs/architecture/microfrontends.md).
13. Отдай свой diff субагенту `reviewer` и устрани blocker-замечания.
14. Напиши отчёт: таблица «команда → запускал → результат», что упало первым и что после этого сделал,
    обходы из раздела «Если упёрся», что не проверил и почему (раздел «Definition of Done» спеки).
