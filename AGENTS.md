# Enterprise App Optimization
Nx-монорепа: shell и React-микрофронты, каждый деплоится отдельно. Node 22+.

## Где что лежит
- Продукт → `src/microfrontends/<name>/` (client, server, manifest.json, .env с портами)
- Опасные места со своими AGENTS.md → `src/shell-app/server/`, `src/microfrontends/common/`
- Архитектура → `docs/architecture/` · Производительность → `docs/performance.md`
- Текущее изменение → `openspec/changes/<id>/` · Скиллы → `.agents/skills/`

## Источник истины
Документация важнее соседнего кода. Рядом лежит код, который работает, но так делать нельзя: продукты собираются
корневым Babel-конфигом в CommonJS, а визард React Perf специально написан с антипаттернами (docs/performance.md).
Если код и документация расходятся, делай по документации и напиши об этом в отчёте.

## Никогда
- не импортируй страницу статически: только lazy-роут
- не пиши клиентский код в CommonJS: никаких `require()`, Babel продукта — с `modules: false`
- не добавляй эндпоинт без авторизации и не проксируй на адрес из запроса
- не ослабляй baseline в `performance/`, чтобы проверка позеленела

## Cross-zone: что ещё затронет правка
| Меняешь                            | Затронет                                   | Проверка             |
|------------------------------------|--------------------------------------------|----------------------|
| common/webpack/createMicrofront…   | сборку всех 25 продуктов сразу             | architecture, bundle |
| id или routePath в manifest.json   | меню, сохранённые ссылки, MemLab-селекторы | architecture         |
| shell-app/server/lib/*             | загрузку всех продуктов сразу              | smoke всех продуктов |
| shell-app/client/shared/*          | все страницы, которые его импортируют      | memory для каждой    |
| таблицу или список с пагинацией    | риск утечки DOM после ухода со страницы    | memory для роута     |
| новый продукт: .env, скрипт dev    | запуск в dev: порты, entry через shell     | architecture, smoke  |

## Команды
- architecture → `npm run check:architecture` · bundle → `npm run check:bundle`
- memory → `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js`
- smoke → `npm run dev`, открой http://localhost:4300, пройди по всем продуктам из меню, перезагрузи их URL
- всё сразу → `npm run check` (architecture + lint + build)

## Definition of Done
Сопоставь каждый requirement спеки с проверкой: таблица cross-zone выше и скилл performance-check.
Всегда — `npm run check`. Проверку, которую не смог запустить, помечай как непроверенную, а не как пройденную.
В отчёте: команды, результаты, что не проверил и почему.

## Сначала спроси владельца из CODEOWNERS
общая зависимость · id, routePath, entryPath, api.prefix в manifest · common/ · shell-app/server/
