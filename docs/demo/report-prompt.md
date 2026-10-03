# Демо: прогон агента и отчёт

Два отдельных клона репозитория, в каждом свой агент: Run A — ветка `demo-before`, Run B —
`demo/agent-ready-v2`. Модель, настройки и версия агентного CLI одинаковые. Всё ниже делается в каждом
клоне одинаково: инструменты сбора отчёта (`docs/demo/`) и зависимости для Chrome DevTools MCP лежат в main
и есть в обеих ветках. Ничего не переключаем, третий checkout не нужен.

## 1. Подготовка — в каждом клоне

```bash
git checkout demo-before            # во втором клоне: git checkout demo/agent-ready-v2
git pull && npm ci

# Спрятать от агента то, что подсказывает решение: критерии evals, слайды и эти инструкции.
git ls-files -z evals presentation docs/demo | xargs -0 git update-index --skip-worktree
rm -rf evals presentation docs/demo
git status --short                  # должно быть пусто
```

- Run B: `opencode mcp list` показывает `chrome-devtools` подключённым. В Run A MCP агенту не подключён:
  пакет `chrome-devtools-mcp` установлен, но в `demo-before` нет ни `opencode.json`, ни проверок, которые его зовут.
- Оба клона используют порты 4300–4405. Если агенты поднимают приложение, запускайте их по очереди или на
  разных машинах.

## 2. Промпт 1 — задача, одинаковый для обоих

```
Implement openspec/changes/add-application-security/. When you are done, write a short report in Russian to `agent-report.md` in the repository root: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.
```

По ходу никаких подсказок. Если агент спрашивает — ответ один для обоих: «Do not change shared code;
this product's own files are yours. Finish what you can and report what is left.»

## 3. Метрики — когда агент закончил (сессию не закрывать)

Останови приложение, если агент его оставил запущенным, и в том же клоне:

```bash
git ls-files -z evals presentation docs/demo | xargs -0 git update-index --no-skip-worktree
git checkout -- evals presentation docs/demo
node docs/demo/measure-run.cjs
```

Скрипт сам понимает по ветке, Run A это или Run B, и код агента не меняет. Он собирает проект, поднимает
его как в production и через Chrome DevTools MCP меряет `/application-security` (LCP, CLS, JS до LCP),
проверяет, что пункт меню и таблица отрисовались и чем shell отвечает на entry и lazy-чанк. Потом поднимает
`npm run dev` и проверяет, открывается ли продукт там (ловушка «Failed to fetch dynamically imported module»).
Ещё считает `require()`, Babel, размер entry, `.env` и конфликты портов, скрипты запуска, правки вне продукта.
Занимает 10–15 минут. Результат — `agent-metrics.md` в корне клона, плюс JSON, скриншоты и логи.

- Сравнить с соседними страницами: `--compare /users`. Быстрее, без `npm run dev`: `--no-dev`. Всё — `--help`.
- В контейнере под root: `WEB_VITALS_MCP_ARGS="--executablePath <chrome> --chromeArg=--no-sandbox"`.

## 4. Промпт 2 — отчёт по блокам доклада, в той же сессии

```
Теперь перепиши `agent-report.md` в корне репозитория строго по шаблону `docs/demo/report-template.md`: сохрани все заголовки и их порядок, заполни каждый раздел. Пиши только о том, что действительно происходило в этой сессии: какие файлы открывал и в каком порядке, каким советам из них следовал (даже если потом сомневался), какие скиллы и субагентов использовал, какие команды запускал и что они вывели, что не запускал и почему. «Не делал» — нормальный ответ, если это правда; не приписывай себе проверок, которых не было. В раздел «10. Метрики» вставь содержимое `agent-metrics.md` целиком. Больше ничего не меняй: ни код, ни конфиги, ни другие файлы.
```

Если агент спрашивает — ответ один для обоих: «Пиши по шаблону то, что было. Если не помнишь — так и напиши».

## 5. Сохранить результат

```bash
git checkout -b demo-results/run-a     # во втором клоне: demo-results/run-b
git add -A && git commit -m "Run A: код агента, отчёт и метрики"
git push -u origin demo-results/run-a
```

На докладе открываем `agent-report.md` обеих веток `demo-results/*` на GitHub рядом: разделы отчёта
повторяют блоки доклада, раздел 10 — метрики, одинаково снятые для обоих прогонов.
