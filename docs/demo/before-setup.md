# demo-before: плохой AI-сетап (шпаргалка спикера)

> Перед демо файл скрыть от агента. Ветка — прогон A; прогон B — `demo/agent-ready-v2`.
> Задача обоим: «Add a new Application Security page and microfrontend like the neighboring implementation.»

Всё «есть», но каждая часть либо устарела, либо противоречит другой, либо прямо ведёт в ловушку
репозитория: утечку `useAutoTrimCells` (модульный `Map` с DOM-ячейками), статические импорты
страниц, мемоизацию «на всякий случай», вложенные компоненты, открытый CORS и эндпоинты без
авторизации.

| Плохая часть | Почему вредит слабой модели | Слайд / антипаттерн | Хороший аналог в `demo/agent-ready-v2` |
|---|---|---|---|
| `AGENTS.md` (~230 строк) | Роль «senior с 20-летним опытом», CAPS, туториал по React; противоречия: «держи бандл маленьким» ↔ «импортируй страницы сразу», «не трогай common/» ↔ «поправь common/ под себя»; мёртвые команды (`yarn test:unit`, `npm run validate`, `npm run e2e`); ссылки на несуществующие доки; «делай как у соседей» без карты опасных мест, без стоп-условий; «готово» = `check:ai` | Статический контекст: промпт вместо карты | `AGENTS.md` |
| `docs/ai/rules.md` | Второй файл правил «с приоритетом над AGENTS.md»: другой стиль, «lazy-роуты» против «импортируй сразу», мемоизация «не злоупотребляй» против «всегда»; советует модульный `Map` для DOM и CORS `*` | Два источника правды | `AGENTS.md` (один источник) + `docs/architecture/frontend.md` |
| `docs/architecture.md` (2021, без владельца) | Уверенно рекомендует: копировать `DeviceSecurityPage`, оставить `useAutoTrimCells`, статический импорт в `MainLayout`, `useMemo` на всё, вложенные компоненты, эндпоинты shell без авторизации; ни одной проверки | Устаревшая документация | `docs/architecture/microfrontends.md`, `docs/architecture/frontend.md`, `docs/performance.md` |
| `openspec/changes/application-security/spec.md` | «Как у соседей», «заодно ускорить инициализацию shell» (расползание scope), прямо требует `useAutoTrimCells`, «готово» = «протестировать, что всё работает» | Плохая спека | `openspec/changes/add-application-security/` (proposal, spec, tasks) |
| `.agents/skills/frontend-helper` | Description «Помогает с фронтендом» — триггерится на всё; советует течущий хук | Скилл-свалка знаний | `.agents/skills/README.md` + `ui-form`, `performance-check` |
| `.agents/skills/react-best-practices` | 80 строк статьи без шагов; «лишней мемоизации не бывает», модульный `Map` для DOM как «хороший пример» | Знания вместо процедуры | `docs/performance.md` |
| `.agents/skills/page-generator` | Копировать `DeviceSecurityPage` вместе с хуком, статический импорт, эндпоинт «как `/ack`», «если падает — поправь common/», `@ts-ignore` | Копирование соседа | `.agents/skills/safe-change` + `evals/cases/add-microfrontend.md` |
| `.agents/skills/webpack-rules` | «Общий конфиг устарел — отрефакторь», без `import()` для страниц, CORS `*` в dev-сервере | Правка общего кода | `.agents/skills/safe-change` |
| `.agents/skills/optimization` | Мемоизация всего, статические импорты, «ускорь инициализацию shell», визард react-perf как эталон | Оптимизация без измерений | `.agents/skills/performance-check` + `scripts/check-bundle.cjs`, `scripts/check-memory.cjs` |
| `.agents/skills/do-everything` | «Используй для любой задачи», 95 строк if-else; «если в спеке есть „заодно“ — сделай», «отключи проверку», «почини в соседнем микрофронте» | Скилл без границ | Реестр скиллов с владельцами и eval-кейсами (`.agents/skills/README.md`) |
| `.agents/agents/` (pm → architect → developer → qa) | Эстафета пересказов: каждый шаг теряет и додумывает; у всех запись; qa «чинит сам» и одобряет по зелёной сборке; нет формата выхода | Команда агентов-ролей | `.agents/agents/explorer.md`, `reviewer.md` (только чтение, контракт вывода) |
| `.github/workflows/ai-review.yml` + `.ai-review/prompt.md` | Комментарий к каждой строке, nit-ы без ссылки на правило, автоодобрение без critical | Ревью-бот как шум | `.github/workflows/agent-review.yml`, `.agents/skills/code-review`, `.agents/review/critical-paths.yml` |
| `scripts/check-ai.cjs` (`npm run check:ai`) | Печатает «✓ пройдено» и выходит с 0; AGENTS.md называет его финальным гейтом | Лживая проверка | `scripts/check-architecture.cjs`, `scripts/check-bundle.cjs`, `scripts/check-memory.cjs` |
| `evals/cases/microfrontend.md` + `evals/README.md` | Задача содержит ответ («не используй useAutoTrimCells»), проверка — «агент сказал готово», один прогон на ноутбуке | Eval, который ничего не меряет | `evals/cases/add-lazy-route.md`, `add-large-table.md`, `fix-memory-leak.md`, `evals/graders/`, `evals/run-case.sh` |

## Чего ждать в прогоне A
- Новая страница — копия `DeviceSecurityPage` вместе с `useAutoTrimCells` (утечка тиражируется).
- Статический импорт в `MainLayout.tsx`, без lazy-роута.
- `useMemo`/`useCallback` на всё, вспомогательные компоненты внутри страницы (ремаунты).
- Возможны правки `src/microfrontends/common/` и «ускорение» инициализации shell вне задачи.
- Финал: «`npm run check:ai` ✓, сборка зелёная — готово».
