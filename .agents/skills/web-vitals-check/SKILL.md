---
name: web-vitals-check
description: Поднимает приложение как в production и замеряет Web Vitals (LCP, CLS) роута через shell в Chrome по MCP chrome-devtools, а если бюджет превышен — разбирает трейс. Используй после изменений, которые видит пользователь при загрузке страницы: роуты, entry и чанки продуктов, Babel/webpack продукта, инициализация shell, тяжёлый рендер. Не нужен для серверных правок без UI, текстов и документации.
---

# Web Vitals через Chrome DevTools MCP
Бюджеты — `performance/web-vitals-budget.json`, правила — «Web Vitals» в docs/performance.md.
MCP-сервер `chrome-devtools` описан в `.mcp.json` (Claude Code) и в `opencode.json` (OpenCode) одинаково:
Chrome без UI, чистый профиль, отправка URL в CrUX и статистика выключены — в закрытом контуре наружу
ничего не уходит. Если инструментов `navigate_page`, `take_screenshot`, `performance_start_trace` у тебя нет —
MCP не подключился: проверь `opencode mcp list` и напиши об этом в отчёте, а не пропускай замер молча.

## 1. Подними приложение как в production
`npm run start:prod -- --build`: production-сборка, shell и все продукты из dist; скрипт ждёт, пока shell
отдаст entry каждого продукта. Потом открой свой роут через MCP (`navigate_page`, `take_screenshot`). На dev-сервере не меряй: eval-сборка без минификации даёт другие цифры.
Если в консоли (`list_console_messages`) 404 или 504 на entry продукта — сначала почини запуск, потом меряй.

## 2. Гейт: цифры против бюджета
`WEB_VITALS_BASE_URL=http://localhost:4300 npm run check:web-vitals -- /<роут>`
Скрипт поднимает тот же MCP-сервер из `.mcp.json`: CPU ×4, 3 прогона с холодным кешем, медиана.
Нового роута нет в бюджете — действует `default`: не хуже самой медленной из текущих страниц.

## 3. Упало — разбери трейс, не угадывай
1. `emulate` с `cpuThrottlingRate: 4` — те же условия, что у гейта.
2. `performance_start_trace` с `reload: true`, `autoStop: true` на странице роута.
3. `performance_analyze_insight` для `LCPBreakdown`: где время — TTFB, загрузка ресурса или render delay.
   Render delay почти всегда значит «много JS до отрисовки»: смотри `list_network_requests` — что
   скачалось до LCP и сколько весит. Потом `LegacyJavaScript`, `RenderBlocking`, `CLSCulprits`.
4. Первопричину подтверди числом из трейса и найди её в коде: entry продукта в CommonJS или со статической
   страницей, библиотека целиком, лишний полифил. Чини по docs/performance.md.
5. Повтори шаг 2 и приложи оба вывода: до и после.

## 4. Чего не делать
- не сравнивай с бюджетом замер на dev-сервере или без троттлинга CPU
- не делай вывод по одному прогону: только медиана гейта
- не ослабляй бюджет и не убирай роут из `performance/web-vitals-budget.json`: остановись и спроси @perf-guild
- не включай CrUX и статистику в `.mcp.json` и не добавляй MCP-серверы сам — это решает @platform-frontend

## 5. Отчёт
Роут · LCP и CLS (медиана, бюджет, цель) · главный insight трейса с числом · что исправил ·
что не проверено (INP меряем руками: `click` по действию во время трейса).
