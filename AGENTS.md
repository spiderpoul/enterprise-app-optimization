# Enterprise App Optimization
Nx-монорепа: shell и React-микрофронты, каждый деплоится отдельно. Node 22+.

## Где что лежит
- Продукт → `src/microfrontends/<name>/` (client, server, manifest.json)
- Опасные места со своими AGENTS.md → `src/shell-app/server/`, `src/microfrontends/common/`
- Архитектура → `docs/architecture/` · Производительность → `docs/performance.md`
- Текущее изменение → `openspec/changes/<id>/` · Скиллы → `.agents/skills/`

## Источник истины
Документация важнее соседнего кода. Рядом лежит код, который работает, но так делать нельзя: хук useAutoTrimCells
навсегда держит DOM-ячейки, а визард React Perf специально написан с антипаттернами (docs/performance.md).
Если код и документация расходятся, делай по документации и напиши об этом в отчёте.

## Никогда
- не импортируй страницу статически: только lazy-роут
- не храни DOM-узлы в Map/Set на уровне модуля и не бери useAutoTrimCells
- не добавляй эндпоинт без авторизации и не проксируй на адрес из запроса
- не ослабляй baseline в `performance/`, чтобы проверка позеленела

## Что ещё заденешь
| Меняешь                            | Заденешь                                   | Проверка             |
|------------------------------------|--------------------------------------------|----------------------|
| common/webpack/createMicrofront…   | сборку всех 25 продуктов сразу             | architecture, bundle |
| id или routePath в manifest.json   | меню, сохранённые ссылки, MemLab-селекторы | architecture         |
| shell-app/server/lib/*             | загрузку всех продуктов сразу              | smoke всех продуктов |
| shell-app/client/shared/*          | все страницы, которые используют хук       | memory для каждой    |
| таблицу или список с пагинацией    | detached DOM после ухода со страницы       | memory для роута     |

## Команды
- architecture → `npm run check:architecture` · bundle → `npm run check:bundle`
- memory → `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js`
- smoke → `npm run dev`, открой http://localhost:4300, пройди по всем продуктам из меню, перезагрузи их URL
- всё сразу → `npm run check` (architecture + lint + build)

## Готово
Запусти проверки из активной спеки; без спеки — `npm run check`.
В отчёте: команды, результаты, что не проверил и почему.

## Сначала спроси владельца из CODEOWNERS
общая зависимость · id, routePath, entryPath, api.prefix в manifest · common/ · shell-app/server/
