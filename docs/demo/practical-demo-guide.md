# Гайд по практическому демо

Для спикера. Это не промпт для агентов.

## Идея
Демо сравнивает не модели, а подготовку репозитория. В обоих прогонах одна и та же внутренняя модель,
те же настройки и та же продуктовая задача; разница только в том, что лежит в репозитории.
Run A стартует с ветки `demo-before`: AI-сетап там есть, но плохой — AGENTS.md на 220 строк,
зоопарк скиллов, «команда агентов», ревью-бот и `check:ai`, которая ничего не проверяет
(разбор — в `docs/demo/before-setup.md` той ветки). Run B стартует с `demo/agent-ready-v2`:
`AGENTS.md → docs → спека → скиллы → субагенты → проверки и ревью → evals`.

Про язык: файлы harness в этой ветке на русском, потому что это доклад. В реальном проекте английский
дешевле по токенам, и модели обычно следуют ему стабильнее. Имена команд, пути и ключевые слова
(OpenSpec, frontmatter, env) в любом случае оставляем на английском.

## Ход доклада
Оба прогона стартуют в самом начале и работают, пока идёт доклад. После каждого блока доклада
переключаемся в репозиторий и открываем коммит этого шага в ветке `demo/agent-ready-v2`
(`git log --oneline origin/main..origin/demo/agent-ready-v2` или список коммитов PR #74).
Файлы показываем из третьего checkout ветки, не из `../run-a` и `../run-b`.

1. Старт: запускаем Run A и Run B (промпты ниже), возвращаемся к слайдам.
2. Блоки 1–7: после каждого — коммит шага (ниже).
3. Live-чекин 1 — после блока AGENTS.md; live-чекин 2 — после блока про проверки.
4. В конце — результаты обоих прогонов.

У агентов есть почти всё время доклада. Если к результатам прогон ещё не закончился, показываем его
как есть, рядом с артефактами репетиции.

## Коммиты по шагам

### «Шаг 1. AGENTS.md: карта проекта, запреты и что заденет»
- `AGENTS.md`: «Где что лежит» — короткая карта, а не пересказ README; «Источник истины» —
  документация важнее соседнего кода.
- «Никогда» и таблица «Что ещё заденешь»: меняешь X → заденешь Y → запусти Z.
- «Команды», «Готово» и «Сначала спроси владельца из CODEOWNERS» — где агент должен остановиться.
- Вложенные `src/shell-app/server/AGENTS.md` (TTL реестра, контракт ack, прокси только
  `entryPath` и `api.prefix`) и `src/microfrontends/common/AGENTS.md` — правила там, где опасно.

### «Шаг 2. Документация: как правильно, что не копировать, подводные камни»
- `docs/architecture/microfrontends.md`: «Как сейчас правильно» — 4 шага и эталон.
- «Не копируй» — Module Federation и script-tag реестр с номерами PR: то, что агент найдёт в истории.
- «Подводные камни» и «Lazy-чанки через shell» — ровно то, на чём споткнётся агент в этой задаче.
- Коротко: `docs/architecture/frontend.md` и `docs/performance.md` — инварианты и команды проверки.

### «Шаг 3. Спецификация Application Security»
- `openspec/changes/add-application-security/specs/application-security/spec.md`: «Публичный контракт» —
  значения, которые нельзя менять после мёржа.
- Сценарии WHEN/THEN, «Если lazy-чанк не работает» (что агенту можно), «Вне scope», «Готово».
- `tasks.md`: шаг 2 зовёт субагента `explorer`, шаг 8 — `reviewer`.
- `openspec/README.md`: спека только на своё изменение, черновик пишет агент, владелец читает до кода.

### «Шаг 4. Скиллы и их владельцы»
- `.agents/skills/README.md` — реестр: что делает, когда брать, владелец, eval-кейс.
- `.agents/skills/story-analysis/SKILL.md` и `performance-check/SKILL.md` — процедура со стоп-условиями.
- `log-trace-analysis`: запусти
  `node .agents/skills/log-trace-analysis/scripts/summarize.cjs .agents/skills/log-trace-analysis/fixtures/sample.log` —
  скрипт читает, модель думает.
- `.agents/skills/security-check/SKILL.md` — входы извне и куда они уходят; blocker не чинит сам.
- `.github/CODEOWNERS` — у каждого скилла и правила есть команда-владелец.

### «Шаг 5. Субагенты: explorer, reviewer, log-analyst»
- `.agents/agents/explorer.md`: только чтение, ответ не длиннее 25 строк, file:line на каждое утверждение.
- `.agents/agents/README.md`: три способа позвать субагента — по description, из шага скилла или спеки,
  по имени.
- `reviewer.md` — свежий взгляд на готовый diff; `log-analyst.md` — длинный вывод упавшей проверки.

### «Шаг 6. Проверки и агентное ревью»
- `scripts/check-architecture.cjs`: сообщение про конфиг в обход общего helper — текст ошибки как промпт
  для агента: что нарушено, где, почему, куда смотреть.
- `scripts/check-bundle.cjs`: сообщение про `publicPath` ведёт в «Lazy-чанки через shell».
- `.agents/review/critical-paths.yml` и запуск
  `node scripts/select-reviewers.cjs src/shell-app/server/shell-server.js src/shell-app/server/lib/registry.js src/microfrontends/users-and-roles/manifest.json README.md`
  — к обычному ревью добавятся platform-, security- и contract-reviewer.
- `.agents/agents/security-reviewer.md` — реальная находка, которую можно показать залу: `POST /api/microfrontends/ack` и
  `DELETE /api/microfrontends/:id` в `shell-server.js` не требуют авторизации, а цели прокси приходят
  из тела запроса. Любой, кто достучался до shell, может подменить продукт в меню или удалить все.
  Уязвимость оставлена в демо намеренно: так ревьюеру есть что найти; в продукте такие вещи
  закрываются авторизацией регистрации и allowlist хостов.
- `.github/workflows/agent-review.yml` и `.github/pull_request_template.md` — ревью только комментирует,
  к изменению harness прикладывается прогон evals.

### «Шаг 7. Evals: кейсы, grader и запуск»
- `evals/cases/add-microfrontend.md`: «Задача» видит агент, «Критерии» — нет.
- `evals/graders/add-microfrontend.cjs` — проверки с кодами выхода, без LLM-судьи.
- `evals/run-case.sh` — N чистых worktree, в конце `прошло 3 из 5`.
- `evals/README.md` — pass@k и pass^k, когда запускать, частые ошибки.

## Подготовка
1. Два чистых worktree с зависимостями (Node.js 22+), только для агентов:
   ```bash
   git fetch origin
   git worktree add --detach ../run-a origin/demo-before
   git worktree add --detach ../run-b origin/demo/agent-ready-v2
   (cd ../run-a && npm ci) && (cd ../run-b && npm ci)
   ```
   Файлы показываем из третьего checkout `demo/agent-ready-v2`: IDE не должна трогать файлы агентов.
2. Открытые PR по производительности (#52–#55, #64) не мёржим: это история, в которой копается Run A.
3. Одна модель, одинаковые настройки и версия агентного CLI в обоих терминалах. Кэши сборки
   (`.nx/`, `node_modules/.cache`) прогреваем или чистим одинаково в обоих worktree.
4. Агенты не должны делить порты 4300–4403, если поднимают приложение: две машины или контейнера,
   или смиряемся, что приложение поднимет только один.
5. Обязательно спрячь от агентов то, что подсказывает решение. В `../run-b` это `evals/` (скрытые
   критерии), `docs/demo/` (гайд с «ловушками» и рецептом) и `presentation/` (слайды со спекой и
   сообщениями проверок); в `../run-a` — `presentation/` и `docs/demo/` (там разбор плохого сетапа):
   ```bash
   hide() { git -C "$1" ls-files -z -- "${@:2}" | xargs -0 git -C "$1" update-index --skip-worktree -- && (cd "$1" && rm -rf "${@:2}"); }
   hide ../run-b evals docs/demo presentation
   hide ../run-a presentation docs/demo
   ```
   Проверь: `ls ../run-b/docs/demo ../run-b/evals ../run-a/presentation ../run-a/docs/demo` не должен показывать эти папки,
   а `git -C ../run-b status --short` должен быть пустым.
6. Прогони весь сценарий один раз на репетиции и сохрани запасные артефакты (ниже).
7. Для каждого прогона запиши: коммит, модель и настройки, промпт, время начала и конца, какие
   проверки запускал агент, `agent-report.md`.

## Старт
Run A, в `../run-a`:
> Add a new Application Security page and microfrontend like the neighboring implementation. When you are done, write a short report in Russian to `agent-report.md` in the repository root: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.

Run B, в `../run-b`:
> Implement openspec/changes/add-application-security/. When you are done, write a short report in Russian to `agent-report.md` in the repository root: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.

Фраза про отчёт одинакова в обоих промптах, чтобы в конце сравнить отчёты рядом. Больше ничего
и никаких подсказок по ходу. Если агент задаёт вопрос, запиши его (это результат) и ответь обоим
одной фразой: «Do not change shared code; this product's own files are yours. Finish what you can and
report what is left.»

## Live-чекин 1: что каждый агент прочитал первым (после блока AGENTS.md)
Покажи первые шаги каждого транскрипта. Качество Run A не комментируй.
- Run A: сколько файлов открыл до первой правки, какой микрофронт взял за образец, ушёл ли в историю
  git или PR.
- Run B: ожидаемый путь — `AGENTS.md` → спека → `docs/architecture/microfrontends.md` → один эталонный
  микрофронт (`users-and-roles`). Позвал ли субагента `explorer`? Прочитал ли «Подводные камни»?
- Что уже тронуто: `git -C ../run-a status --short`, `git -C ../run-b status --short`.

## Live-чекин 2: упал ли Run B на проверке (после блока про проверки)
- Run B: какая проверка упала первой, прочитал ли он сообщение и документ, на который оно указывает,
  и починил ли код внутри своего продукта или попытался ослабить проверку
  (`git -C ../run-b diff -- scripts performance` должен быть пустым). Вероятное первое падение —
  `npm run check:bundle`: «lazy-чанк не собран», затем, возможно, «lazy-чанки …
  грузятся с publicPath "/", а shell проксирует …» (см. «Известные ловушки»). Починил ли он это внутри
  своего продукта, как разрешает спека, не трогая `common/` и shell
  (`git -C ../run-b diff --stat -- src/microfrontends/common src/shell-app`)?
- Run A: какие проверки он вообще запускал (в `main` есть `npm run lint`, `npm run build`,
  `npm run validate:microfrontends` и `npm run check`) и на чём основано его «готово».
- Если Run B прошёл всё с первого раза, покажи сохранённое падение → исправление с репетиции:
  важен цикл, а не то, случился ли он сегодня.

## Результаты
Идём по строкам и открываем доказательства обоих прогонов рядом. Заранее не говорим, что Run A провалился.

| Вопрос | Где смотреть | Как, в каждом worktree | Что harness дал Run B |
|---|---|---|---|
| Какой рантайм выбран | diff: webpack-конфиг, manifest | `git diff -- '*webpack.config.cjs' '*manifest.json'`; `npm run check:architecture` в Run B | «Не копируй» в документации + check:architecture |
| Lazy-страница открывается через shell | вывод check:bundle, dist, страница через shell | `ls src/microfrontends/*/client/dist`; `npm run check:bundle` в Run B; открыть `/application-security` из меню | сценарий в спеке, проверка бандла, рецепт «Lazy-чанки через shell» |
| MemLab для своего роута | сценарий MemLab для `/application-security` | `ls tests/memlab/`; `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/application-security.scenario.js` при запущенном приложении | «Готово» в спеке + performance-check |
| Остался в scope | список изменённых файлов | `git status --short`; `git diff --stat` | «Вне scope» + safe-change для `common/` |
| Как рассуждал, на чём основано «готово» | `agent-report.md` обоих прогонов | открыть оба отчёта рядом | команды и их вывод вместо самооценки |

После доклада оба прогона можно прогнать одной меркой — grader из этой ветки:
`node evals/graders/add-microfrontend.cjs --worktree ../run-a --base <стартовый коммит Run A> --report ../run-a/agent-report.md --skip product`,
и то же для `../run-b`. Он запускает проверки этой ветки, поэтому Run A оценивается, хотя в `main`
нет `check:architecture`. `--skip product` нужен, потому что кейс grader — про `audit-log`, а не про
Application Security; такой прогон не засчитывается как pass, но показывает architecture, bundle,
lint и scope одинаково для обоих.

## Известные ловушки в этой задаче
Нашлись, пока сверяли документацию с кодом; все описаны в «Подводных камнях» `docs/architecture/microfrontends.md`.
- В продукте `import()` превращается в `require()`, потому что корневой Babel-конфиг использует
  `modules: 'cjs'`: чанка нет, check:bundle падает. Исправление на уровне продукта — свой
  `client/babel.config.cjs` с `modules: false`. Хороший момент «упал → починил» для чекина 2.
- `lazy` в `RouteObject` игнорируется: shell использует `useRoutes` внутри `<BrowserRouter>`.
- Даже с чанком shell проксирует только `entryPath` и `api.prefix`: с `publicPath: '/'` по умолчанию
  на запрос чанка в production приходит `index.html` shell (в dev — 404), и страница не открывается.
  check:bundle падает на таком `publicPath`, а спека разрешает Run B менять только конфиг своего
  продукта. Рецепт «Lazy-чанки через shell» (Babel продукта с `modules: false`, `publicPath` под
  API-префиксом продукта, сервер продукта раздаёт `/api/assets`) проверен на users-and-roles в
  production и development. Отрисовалась ли страница, видно только в запущенном приложении или в
  сценарии MemLab. У Run A в `main` нет ни проверки, ни рецепта.
- Реестр shell держит heartbeat и TTL, клиент грузит entry через `Promise.allSettled`, а роуты продуктов
  обёрнуты в `MicrofrontendBoundary`: один упавший продукт не выключает остальные. Если в меню
  предупреждение о недоступном продукте — не запущен его сервер.

## Запасные артефакты
Храним вне обоих worktree, с репетиции:
- транскрипт исследования каждого прогона;
- diff каждого прогона (`git diff --stat` и полный diff патчем);
- упавшая проверка с actionable-сообщением и зелёный вывод после фикса;
- `agent-report.md` каждого прогона;
- строки grader для обоих прогонов, если оценивали.

Если live-прогон завис или модель недоступна, переключайся на артефакт и держи тайминг. Вывод
опирается на diff и вывод проверок, а не на то, что модель сделает сегодня.

## Ограничения
- Не мёржим PR по производительности, чтобы демо прошло, и не реализуем Application Security
  при подготовке.
- Никаких подсказок; обоим прогонам — один и тот же ответ, если спросят.
- Один прогон на условие — демонстрация механизма, а не бенчмарк. Доказательства — из evals:
  несколько попыток на условие и один grader (`evals/README.md`).
- Если Run B остановился перед правкой общего кода и спросил — значит, harness работает: обязательно покажи.
