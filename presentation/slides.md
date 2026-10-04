---
theme: default
title: "Демо-сессия «Не Claude единым: агентная разработка в закрытом контуре большого фронтенда»"
info: |
  Облачных агентов в корпоративный репозиторий часто не пускают, а внутреннюю модель
  многие считают слишком слабой для настоящей разработки. Разбираем на реальном
  репозитории, что сделать с проектом, чтобы даже не самая сильная внутренняя модель
  работала предсказуемо: AGENTS.md, документация, спецификации, скиллы, субагенты,
  проверки, агентное ревью и evals. В конце сравниваем два прогона одной модели —
  без подготовки проекта и с ней.
author: Павел Уваров
colorSchema: dark
transition: slide-left
lineNumbers: false
mdc: true
aspectRatio: 16/9
canvasWidth: 1440
---

<div class="cover-fill"></div>

<!--
Время: 0:30.
Доклад про внутренние модели: как сделать проект таким, чтобы с ним справлялась даже не самая сильная модель.
Всё, о чём говорю, покажу файлами из репозитория, а в конце сравним два прогона одной модели.
-->

---

# Кто я

<div class="speaker-grid">
  <div>
    <div class="eyebrow">Павел Уваров</div>
    <div class="speaker-role">Software Expert в Kaspersky</div>
    <div v-click class="speaker-fact"><b>9+ лет</b><span>разрабатываю enterprise-проекты</span></div>
    <div v-click class="speaker-fact"><b>200+</b><span>технических собеседований — и продолжаю проводить</span></div>
    <div v-click class="speaker-fact"><b>Челлендж</b><span>как только у нас появилась агентная разработка — перестать писать код руками</span></div>
    <div v-click class="statement" style="margin-top: 1.25rem">Пока держусь 🙂</div>
  </div>
  <div class="speaker-photo">
    <img src="/assets/pavel-uvarov.jpg" alt="Павел Уваров" />
  </div>
</div>

<!--
Время: 0:50.
Я Павел, Software Expert в Kaspersky. Когда у нас появилась агентная разработка, я поставил себе челлендж —
перестать писать код руками. Держусь, и держусь на внутренней модели, а не на Claude.
-->

---

# Что говорят о внутренних моделях

<div class="grid-4">
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Не тянет, с Claude не сравнить»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Галлюцинирует: может напридумывать своего»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Для тестиков сойдёт, но код писать не доверю»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Быстрее самому написать, чем полчаса объяснять»</h3></div>
</div>

<p v-click style="margin-top: 1.7rem; font-size: 29px">Часть этих ошибок я сначала списывал на модель. Но ей не хватало информации о проекте: какой код брать за пример, что нельзя менять и чем проверить результат.</p>

<!--
Время: 1:00.
Все четыре фразы я говорил сам. Дальше покажу ошибки, которые возникают из-за неподходящих примеров, противоречивых инструкций и отсутствующих проверок,
и что с ними делать, если сильной облачной модели нет и не будет.
-->

---
layout: center
---

<div v-click class="meme-kicker">Примерно так выглядела модель, когда я впервые сказал ей: «Пройдись по нашему репозиторию и найди баг»</div>

<div v-click class="meme-image meme-rescue">
  <img src="/assets/3.png" alt="Мем: испуганная модель в большом legacy-репозитории" />
</div>

<!--
Время: 0:30.
-->

---

# Проект Kaspersky Security Center

<div class="two-col project-overview">
  <div>
    <div v-click class="flat-card">
      <h3>Центр управления защитой</h3>
      <p>Единая платформа для администрирования корпоративной инфраструктуры и security-продуктов.</p>
      <p class="muted">XDR · Cloud · on-premise</p>
    </div>
    <div v-click class="flat-card" style="margin-top: 1.2rem">
      <h3>9+ лет эволюции</h3>
      <p>React · Node.js · микрофронты · Hexa UI</p>
      <p class="muted">Команды и требования менялись — в коде остались подходы разных лет.</p>
    </div>
  </div>
  <div class="project-metrics">
    <div v-click class="metric"><b>10+</b><span>команд</span></div>
    <div v-click class="metric"><b>25+</b><span>плагинов</span></div>
    <div v-click class="metric"><b>1000+</b><span>страниц</span></div>
  </div>
</div>

<!--
Время: 0:50.
Живой продукт, а не учебный пример. В таком проекте одна неудачная строка в общем коде
останавливает работу сразу нескольких команд — поэтому цена ошибки агента здесь выше, чем в пет-проекте.
-->

---

# Модели на собственной инфраструктуре уже достаточно сильные

<div class="benchmark-strip">
  <div v-click class="benchmark"><b>45</b><span>GLM-5.3<br/>max effort</span></div>
  <div v-click class="benchmark"><b>51</b><span>Claude Opus 5.5<br/>medium · fallback</span></div>
  <div v-click class="benchmark"><b>39</b><span>DeepSeek V4.1 Flash<br/>reasoning max</span></div>
  <div v-click class="benchmark"><b>41</b><span>Claude Sonnet 5.5<br/>medium · fallback</span></div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 27px">Открытые модели уровня GLM или DeepSeek можно поднять на своей инфраструктуре, и они вполне достойно пишут код.
Отдельный вопрос — хватает ли модели информации и инструментов, чтобы работать именно с вашим проектом.</p>

<p v-after class="source"><a href="https://artificialanalysis.ai/leaderboards/models" target="_blank">Artificial Analysis Intelligence Index v4.3.2</a> · проверено 04.10.2026. Баллы индекса, не проценты. Настройки указаны под моделями; работу в своём репозитории проверяем отдельно.</p>

<!--
Время: 1:00.
Сверено 04.10.2026 по https://artificialanalysis.ai/leaderboards/models и карточкам GLM-5.3 / DeepSeek V4.1 Flash. Версия индекса — v4.3.2.
GLM-5.3 max — 45, DeepSeek V4.1 Flash max — 39. Claude Opus 5.5 medium with fallback — 51, Claude Sonnet 5.5 medium with fallback — 41.
Открытые модели показаны на max, облачные — на medium with fallback. Это разные настройки, а не доказательство равенства моделей или превосходства одной над другой.
Индекс — повод попробовать модель на своих задачах. Пригодность для нашего проекта проверяем по результатам работы в репозитории.
-->

---

# Почему даже умная модель может ошибиться

<div class="grid-4 reasons">
  <div v-click class="flat-card warn">
    <h3>Не знает, какой пример правильный</h3>
    <p class="muted">Рядом лежат актуальный и устаревший подходы. Оба работают — по коду их не отличить.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Не видит неявных контрактов</h3>
    <p class="muted">На идентификаторы, роуты и форматы API опираются другие системы. В коде это не помечено.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Не знает, кого ещё заденет правка</h3>
    <p class="muted">Общий модуль используют десятки команд. По самому файлу этого не видно.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Не знает, когда работа закончена</h3>
    <p class="muted">Сборка и тесты зелёные, а пользователь видит медленную или сломанную страницу.</p>
  </div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 26px">Агент опирается на код, а договорённости команды в коде не записаны.</p>

<!--
Время: 1:30.
Четыре причины — по кликам. Код — архив решений за девять лет, и актуальные решения в нём лежат рядом с устаревшими.
Примеры из демо, если спросят: корневой Babel собирает всё в CommonJS — скопируешь соседа, и import() не создаст чанк; id и routePath в manifest — это ссылки пользователей и селекторы MemLab; одна строка в common/webpack меняет сборку всех продуктов; сборка зелёная, а LCP страницы около 11 секунд.
Явные контракты и актуальные примеры уменьшают количество решений, которые агенту приходится принимать без достаточной информации.
Дальше в каждом блоке разберём одну из этих проблем, и после каждого я переключаюсь в репозиторий и показываю коммит. В конце вернёмся к этим четырём причинам и сравним прогоны по ним.
-->

---

# Agent = Model + Harness

<div class="annotated hx-slide">
<div>
<div class="hx" :class="{ dimming: $clicks >= 1 && $clicks <= 7 }">
  <div class="hx-ring hx-outer" :class="{ focus: $clicks === 7 }">
    <span class="hx-tag top">CLI / IDE</span>
    <span class="hx-tag left">Сессии и память</span>
    <span class="hx-tag bottom">Рантайм · логи и трейсы</span>
  </div>
  <div class="hx-ring hx-inner"><span class="hx-label">harness — среда работы агента</span></div>
  <div class="hx-orbit"></div>
  <div class="hx-core" :class="{ focus: $clicks === 1 }"><b>LLM</b><span>~10%</span></div>
  <div class="hx-chip c1" :class="{ on: $clicks >= 2, focus: $clicks === 2 }"><b>Instructions</b><span>правила и знания</span></div>
  <div class="hx-chip c2" :class="{ on: $clicks >= 3, focus: $clicks === 3 }"><b>Tools &amp; MCP</b><span>руки агента</span></div>
  <div class="hx-chip c3" :class="{ on: $clicks >= 4, focus: $clicks === 4 }"><b>Orchestration</b><span>кто и в каком порядке</span></div>
  <div class="hx-chip c4" :class="{ on: $clicks >= 5, focus: $clicks === 5 }"><b>Guardrails</b><span>проверки и хуки</span></div>
  <div class="hx-chip c5 eval" :class="{ on: $clicks >= 6, focus: $clicks === 6 }"><b>Evals</b><span>замер</span></div>
</div>
<div class="harness-split" :class="{ shown: $clicks >= 8 }">
  <div class="bar"><span class="m">10%</span><span class="h">90% — harness</span></div>
</div>
</div>
<div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Что вокруг модели</b><p>В центре — модель, вокруг — всё, что даём ей мы. Пройдём по слоям.</p></div>
  <div v-click="[1, 2]" class="note hx-note-core"><b>LLM — двигатель</b><p>Рассуждает и выбирает следующий шаг.</p></div>
  <div v-click="[2, 3]" class="note good"><b>Instructions / Rule files</b><p>Что агент читает всегда или по ссылке: AGENTS.md, документация, спека.</p></div>
  <div v-click="[3, 4]" class="note good"><b>Tools &amp; MCP</b><p>Чем агент действует: скрипт вместо чтения лога целиком, браузер через Chrome DevTools MCP.</p></div>
  <div v-click="[4, 5]" class="note good"><b>Orchestration</b><p>Кто и в каком порядке работает: скиллы задают порядок действий, субагенты отдельно исследуют код и разбирают логи. Блоки 4–5.</p></div>
  <div v-click="[5, 6]" class="note good"><b>Guardrails &amp; Hooks</b><p>Что не даёт объявить «готово» раньше времени: quality gates и агентное ревью.</p></div>
  <div v-click="[6, 7]" class="note"><b>Eval &amp; Testing</b><p>Как понять, что правка harness помогла, а не показалось: одна задача, N прогонов, доля успехов.</p></div>
  <div v-click="[7, 8]" class="note intro"><b>Платформа</b><p>CLI и IDE, рантайм, сессии, логи и трейсы.</p></div>
  <div v-click="8" class="note good"><b>10% модель, 90% harness</b><p>Модель — часть системы. От нас зависит, какие инструкции, инструменты и проверки она получит.</p></div>
</div>
<p class="source hx-source">Google, «The New SDLC with Vibe Coding» (A. Osmani, S. Saboo, S. Kartakis), май 2026, рис. 7 — схема упрощена.</p>
</div>
</div>

<!--
Время: 1:10.
Картинка из документа Google о новом SDLC: модель — двигатель, harness — машина, дорога и правила движения. Соотношение 10/90 буквально не защищаем, это метафора.
Пример из того же документа: LangChain в феврале 2026 поменял только harness вокруг той же модели — системный промпт, инструменты, middleware — и поднял результат на Terminal-Bench 2.0 с 52,8% до 66,5%.
Идти по кликам: каждый клик подсвечивает один слой схемы, справа — что это и в каком блоке доклада. Последний клик — полоса 10/90.
Внутренняя модель — это наши 10%, их мы не выбираем. Остальные 90% полностью в наших руках — о них весь доклад.
-->

---
layout: center
---

<div class="eyebrow">Live · старт</div>

# Одна задача, одна модель, два репозитория

<div class="two-col" style="margin-top: 1rem">
  <div v-click class="flat-card bad">
    <h3>Run A · <code>demo-before</code></h3>
    <p class="muted">Для демо собраны ошибки настройки: противоречивые инструкции, старая документация, лишние скиллы, передача задачи между агентами и проверка, которая всегда сообщает об успехе.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B · <code>demo/agent-ready-v2</code></h3>
    <p class="muted">Та же основа проекта с актуальными инструкциями, документацией, процедурами и проверками.</p>
  </div>
</div>

<div v-click class="flat-card warn" style="margin-top: 1rem; padding: 18px 26px">
  <h3 style="font-size: 23px; margin-bottom: 6px">Один промпт и одна спека</h3>
  <p style="font-size: 20px">«Implement <code>openspec/changes/add-application-security/specs/application-security/spec.md</code>. When you are done, write a short report in Russian to <code>agent-report.md</code>: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.»</p>
</div>

<p v-click class="source">Промпт и спека одинаковые: поведение, контракты, scope и проверки. Различается подготовка репозитория. Демо показывает влияние настройки, а не статистическую надёжность модели.</p>

<!--
Время: 1:30.
Переключиться в терминал, запустить обе сессии на одной внутренней модели с одинаковыми настройками, вернуться к слайдам.
Демо-репозиторий — упрощённая копия продукта: два микрофронта вместо 25, но те же ловушки.
Run A — не пустой репозиторий. В ветке demo-before «всё есть», но сделано так, как делать не надо. Все антипримеры из доклада взяты оттуда.
Оба получают одну и ту же спеку с контрактами и сценариями — ту, что разберём в блоке про спеки; spec.md и proposal.md в ветках совпадают. Так нельзя сказать «B просто получил промпт лучше».
Сравниваем два варианта настройки вокруг одной модели. Run A специально собран как антипример; по двум прогонам не делаем вывод о частоте успеха.
В подготовленной ветке есть небольшая инструментальная правка для сценария памяти — атрибут data-page. Поэтому не утверждаем, что весь код продукта совпадает.
Какими командами проверить требования спеки, агент должен узнать из репозитория — в этом и разница.
Перед стартом evals/ скрыт в обоих worktree: в demo-before кейс прямо подсказывает про CommonJS.
Отчёт в конце — одинаковая просьба для обоих: в финале сравним и код, и рассуждения.
Если live-модель недоступна — дальше используем сохранённые трейсы и диффы репетиции.
Дальше после каждого блока переключаемся в репозиторий и смотрим, каким коммитом мы это добавили.
-->

---
layout: center
---

<div class="eyebrow">Блок 1</div>

# AGENTS.md: точка входа в проект

<p class="muted" style="font-size: 26px">Что агенту нужно знать сразу и куда идти за подробностями.</p>

<!--
Время: 0:15.
Файлы в демо написаны по-русски, чтобы их было удобно читать со сцены. В рабочем проекте это компромисс:
английский дешевле по токенам и модели следуют ему стабильнее, а русский удобнее команде, которая читает ту же документацию.
Мы держим AGENTS.md и скиллы на английском, а docs — на языке команды.
В используемом клиенте нужно проверить загрузку корневого и вложенных AGENTS.md. Само наличие файла не гарантирует одинакового поведения всех CLI.
-->

---

# <code>AGENTS.md</code>: карта, источник истины, запреты

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>AGENTS.md</span><span>demo/agent-ready-v2 · адаптированный фрагмент</span></div>

```md {all|1-2|4-8|10-15|17-21}
# Enterprise App Optimization
Nx-монорепа: shell и React-микрофронты, каждый деплоится отдельно. Node 22+.

## Где что лежит
- Продукт → `src/microfrontends/<name>/` (client, server, manifest.json)
- Опасные места со своими AGENTS.md → `src/shell-app/server/`, `src/microfrontends/common/`
- Архитектура → `docs/architecture/` · Производительность → `docs/performance.md`
- Текущее изменение → `openspec/changes/<id>/` · Скиллы → `.agents/skills/`

## Источник истины
Документация важнее соседнего кода. Рядом лежит код, который работает, но так делать нельзя:
продукты собираются корневым Babel-конфигом в CommonJS, а визард React Perf специально написан
с антипаттернами (docs/performance.md).
При расхождении проверь актуальность правила и причину. Явно помеченный legacy не копируй.
Затронут публичный контракт или нужен выход за scope — уточни решение. Расхождение укажи в отчёте.

## Никогда
- не импортируй страницу статически: только lazy-роут
- не пиши клиентский код в CommonJS: никаких `require()`, Babel продукта — с `modules: false`
- не добавляй эндпоинт без авторизации и не проксируй на адрес из запроса
- не ослабляй baseline в `performance/`, чтобы проверка позеленела
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Что попадает в каждую задачу</b><p>Корневой AGENTS.md задаёт общие ориентиры проекта. Здесь оставляем то, что нужно для большинства задач. Разберём по частям.</p></div>
  <div v-click="[1, 2]" class="note"><b>Одна строка о проекте</b><p>Никаких «ты опытный разработчик»: роль ничего не говорит модели о нашем коде.</p></div>
  <div v-click="[2, 3]" class="note"><b>Карта вместо пересказа</b><p>Только пути и куда идти за подробностями. Архитектура живёт в docs, поэтому AGENTS.md не разрастается. Вложенные AGENTS.md упомянуты прямо здесь.</p></div>
  <div v-click="[3, 4]" class="note"><b>Главная строка для legacy</b><p>Не «делай по документации» вслепую: проверить, актуально ли правило и почему код другой, не копировать помеченный legacy, если меняется контракт — спросить владельца.</p></div>
  <div v-click="4" class="note"><b>Конкретные запреты</b><p>Четыре ошибки, которые у нас дорого обходятся. Конкретное ограничение проще выполнить и проверить, чем общий совет «пиши качественно».</p></div>
</div>
</div>

<!--
Время: 1:40.
Идти по кликам. Сюда не кладём то, что модель и так знает, и то, что можно вывести из кода.
Исследование ETH Zurich 2026 года (arXiv 2602.11988): AGENTS.md, сгенерированные моделью, снижают успех примерно на 3%,
написанные людьми дают около +4%, а стоимость задач в обоих случаях растёт больше чем на 20%. Отсюда мой вывод: пишем руками и только то, что нужно.
-->

---

# <code>AGENTS.md</code>: cross-zone и Definition of Done

<div class="annotated wide">
<div class="file md-view">
<div class="file-head"><span>AGENTS.md (продолжение)</span><span>demo/agent-ready-v2 · превью</span></div>
<div class="md-body">
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

## Cross-zone: что ещё затронет правка

| Меняешь | Затронет | Проверка |
|---|---|---|
| `common/webpack/createMicrofront…` | сборку всех микрофронтов репозитория | architecture, bundle |
| `id` или `routePath` в manifest.json | меню, сохранённые ссылки, MemLab-селекторы | architecture, smoke |
| `shell-app/server/lib/*` | загрузку всех продуктов сразу | smoke всех продуктов |
| `shell-app/client/shared/*` | все страницы, которые его импортируют | memory для каждой |
| таблицу или список с пагинацией | риск утечки DOM после ухода со страницы | memory для роута |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Команды

- architecture → `npm run check:architecture` (статически) · bundle → `npm run check:bundle`
- smoke → `npm run dev`, открыть продукты из меню и по прямому URL
- memory → `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js`
- web vitals → `npm run start:prod -- --build`, затем `WEB_VITALS_BASE_URL=http://localhost:4300 npm run check:web-vitals -- <роут>`
- всё сразу → `npm run check` (architecture + lint + build)

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Definition of Done

Сопоставь каждый requirement спеки с проверкой: таблица cross-zone выше и скилл performance-check. Всегда — `npm run check`. Незапущенная обязательная проверка — «не подтверждено», а не «прошло».

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 4 }">

## Сначала спроси владельца из CODEOWNERS

общая зависимость · `id`, `routePath`, `entryPath`, `api.prefix` в действующем manifest · `common/` · `shell-app/server/`. Новый manifest по согласованной спеке — без повторного согласования

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Вторая половина файла</b><p>Отвечает на два вопроса: на какие ещё зоны влияет правка и как доказать, что работа закончена.</p></div>
  <div v-click="[1, 2]" class="note"><b>Cross-zone-зависимости</b><p>Самое полезное, что мы добавили. Агент правит один файл и сразу видит, на что ещё это влияет и чем это проверить. В продукте такие таблицы есть и в корне, и в документации каждой области.</p></div>
  <div v-click="[2, 3]" class="note"><b>Точные команды</b><p>Не «проверь память», а готовая команда с переменной окружения. check:architecture сверяет конфигурацию статически: что роут и entry реально открываются, показывает только smoke.</p></div>
  <div v-click="[3, 4]" class="note"><b>Definition of Done — команды и отчёт</b><p>Спека говорит «что проверить», AGENTS.md — «чем». Плюс честный список того, что не проверено.</p></div>
  <div v-click="4" class="note"><b>Когда остановиться и спросить</b><p>Три уровня: «никогда», «сначала спроси», всё остальное можно. Спрашиваем, когда меняется действующий контракт; новый продукт по согласованной спеке повторно не согласуем.</p></div>
</div>
</div>

<!--
Время: 1:20.
Таблица cross-zone — ответ на главный страх большого проекта: правка в общем коде ломает соседние команды.
Для опасных мест есть вложенные AGENTS.md (shell-app/server, common) — покажу их в коммите.
Файл показан как превью Markdown, чтобы таблица читалась со сцены; в репозитории это обычный AGENTS.md. Строку web vitals добавляет шаг 7.
«Все микрофронты репозитория» — про демо (их два). 25+ продуктов — это настоящий KSC.
-->

---

# AGENTS.md: противоречия и лишние советы

<div class="annotated">
<div class="file code-xs wrap bad">
<div class="file-head"><span>AGENTS.md — фрагменты</span><span>demo-before</span></div>

```md {all|1-2|5,9|6-7|11-12|14-16}
Ты senior React-разработчик с 20-летним опытом.
Будь ОЧЕНЬ внимателен к производительности!!!

## ПРОИЗВОДИТЕЛЬНОСТЬ (ОЧЕНЬ ВАЖНО!!!)
- Используй code splitting и `React.lazy` для тяжёлых компонентов.
- Тяжёлые библиотеки (antd, иконки, moment) подключай через `require()` прямо в компоненте —
  так они загрузятся, только когда понадобятся.
  … и ещё десятки общих советов
- Импортируй страницы сразу (без lazy), чтобы не было мигания при загрузке.

## Сборка
- Если сборка падает — поправь общий код в `src/microfrontends/common/` под себя, там всё просто.

## Проверка перед сдачей
IMPORTANT: `npm run check:ai` — финальный гейт качества. … Если он зелёный — задача готова.
AI-бот отвечает сразу. Если он одобрил — можно мержить.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Реальный файл из demo-before</b><p>Всё это я видел в рабочих репозиториях. По отдельности строки выглядят безобидно, вместе ведут агента в ловушку.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Роль и капслок</b><p>Ноль информации о проекте. Из-за капслока и «ОЧЕНЬ» труднее заметить действительно важные правила.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Правила противоречат друг другу</b><p>«Используй lazy» и «импортируй страницы сразу» в одном файле. Агент получает два несовместимых указания. По результату нужно выяснить, какое из них он использовал.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Вредный совет</b><p><code>require()</code> внутри компонента не создаёт отдельный сетевой чанк. В одном из прошлых замеров такое подключение вместе с CommonJS-конфигом увеличило entry примерно на 2,5&nbsp;МБ.</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Разрешение ломать общий код</b><p>Одна строка — и агент правит common/, от которого зависят все продукты.</p></div>
  <div v-click="5" class="note bad"><b>Ложный Definition of Done</b><p>check:ai печатает «пройдено» и ничего не проверяет, а одобрение бота считается готовностью.</p></div>
</div>
</div>

<p v-click style="margin-top: 0.8rem; font-size: 23px">Проверка каждой строки: помогает ли она агенту выбрать действие, соблюсти ограничение или проверить результат? Общие пожелания без этого можно убрать.</p>

<!--
Время: 1:20.
Anthropic в рекомендациях по CLAUDE.md советует для каждой строки спрашивать: «Если её убрать, агент ошибётся?» Если нет — убираем.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы изменили: AGENTS.md

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/e3b6c55b7a71dcabd90aeb42a4bfb61bc2519cf6" target="_blank">Шаг 1. AGENTS.md: карта проекта, запреты и cross-zone-зависимости</a></div>

<div class="practice-files">
  <div><code>AGENTS.md</code><br>карта, источник истины, запреты, таблица cross-zone, Definition of Done</div>
  <div><code>src/shell-app/server/AGENTS.md</code><br>вложенный файл для реестра и прокси: что уже ломалось и как это проверить</div>
  <div><code>src/microfrontends/common/AGENTS.md</code><br>вложенный файл для общей сборки: какие правки задевают все микрофронты</div>
</div>

<!--
Время: 1:30.
Открыть коммит на GitHub или в IDE. Пройти три файла, для каждого — одна фраза.
Показать, что корневой файл короткий, а подробности — во вложенных. Не каждый CLI подхватывает вложенные файлы сам, поэтому корневой AGENTS.md перечисляет их явно.
Историю с реестром рассказать подробно: это коммит 64f408a «drop stale microfrontends and isolate failed entries». Теперь в файле записано, как устроен реестр и почему нельзя отключать TTL.
Команды check:*, на которые ссылается AGENTS.md, появятся в шаге 6.
Формат «что поменял → что сломается → как это проявится» и есть самое ценное во вложенных файлах.
Ссылки на восемь шагов — снимки на момент шага. Уточнения после ревью лежат отдельными коммитами «Полировка …» поверх ветки: актуальные файлы — на HEAD demo/agent-ready-v2.
-->

---

# Live: что агенты прочитали первым

<div class="two-col" style="align-items: start">
  <div v-click class="flat-card bad">
    <h3>Run A</h3>
    <p class="muted">Смотрим в трейсе: послушался ли вредных советов из AGENTS.md, какой скилл выбрал, скопировал ли хук с утечкой по совету из старой документации.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B</h3>
    <p class="muted">Ожидаем путь AGENTS.md → спека → docs/architecture → один эталонный микрофронт. Смотрим, позвал ли explorer.</p>
  </div>
</div>

<p v-click style="margin-top: 1.5rem; font-size: 26px">Заглядываем на минуту, итоги разберём в конце.</p>

<!--
Время: 1:00.
Переключиться в терминалы. Качество Run A не комментировать — просто показать, с чего он начал.
-->

---
layout: center
---

<div class="eyebrow">Блок 2</div>

# Документация: как в проекте принято и почему

<p class="muted" style="font-size: 26px">Посмотрим на фрагмент нашей документации и сравним общий совет с рекомендацией для нашего кода.</p>

<!--
Время: 0:15.
-->

---

# Одна документация для людей и агента

<div class="annotated wide">
<div class="file md-view">
<div class="file-head"><span>docs/performance.md</span><span>адаптированный фрагмент · превью</span></div>
<div class="md-body">

# Производительность фронтенда

<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

Владелец: @perf-guild · Проверено: 2026-09 · Проверки: `npm run check:bundle`, `npm run check:web-vitals`

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Текущие правила

1. Страницу продукта подключай через lazy-роут: `React.lazy` + `Suspense` в элементе роута.
2. Клиентский код — только ES-модули: `import`/`export` и свой `client/babel.config.cjs` с `modules: false`.
3. Кто создал observer, таймер или подписку, тот и снимает их в cleanup эффекта.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Не копируй: код работает, но так делать нельзя

| Что | Где встретишь | Почему нельзя |
|---|---|---|
| CommonJS: `require()`, `modules: 'cjs'` | корневой `babel.config.cjs` | entry больше, `import()` без чанка |
| статический `import` страницы | `users-and-roles/client/index` | код страницы в стартовом бандле |
| тяжёлый расчёт прямо в рендере | визард React Perf, HeavyBlock | ~150 мс блокировки на каждый ввод |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 4 }">

## Подводные камни

- Сборка и функциональные тесты могут пройти, хотя entry стал больше. В прошлом замере entry users-and-roles весил 8,4 МБ вместо 5,9: CommonJS ухудшает удаление неиспользуемого кода. Рост относительно baseline ловит `npm run check:bundle`.
- Тяжёлый расчёт в рендере не выглядит ошибкой: код короткий и понятный. А в фильтре визарда каждое нажатие клавиши блокирует UI на ~150 мс. Видно только в React Profiler или трейсе.

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Не отдельная дока для агента</b><p>Это обычная документация команды — её читают и люди, и агент. Мы только требуем четыре раздела: текущие правила, что не копировать, подводные камни и как проверить.</p></div>
  <div v-click="[1, 2]" class="note"><b>Владелец и дата</b><p>Владелец отвечает за обновление документа. Дата показывает, когда его последний раз сверяли с проектом.</p></div>
  <div v-click="[2, 3]" class="note"><b>Правила и проверки</b><p>Lazy-роут, только ES-модули, cleanup эффектов. Для этих правил указываем подходящие проверки: скрипт, тест или наблюдение в браузере.</p></div>
  <div v-click="[3, 4]" class="note"><b>Что не копировать</b><p>Человек помнит, что корневой Babel собирает в CommonJS «со времён IE11». Агент видит только рабочий код — поэтому устаревшие подходы называем явно: где лежат и какие ошибки вызывают.</p></div>
  <div v-click="4" class="note"><b>Ошибки, которые не видны при сборке</b><p>Формат: что изменил → как проявится ошибка → чем проверить. У цифр в docs подписаны условия: это пример прошлого замера, а не baseline. У Run A вместо этого старая документация, которая уверенно советует собирать в CommonJS ради IE11.</p></div>
</div>
</div>

<!--
Время: 1:40.
Отдельной документации «для агента» у нас нет: docs/ — общая, её читают и люди, и агент. Меняется только то, как она написана:
явно указывает устаревшие примеры и ошибки, которые не видны при сборке. Новичку в команде это помогает ровно так же, как модели.
8,4 МБ против 5,9 МБ — пример прошлого замера production-сборки users-and-roles (корневой Babel против modules: false). Команда и commit не зафиксированы, поэтому в docs/performance.md это сноска-иллюстрация. С performance/bundle-baseline.json не сравнивать: там текущий entry users-and-roles — около 48 МБ в той же команде npm run check:bundle.
~150 мс для HeavyBlock — ориентир из docs без зафиксированных условий замера, говорим «порядка».
-->

---

# Общий совет и рекомендация для нашего проекта

<div class="two-col">
  <div v-click class="flat-card bad">
    <h3>Совет без условий применения</h3>
    <p>«Оптимизируй всё через <code>useMemo</code> и <code>useCallback</code>: колонки, обработчики, отфильтрованные данные, даже простые строки. Так компоненты не перерисовываются лишний раз.»</p>
    <p class="muted"><code>docs/architecture.md</code> в demo-before: март 2021, без владельца и без единой проверки. Документ повторяет общий совет, но не объясняет, когда он нужен и как проверить эффект. Он доступен Run A.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Рекомендация с замером</h3>
    <p>«Замеряй конкретное действие, а не мемоизируй всё подряд. В фильтре визарда React Perf <code>HeavyBlock</code> пересчитывается на каждый ввод — ~150&nbsp;мс блокировки. Видно в React Profiler или в трейсе. Мемоизация и debounce — варианты решения, а не правило.»</p>
  </div>
</div>

<p v-click style="margin-top: 1rem; font-size: 23px">Для технической рекомендации полезно указать, где она применяется и чем проверить результат. У документа — владелец и дата последней проверки.</p>

<!--
Время: 1:00.
Общий совет можно вставить в документацию любого React-проекта, и модель знает его без нас. Рекомендация справа — про наш код: где, сколько и чем проверить.
Справа — «Рендер React» и «Не копируй» из docs/performance.md демо-ветки. ~150 мс — ориентир без зафиксированных условий замера.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: документацию

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/0b53e27b99c852c2051a3203a25dbd8c4969e165" target="_blank">Шаг 2. Документация: текущие правила, что не копировать, подводные камни</a></div>

<div class="practice-files">
  <div><code>docs/architecture/microfrontends.md</code><br>контракт, что брать у соседнего продукта и что не копировать, подводные камни, рецепт lazy-чанков через shell</div>
  <div><code>docs/architecture/frontend.md</code><br>правила рендера, жизненного цикла и lazy-загрузки</div>
  <div><code>docs/performance.md</code><br>текущие правила, что не копировать (CommonJS, HeavyBlock), подводные камни — разобрали на слайде</div>
  <div><span class="muted">Показать</span><br>раздел «Lazy-чанки через shell» — обход проверили руками на users-and-roles, а в ветке оставили только описание</div>
</div>

<!--
Время: 1:00.
Смотрите: «Не копируй» с номерами PR. Если агент полезет в историю и найдёт эти PR, документация заранее говорит, что от этих подходов отказались.
Раздел «Проверка» честно называет покрытие: поиск импортов соседей — строковая эвристика, а не граф зависимостей; лишний чанк в dist — не доказательство загрузки страницы.
Ссылка ведёт на снимок шага 2. Уточнения после шагов — в коммитах полировки на HEAD ветки demo/agent-ready-v2.
-->

---
layout: center
---

<div class="eyebrow">Блок 3</div>

# Спецификация: договориться о задаче до кода

<p class="muted" style="font-size: 26px">Как внедрить spec-driven development (SDD) в legacy, что включить в спеку и как избежать неоднозначности.</p>

<!--
Время: 0:15.
-->

---

# SDD в legacy: как внедрить и что это даёт

<div class="two-col" style="align-items: start">
  <div>
    <h3 class="green">Как внедряем</h3>
    <ul>
      <li v-click>Начинаем с одного настоящего изменения, которое всё равно нужно сделать.</li>
      <li v-click>Спеку пишем только на то, что меняем.</li>
      <li v-click>Черновик готовит агент по тикету и коду, владелец области дорабатывает его.</li>
      <li v-click>После мёржа спека остаётся рядом с кодом.</li>
    </ul>
  </div>
  <div>
    <h3 class="yellow">Что это даёт</h3>
    <ul>
      <li v-click>Замысел ревьюим до кода: поправить абзац дешевле, чем 40 файлов.</li>
      <li v-click>Контракты legacy, которых не видно в коде, записаны явно.</li>
      <li v-click>Модели не нужно додумывать продуктовый смысл по ходу работы.</li>
    </ul>
  </div>
</div>

<p v-click class="source">OpenSpec, «Existing projects»: «Resist the urge to back-fill everything». Кейс: arXiv 2605.18461 — один опубликованный пример brownfield-проекта, не исследование.</p>

<!--
Время: 1:40.
Главное для legacy: мы не документируем прошлое, мы фиксируем каждое новое решение. Покрытие растёт само,
с каждой заархивированной спекой. Цифры из кейса не обещаю — это один опубликованный пример.
Критика SDD справедлива: для маленькой задачи подробная спека может оказаться лишней работой. Поэтому спека у нас — на заметное изменение, а не на каждую правку.
-->

---

# Какой должна быть спека

<div class="two-col">
  <div>
    <div v-click class="flat-card"><h3>1 · Поведение и ограничения</h3><p class="muted">Что должно измениться для пользователя и какие технические контракты нужно сохранить. Детали реализации — в рамках этих ограничений.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>2 · Сценарии WHEN / THEN</h3><p class="muted">Каждый можно проверить руками или тестом.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>3 · Scope и разрешения</h3><p class="muted">Что не трогаем и что можно поменять, если упёрлись: например, конфиг своего микрофронта.</p></div>
  </div>
  <div>
    <div v-click class="flat-card"><h3>4 · Контракты legacy</h3><p class="muted">id, роуты, API, которые нельзя сломать. Их не видно в коде соседей.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>5 · Проверяемое «готово»</h3><p class="muted">Критерии приёмки и способ проверки: команда, тест или конкретный сценарий в браузере.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>6 · Прочитана человеком</h3><p class="muted">Существенные вопросы закрыты до кода. Это договорённость, а не автоматическая проверка. Большое изменение разбиваем на части.</p></div>
  </div>
</div>

<!--
Время: 1:00.
Это совпадает с тем, что советуют OpenSpec (сценарии WHEN/THEN), Kiro (требования в нотации EARS: WHEN … THE SYSTEM SHALL …)
и Addy Osmani (границы «всегда / спроси / никогда», небольшой объём). Если хотя бы одного пункта нет — спека возвращается на доработку, как код на ревью.
-->

---

# Пример спеки

<div class="annotated wide">
<div class="file md-view">
<div class="file-head"><span>…/add-application-security/specs/application-security/spec.md</span><span>фрагмент · превью</span></div>
<div class="md-body">
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

## Публичный контракт

После мёржа не меняется: на это опираются ссылки пользователей и автотесты.

| Контракт | Значение |
|---|---|
| Пункт меню | Application Security |
| Роут (`routePath` = `path` в роуте) | `/application-security` |
| `id` в manifest (`data-testid` пункта меню) | `application-security-microfrontend` |
| Entry (`entryPath` / `outputFileName`) | `/application-security.js` / `application-security.js` |
| Префикс API | `/api/mf/application-security` |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

### Requirement: Страница инвентаря Application Security

Shell SHALL показывать пункт «Application Security» и открывать таблицу приложений с пагинацией по `/application-security`.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

#### Scenario: открыть из меню

- WHEN пользователь нажимает «Application Security»
- THEN открывается таблица приложений; есть состояния loading, empty и error
- AND код страницы скачивается только в этот момент (lazy-чанк)

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 4 }">

## Если упёрся

Если lazy-чанк не собирается или не грузится через shell, можно менять конфиг только этого микрофронта (Babel, webpack, его сервер). Опиши обход в отчёте.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 5 }">

## Вне scope

- редактирование, фильтры, экспорт · изменения в `common/`, shell или других продуктах

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Фрагмент спеки</b><p>Показываю самое важное: контракт, требование со сценарием, разрешение на случай, если упёрся, и что вне scope.</p></div>
  <div v-click="[1, 2]" class="note"><b>Публичный контракт</b><p>Значения, на которые опираются ссылки пользователей и автотесты. Агент не должен их придумывать.</p></div>
  <div v-click="[2, 3]" class="note"><b>Требование</b><p>Одно предложение о поведении, без слов «быстро» и «красиво».</p></div>
  <div v-click="[3, 4]" class="note"><b>Сценарий</b><p>Каждая строка THEN проверяется руками или тестом. «Код скачивается только в этот момент» — это и есть требование к lazy-загрузке.</p></div>
  <div v-click="[4, 5]" class="note"><b>Разрешение, если упёрся</b><p>Можно менять конфиг только своего микрофронта. Без этого агент либо сдаётся, либо лезет чинить общий код.</p></div>
  <div v-click="5" class="note"><b>Вне scope</b><p>Иначе агент «заодно» поправит common/, а от него зависят все продукты. Служебная регистрация нового продукта (package.json, nx.json, tsconfig, lockfile) разрешена явно.</p></div>
</div>
</div>

<!--
Время: 1:40.
В конце файла — «Definition of Done» без команд: «каждый requirement подтверждён проверкой, которую можно повторить; зелёная сборка не доказательство; непроверенное — так и помечай».
Ещё в спеке: минимум данных (фиксированный демонабор, поля записи, несколько страниц) и предпосылка демо «спека согласована с владельцем» — это договорённость, а не проверенный факт.
Команд и ссылок на docs в спеке нет намеренно: её получают оба прогона. Какой командой проверить lazy-чанк или память, агент должен найти в репозитории.
-->

---

# Пример бесполезной спеки

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>spec.md — антипример</span><span>так писали раньше</span></div>

```md {all|3|4|5|8-10|12-13}
# Страница Application Security

Нужно сделать страницу безопасности приложений, как у соседей.
Страница должна быстро загружаться и хорошо выглядеть.
Заодно ускорить инициализацию shell, она медленная.

## Технические детали
- antd и иконки подключать через require() — пусть грузятся по требованию
- Таблица на antd, 50 строк на странице
- … и дальше код компонентов целиком

## Готово
Протестировать, что всё работает.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Так выглядели наши спеки</b><p>Такие пишут, когда торопятся. Агент выполнит её добросовестно — и сделает не то. В демо её не получает никто: оба прогона получают спеку с контрактами и проверяемыми сценариями.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>«Как у соседей»</b><p>У соседей четыре разных подхода. Со спекой агент всё равно угадывает.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>«Быстро и хорошо»</b><p>Нечем проверить. Агент назовёт «быстрым» любой результат.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>«Заодно»</b><p>Scope расползся на инициализацию shell, от которой зависят все продукты. Одна фраза — и под угрозой работа десяти команд.</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Реализация вместо контракта</b><p>Контракт в спеке нужен: id, роут, entry. А решения «как делать» — нет: спека велит подключать antd через <code>require()</code>, и библиотека целиком уедет в entry. Код в спеке устаревает раньше, чем начнётся работа.</p></div>
  <div v-click="5" class="note bad"><b>«Протестировать»</b><p>Агент проверит, что собралось, и напишет «готово».</p></div>
</div>
</div>

<!--
Время: 1:10.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: спецификацию

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/6a0f3e664ed6a97a6af3c00f8e5fee88ea8e014a" target="_blank">Шаг 3. Спецификация Application Security</a></div>

<div class="practice-files">
  <div><code>…/add-application-security/specs/application-security/spec.md</code><br>контракт, сценарии, разрешение для lazy-чанка, «готово»</div>
  <div><code>proposal.md</code> и <code>tasks.md</code><br>зачем это изменение, шаги со скиллами и субагентами и приёмка: «retry → остановить сервер, «Повторить» после запуска → скриншот таблицы»</div>
  <div><code>openspec/README.md</code><br>как мы работаем со спеками в legacy</div>
  <div><span class="muted">Показать</span><br>этот файл получают оба прогона — в <code>demo-before</code> он такой же</div>
</div>

<!--
Время: 1:00.
Спека одна на оба прогона. tasks.md есть только в Run B: это уже harness — связка спеки со скиллами и субагентами, их покажу дальше.
В tasks.md — чек-лист `- [ ]` и таблица «требование → проверка → результат»: loading, empty, error, malformed, retry, пагинация, прямой URL, посторонний render. Где команда свойство не подтверждает — повторяемый сценарий в браузере через MCP.
OpenSpec CLI в репозитории не подключён: validate и archive не показываем как работающие.
Равенство spec.md и proposal.md в demo-before и demo/agent-ready-v2 проверено git diff после полировки.
-->

---
layout: center
---

<div class="eyebrow">Блок 4</div>

# Скиллы: как делать повторяющуюся работу

<p class="muted" style="font-size: 26px">Какие скиллы у нас есть, как устроена процедура скилла, как делимся ими между командами и где брать идеи.</p>

<!--
Время: 0:15.
-->

---

# Какими скиллами мы пользуемся

<div class="skill-grid four">
  <div v-click class="flat-card"><h3>story-analysis</h3><p class="muted">Разбирает тикет до кода: задаёт недостающие вопросы, находит затронутые контракты и готовит черновик спеки.</p></div>
  <div v-click class="flat-card"><h3>log-trace-analysis</h3><p class="muted">Скрипт сворачивает лог в сводку. Агент проверяет возможную причину по логу и коду.</p></div>
  <div v-click class="flat-card"><h3>performance-check</h3><p class="muted">По типу изменения выбирает нужные проверки: бандл, память, рендер, рантайм.</p></div>
  <div v-click class="flat-card"><h3>ui-form</h3><p class="muted">Формы на нашем UI-ките: обёртки полей, валидация, все состояния, доступность.</p></div>
  <div v-click class="flat-card"><h3>safe-change</h3><p class="muted">Правка общего кода: сначала список потребителей и план отката, потом код.</p></div>
  <div v-click class="flat-card"><h3>security-check</h3><p class="muted">Проверяет, откуда приходят внешние данные и куда уходят: авторизация эндпоинтов, allowlist прокси, CORS, секреты. Blocker-находки не чинит сам.</p></div>
  <div v-click class="flat-card"><h3>code-review</h3><p class="muted">Ревью diff по контрактам репозитория. Замечание подтверждается нарушенным контрактом, правилом проекта или воспроизводимым сценарием. Вкусовые предложения не выдаются за обязательные исправления.</p></div>
  <div v-click class="flat-card"><h3>web-vitals-check</h3><p class="muted">Поднимает приложение, через Chrome DevTools MCP меряет LCP и CLS роута, при превышении бюджета разбирает трейс.</p></div>
</div>

<!--
Время: 1:20.
Обычно больше всего помогает story-analysis: неясные вопросы разбираем до реализации, когда ещё легко изменить решение.
code-review — основа агентного ревью в CI, подробнее в блоке про проверки.
security-check — не пересказ OWASP, а короткий список того, что в этом репозитории уже было опасно. Его же использует security-reviewer в CI — покажу в блоке про ревью.
[TODO: какой скилл оказался самым полезным у вас — одна живая история.]
-->

---

# Скилл <code>performance-check</code>: разбор

<div class="annotated wide">
<div class="file md-view tight">
<div class="file-head"><span>.agents/skills/performance-check/SKILL.md</span><span>адаптированный фрагмент · превью</span></div>
<div class="md-body">
<div class="sec frontmatter" :class="{ dim: $clicks > 0 && $clicks !== 1 }">
  <div><span>name</span><code>performance-check</code></div>
  <div><span>description</span><p>Выбирает и запускает проверки производительности после изменений фронтенда, которые могут повлиять на старт и загрузку, бандл, рендер, память DOM или рантайм микрофронтов. Не нужен для документации и изменений, которые не влияют на загрузку, layout, рендер или память.</p></div>
</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

Правила описаны в `docs/performance.md` — здесь их не повторяем.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## 1. Определи, что может сломаться

Классы: startup, bundle, rendering, memory, microfrontend — может быть несколько. Решай по тому, что заметит пользователь, а не по имени файла.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 4 }">

## 2. Выбери минимальный набор проверок

| Класс | Проверки |
|---|---|
| bundle | `npm run check:bundle` |
| memory | `npm run dev`, затем `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js` |
| microfrontend | `npm run check:architecture` и `npm run check:bundle` |
| rendering | lint, сборка и запись React Profiler для затронутого действия |
| startup | `npm run check:web-vitals` для роута; разбор — скилл web-vitals-check |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 5 }">

## 3. Чего не делать · Готово, когда

- не подменяй сценарий MemLab чужим · не ослабляй baseline: спроси @perf-guild
- риск связан со сценарием и проверкой; команда и результат сохранены
- незапущенная проверка — «не подтверждено» и не засчитана

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Здесь скилл задаёт процедуру</b><p>После правки помогает выбрать проверки и подготовить отчёт. Подробные правила и объяснения остаются в документации.</p></div>
  <div v-click="[1, 2]" class="note"><b>description</b><p>Короткое описание помогает клиенту и модели выбрать скилл. В нём указаны условия применения; способ загрузки зависит от CLI.</p></div>
  <div v-click="[2, 3]" class="note"><b>Ссылка вместо копии</b><p>Правила живут в docs. Если скопировать их в скилл, через полгода версии правил могут разойтись.</p></div>
  <div v-click="[3, 4]" class="note"><b>Сначала понять риск</b><p>По тому, что заметит пользователь, а не по имени файла. Иначе правку в hooks/ агент сочтёт «не про производительность».</p></div>
  <div v-click="[4, 5]" class="note"><b>Минимальный набор</b><p>Таблица связывает риск изменения с проверкой и помогает не запускать весь набор без необходимости.</p></div>
  <div v-click="5" class="note"><b>Запреты и условие завершения</b><p>Запреты — реальные промахи агента. Раздел «Готово, когда» указывает, чем подтвердить результат каждой проверки и когда работу можно завершить. Непроверенное не засчитывается.</p></div>
</div>
</div>

<!--
Время: 1:40.
У нас правило — SKILL.md держим коротким; длинные справочники — в references, детерминированная работа — в scripts.
«Готово, когда» есть в каждом скилле: 3–5 условий завершения его процедуры, общий DoD остаётся в AGENTS.md. На слайде раздел «Чего не делать» сокращён, чтобы поместились условия завершения.
Скиллы могут содержать и процедуры, и справочные материалы. Здесь мы разбираем процедурный скилл.
-->

---

# <code>log-trace-analysis</code>: от большого лога к проверяемой гипотезе

<div class="two-col">
  <div v-click class="file code-xs wrap">
  <div class="file-head"><span>.agents/skills/log-trace-analysis/SKILL.md</span></div>

```md
---
name: log-trace-analysis
description: Разбирает логи, HAR и трейсы длиннее 300 строк — ищет первую ошибку, прослеживает её по сервисам и показывает место в коде. Используй, когда в задаче есть лог стенда, вывод упавшей проверки или трейс.
---

1. Не читай сырой файл целиком. Запусти
   `node .agents/skills/log-trace-analysis/scripts/summarize.cjs <файл>`
2. Возьми traceId самой ранней ошибки и запусти скрипт ещё раз
   с `--trace <id>`. Нет traceId — строки вокруг line N.
3. Сопоставь упавший URL с кодом: префикс API →
   manifest.json → роут сервера.
4. Ответ: первая ошибка, цепочка последствий, место в коде
   (file:line) и команда-владелец из CODEOWNERS, уверенность
   (высокая/средняя/низкая), чего лог НЕ показывает.
```

  </div>
  <div>
    <pre v-click class="repo-tree" style="font-size: 17px">$ node …/summarize.cjs fixtures/sample.log
5 039 lines · 3 error groups
#1  12:04:17.201  trace 9f3c1a7e…
    502 /api/mf/application-security/apps
    × 6 (first seen, 3 services)
#2  12:04:17.388  trace 9f3c1a7e…
    TypeError: rows.map is not a function
    × 6 (after #1, same traces)
#3  12:05:02.914  trace 51aa07c2…
    WS reconnect: socket closed (1006)
    × 4 (unrelated)</pre>
    <p v-click style="margin-top: 1rem; font-size: 23px">Сначала агент получает сводку, затем запрашивает нужные фрагменты. Причину проверяет по цепочке событий и коду.</p>
  </div>
</div>

<!--
Время: 1:00.
Группировка, подсчёт и сортировка — детерминированная работа, её незачем отдавать модели.
Вывод справа — настоящий запуск скрипта на fixtures/sample.log (около 5 000 строк) из демо-ветки, его можно повторить вживую.
Самая ранняя ошибка в логе — отправная точка, а не автоматически доказанная первопричина. В скилле это условие завершения: причина помечена как подтверждённая или как гипотеза.
HAR: 4xx (например, 404 lazy-чанка) тоже попадают в сводку с пометкой «зацепка, а не первопричина».
-->

---

# Скилл без процедуры и критериев завершения

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>.agents/skills/frontend-helper/SKILL.md — антипример</span><span>demo-before</span></div>

```md {all|1-4|6|8-11|13-14|16}
---
name: frontend-helper
description: Помогает с фронтендом
---

Ты опытный фронтенд-разработчик. Пиши быстрый код.

## Лучшие практики React
- Всегда используй useMemo и useCallback
- Компоненты должны быть маленькими
- … и ещё десятки советов из статьи 2023 года

## Бандл
Тяжёлые библиотеки подключай через require() внутри компонента.

Проверь, что всё работает.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Типичный первый скилл</b><p>Кто-то собрал полезные советы в одну папку и назвал это скиллом.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Описание ни о чём</b><p>Под «помогает с фронтендом» подходит почти любая задача. По такому описанию трудно выбрать, когда скилл действительно нужен.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Общее пожелание вместо действия</b><p>«Пиши быстрый код» не объясняет, что измерить и чем проверить результат.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Советы без условий применения</b><p>Проблема не в справочных знаниях, а в неверном универсальном правиле «всегда useMemo».</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Противоречит документации</b><p>Скилл советует <code>require()</code> для ленивой загрузки, а документация проекта запрещает этот способ. Перед работой нужно устранить противоречие.</p></div>
  <div v-click="5" class="note bad"><b>Нет результата</b><p>Не указано, когда закончить работу и что включить в отчёт. «Проверь, что всё работает» не объясняет, что именно проверять.</p></div>
</div>
</div>

<!--
Время: 1:10.
Перед созданием скилла спросите: решается ли задача без него так же хорошо? Если да — скилл не нужен.
Проверяется это evals — о них в конце.
-->

---

# Как делимся скиллами между командами

<div class="two-col">
  <div v-click class="file code-sm">
  <div class="file-head"><span>.github/CODEOWNERS</span><span>фрагмент</span></div>

```text
/AGENTS.md                           @platform-frontend
/src/shell-app/server/               @platform-frontend
/src/microfrontends/common/          @platform-frontend
/.agents/skills/performance-check/   @perf-guild
/.agents/skills/log-trace-analysis/  @observability
/.agents/skills/ui-form/             @design-system
/.agents/review/                     @platform-frontend
/evals/                              @platform-frontend
```

  </div>
  <div>
    <ul style="font-size: 23px">
      <li v-click><b>Монорепозиторий:</b> скиллы лежат в <code>.agents/skills/</code>, каждая команда получает их вместе с кодом.</li>
      <li v-click><b>CODEOWNERS</b> назначает владельца для ревью. Обязательный аппрув включаем в настройках защищённой ветки.</li>
      <li v-click><b>Реестр:</b> <code>.agents/skills/README.md</code> — что делает, когда брать, владелец, eval-кейс.</li>
      <li v-click><b>Изменение скилла</b> — вместе с прогоном eval-кейса «до и после»; подробнее в блоке про evals.</li>
      <li v-click><b>Чужие скиллы</b> — только как идеи: у 13% из 3&nbsp;984 публичных скиллов Snyk нашёл критичные проблемы. Читаем, адаптируем, кладём копию к себе.</li>
    </ul>
  </div>
</div>

<!--
Время: 1:00.
Никакой отдельной платформы: скиллы — это код и живут по правилам кода.
Запись в CODEOWNERS сама по себе не запрещает мёрж. Кроме того, владельцы в демо — пример структуры ответственности, а не подтверждение настроек публичного репозитория.
[TODO: сверить имена команд-владельцев с реальной практикой.]
-->

---

# Готовые скиллы: откуда брать идеи

<div class="two-col" style="align-items: start">
  <div>
    <div v-click class="flat-card"><h3><a href="https://github.com/obra/superpowers" target="_blank">obra/superpowers</a></h3><p class="muted">brainstorming, writing-plans, systematic-debugging, test-driven-development, verification-before-completion. Общий процесс «спека → план → тесты → ревью», кто бы ни вёл задачу.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3><a href="https://github.com/anthropics/skills" target="_blank">anthropics/skills</a></h3><p class="muted">webapp-testing на Playwright поднимает несколько серверов сразу — удобно для shell и плагинов. skill-creator помогает писать и проверять свои скиллы.</p></div>
  </div>
  <div>
    <div v-click class="flat-card"><h3><a href="https://github.com/addyosmani/agent-skills" target="_blank">addyosmani/agent-skills</a></h3><p class="muted">spec-driven-development, planning-and-task-breakdown, code-review-and-quality, performance-optimization. Есть инструкция для OpenCode.</p></div>
    <div v-click class="flat-card warn" style="margin-top: 0.8rem"><h3>Не ставьте напрямую</h3><p class="muted">Snyk проверил 3 984 публичных скилла: у 13% нашлись критичные проблемы. Читаем, адаптируем и кладём копию во внутренний репозиторий.</p></div>
  </div>
</div>

<p v-after class="source">Snyk, ToxicSkills, 2026. Для историй и требований — deanpeters/Product-Manager-Skills (user-story с критериями в Gherkin).</p>

<!--
Время: 1:00.
Это источники идей, а не готовые решения: у вас свои контракты и свои проверки.
Внутри контура это ещё и вопрос безопасности — скилл выполняет скрипты.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: скиллы

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/d1ace245c78a3ea111d82d1a12cfcc7f42af393d" target="_blank">Шаг 4. Скиллы и их владельцы</a></div>

<div class="practice-files">
  <div><code>.agents/skills/code-review/</code><br>ревью diff по правилам репозитория — его же запускает CI в блоке 6</div>
  <div><code>story-analysis/</code>, <code>safe-change/</code>, <code>security-check/</code><br>разбор тикета до кода; отчёт о влиянии до правки общего кода; риски безопасности</div>
  <div><code>.agents/skills/log-trace-analysis/</code><br>запустить скрипт на fixture вживую</div>
  <div><code>.agents/skills/README.md</code> и <code>.github/CODEOWNERS</code><br>реестр скиллов и их владельцы</div>
</div>

<!--
Время: 1:00.
Запускаю summarize на fixture — около 5 000 строк лога превращаются в три группы.
-->

---
layout: center
---

<div class="eyebrow">Блок 5</div>

# Субагенты: исследование в отдельном контексте

<p class="muted" style="font-size: 26px">В этом демо субагенты исследуют код, разбирают логи и проверяют diff. Изменения вносит основной агент.</p>

<!--
Время: 0:30.
Правило совпадает с опытом Anthropic и Cognition: параллельными делаем исследование и ревью, а запись кода оставляем в одном потоке.
Если параллельно пишут несколько агентов, каждый принимает свои неявные решения, и они расходятся. Многоагентные системы тратят в разы больше токенов — на внутренней модели это время GPU.
Это простой вариант для связанного legacy-кода. Несколько пишущих агентов тоже возможны — при независимых задачах и изоляции изменений.
-->

---

# Субагент <code>explorer</code>

<div class="annotated">
<div class="file code-xs wrap">
<div class="file-head"><span>.agents/agents/explorer.md</span><span>demo/agent-ready-v2</span></div>

```md {all|3|4,6|8-12|11}
---
name: explorer
description: Read-only исследует код, документацию и историю git. Используй, чтобы ответить «как X сделано сейчас, что из этого эталон и кто от этого зависит», не забивая файлами основной контекст.
tools: Read, Grep, Glob, Bash   # Bash — только git log, git show и git blame
---
Ты только исследуешь и никогда не меняешь файлы.

Верни не больше 25 строк:
1. Ответ — 2–3 предложения.
2. Доказательства — file:line для каждого утверждения.
3. Эталон или legacy — какие примеры совпадают с docs/architecture, а какие нет.
4. Неизвестное — что не удалось подтвердить.

Не вставляй файлы целиком. Не предлагай реализацию.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Три способа вызова</b><p>После регистрации в CLI субагента можно вызвать по описанию, из шага процедуры или явно по имени.</p></div>
  <div v-click="[1, 2]" class="note"><b>description решает, когда звать</b><p>Описание помогает основному агенту выбрать исследователя. Автоматический вызов зависит от клиента и настроек делегирования.</p></div>
  <div v-click="[2, 3]" class="note"><b>Короткий список инструментов</b><p>В файле задана инструкция работать только на чтение. Технический запрет записи и ограничения Bash настраиваются отдельно в CLI.</p></div>
  <div v-click="[3, 4]" class="note"><b>Контракт ответа</b><p>Лимит строк и file:line для каждого утверждения. Иначе основной агент получит слишком длинный ответ и снова будет разбирать все подробности.</p></div>
  <div v-click="4" class="note"><b>Эталон или legacy</b><p>Explorer сразу отделяет эталон от legacy — по документации, а не по тому, что выглядит свежее.</p></div>
</div>
</div>

<!--
Время: 1:30.
Эти файлы — описания субагентов. Для запуска нужно зарегистрировать их в конкретном CLI и настроить разрешения. Каталог `.agents/agents/` не является универсальным механизмом автозагрузки.
В демо explorer вызывается из tasks.md (шаг «Изучи один текущий микрофронт», сейчас 2) и из скиллов safe-change и story-analysis. Рядом лежат reviewer и log-analyst.
В OpenCode есть адаптеры только для explorer, reviewer и log-analyst (.opencode/agents/, тело совпадает с каноничным). edit: deny и список Bash-команд — права клиента, а не полная изоляция.
-->

---

# Где теряются требования между агентами

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>.agents/agents/ — фрагменты</span><span>demo-before</span></div>

```md {all|1|3-4|6-7|9-11}
Задача → PM → Архитектор → Разработчик → QA → PR ✅

pm.md: Если в задаче что-то неясно — додумай сам.
       Не задавай вопросов, команда ждёт.

architect.md: Если видишь, что общий код устарел,
              заложи его рефакторинг в решение.

qa.md: Если сборка зелёная и AI-проверка пройдена — одобряй.
       Если что-то упало — исправь сам.
tools у всех: Read, Write, Edit, Bash, Grep, Glob
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>«Как в настоящей команде»</b><p>README обещает: от тикета до мержа без участия человека. Выглядит солидно.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Эстафета пересказов</b><p>Если каждый агент получает только пересказ предыдущего, исходные требования могут потеряться или измениться.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Вопросы запрещены</b><p>PM додумывает сам — неясность из задачи превращается в уверенное решение.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Scope расползается</b><p>Архитектор закладывает рефакторинг общего кода в задачу про одну страницу.</p></div>
  <div v-click="4" class="note bad"><b>Проверяет тот, кто чинит</b><p>QA меняет код и сам одобряет результат по сборке. В этой схеме не выделена независимая проверка требований.</p></div>
</div>
</div>

<!--
Время: 1:00.
В нашем демо обязанности проще: основной агент меняет код, субагенты исследуют и проверяют. Проблема антипримера — потеря требований, расползание scope и отсутствие независимой проверки.
Рядом в demo-before лежит ревью-бот: комментарий к каждой строке, nit'ы без ссылки на правило и автоодобрение, если нет critical.
-->

---

# Как распределяем работу между агентами

<div class="sa-grid">
  <div v-click class="sa-card bad">
    <div class="sa-kicker">Передача задачи</div>
    <h3>Эстафета ролей</h3>
    <div class="sa-chain">
      <span>PM</span><i>→</i><span>Архитектор</span><i>→</i><span>Dev</span><i>→</i><span>QA</span>
    </div>
    <p>Каждый получает пересказ предыдущего агента. Решения расходятся, а результат проверяет тот, кто его исправлял.</p>
  </div>
  <div v-click class="sa-card good">
    <div class="sa-kicker">Распределение задач</div>
    <h3>Один исполнитель и помощники</h3>
    <div class="sa-hub">
      <span class="sa-sat s1">explorer<em>исследует</em></span>
      <span class="sa-sat s2">log-analyst<em>читает логи</em></span>
      <span class="sa-core">Основной агент<em>пишет код</em></span>
      <span class="sa-sat s3">reviewer<em>свежий взгляд</em></span>
    </div>
    <p>Помощники только читают и возвращают короткий ответ.</p>
  </div>
</div>

<div class="sa-takeaways">
  <div v-click><b>1</b>Код пишет один агент</div>
  <div v-click><b>2</b>У субагента конкретный вопрос, свой контекст и короткий ответ</div>
  <div v-click><b>3</b>Проверяет не тот, кто писал</div>
</div>

<!--
Время: 0:50.
Вывод блока. Не «команда как у людей», а один исполнитель, которому помогают исследователи и ревьюер.
Так советуют Anthropic (статья о multi-agent research system: параллелят исследование, а не запись) и Cognition («Don't Build Multi-Agents»: пишущие агенты принимают неявные решения, и они расходятся).
Несколько пишущих агентов возможны — для независимых задач и в изолированных worktree. Для связанного legacy-кода начинаем с простого варианта.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: субагентов

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/91742d3b2f87a41a60ee4d2b2893a55758094ea9" target="_blank">Шаг 5. Субагенты: explorer, reviewer, log-analyst</a></div>

<div class="practice-files">
  <div><code>.agents/agents/explorer.md</code><br>исследование только на чтение, ответ до 25 строк</div>
  <div><code>.agents/agents/reviewer.md</code><br>свежий взгляд на diff перед «готово»</div>
  <div><code>.agents/agents/log-analyst.md</code><br>разбор длинного вывода упавших проверок</div>
  <div><code>.agents/agents/README.md</code><br>три способа вызова и где они используются в tasks и скиллах</div>
</div>

<!--
Время: 0:50.
В tasks.md шаг 2 — explorer, шаг 13 «Отдай свой diff субагенту reviewer» — reviewer: так субагент попадает в работу без участия человека.
Локально в OpenCode доступны explorer, reviewer, log-analyst. Ревьюеры критичных путей — шаблоны для внутреннего CLI.
-->

---
layout: center
---

<div class="eyebrow">Блок 6</div>

# Проверки и ревью

<p class="muted" style="font-size: 26px">Агент завершает задачу по согласованным критериям. Проверки подтверждают результат, а непроверенное остаётся явно отмеченным.</p>

<!--
Время: 0:15.
-->

---

# Проверки агента: четыре уровня

<div class="annotated">
<div class="gl quality-levels" :class="{ dimming: $clicks >= 1 }">
  <svg class="gl-arrows" viewBox="0 0 800 420" aria-hidden="true">
    <defs><marker id="ql-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <line x1="324" y1="100" x2="436" y2="100" marker-end="url(#ql-tip)"/>
    <line x1="600" y1="159" x2="600" y2="271" marker-end="url(#ql-tip)"/>
    <line x1="436" y1="330" x2="324" y2="330" marker-end="url(#ql-tip)"/>
  </svg>
  <div class="gl-node ql-stage ql-loop" :class="{ focus: $clicks === 1 }"><em>01 · секунды</em><b>В цикле агента</b><span>быстрые проверки после правки</span></div>
  <div class="gl-node ql-stage ql-done" :class="{ focus: $clicks === 2 }"><em>02 · минуты</em><b>Перед «готово»</b><span>Definition of Done и отчёт</span></div>
  <div class="gl-node ql-stage ql-ci" :class="{ focus: $clicks === 3 }"><em>03 · каждый MR</em><b>CI и агентное ревью</b><span>те же команды и проверка diff</span></div>
  <div class="gl-node ql-stage ql-human" :class="{ focus: $clicks === 4 }"><em>04 · владелец</em><b>Человек</b><span>читает diff и мёржит</span></div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>От правки до мёржа</b><p>Быстрые проверки помогают агенту во время работы. В конце человек получает diff, результаты проверок и список непроверенного.</p></div>
  <div v-click="[1, 2]" class="note good"><b>В цикле агента</b><p>Линтер и другие быстрые проверки запускаются после правки через хук CLI, если он настроен. Ошибка сразу возвращается агенту.</p></div>
  <div v-click="[2, 3]" class="note good"><b>Перед «готово»</b><p>Проверки из Definition of Done: check:architecture, check:bundle, check:web-vitals. В отчёте — команды, результаты и то, что не удалось проверить.</p></div>
  <div v-click="[3, 4]" class="note good"><b>CI на каждый MR</b><p>Повторяет те же команды и запускает агентное ревью по политике команды. Агент может воспроизвести падение CI у себя.</p></div>
  <div v-click="4" class="note"><b>Владелец из CODEOWNERS</b><p>Читает diff и результаты проверок, оценивает непроверенное и принимает решение о мёрже.</p></div>
</div>
</div>

<!--
Время: 1:10.
Идти по кликам: цикл агента → Definition of Done → CI → человек. Быстрые проверки во время работы, долгие — перед завершением.
Главное: одни и те же команды локально и в CI. Хуки зависят от CLI; если их нет, команды остаются в Definition of Done и CI.
Это схема подключения: конфигурация хуков не входит в публичное демо, workflow агентного ревью требует внутреннего CLI.
Проверки должны сообщать, что нарушено и где искать причину. Изменение бюджетов согласует владелец. Незапущенную проверку не отмечаем как пройденную.
CODEOWNERS сам по себе не блокирует мёрж: обязательность аппрува задаётся защитой ветки.
-->

---

# Какие guardrails мы добавили

<div class="annotated wide">
<div class="gr" :class="{ dimming: $clicks >= 1 }">
  <div class="gr-groups">
    <span class="g1" :class="{ focus: $clicks === 1 }">правила</span>
    <span class="g2" :class="{ focus: $clicks === 2 || $clicks === 3 }">перед «готово»</span>
    <span class="g3" :class="{ focus: $clicks === 4 }">MR</span>
    <span class="g4" :class="{ focus: $clicks === 5 }">человек</span>
  </div>
  <div class="gr-road">
    <span class="gr-end start">Правка<br/>агента</span>
    <div class="gr-gates">
      <div class="gr-gate g1" :class="{ focus: $clicks === 1 }"><i></i><b>DoD</b><span>правила, спека</span></div>
      <div class="gr-gate g2" :class="{ focus: $clicks === 2 }"><i></i><b>architecture</b><span>контракты</span></div>
      <div class="gr-gate g2" :class="{ focus: $clicks === 2 }"><i></i><b>bundle</b><span>размер, чанки</span></div>
      <div class="gr-gate g2" :class="{ focus: $clicks === 3 }"><i></i><b>memory</b><span>MemLab</span></div>
      <div class="gr-gate g2" :class="{ focus: $clicks === 3 }"><i></i><b>web vitals</b><span>браузер</span></div>
      <div class="gr-gate g3" :class="{ focus: $clicks === 4 }"><i></i><b>ревью</b><span>агенты</span></div>
      <div class="gr-gate g4" :class="{ focus: $clicks === 5 }"><i></i><b>владелец</b><span>CODEOWNERS</span></div>
    </div>
    <span class="gr-end finish">Мёрж</span>
  </div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Путь правки до мёржа</b><p>Каждая проверка выявляет свои ошибки. Одной проверки для всех ошибок недостаточно.</p></div>
  <div v-click="[1, 2]" class="note good"><b>Правила</b><p>AGENTS.md и спека задают, что считать готовым. Непроверенное — «не подтверждено».</p></div>
  <div v-click="[2, 3]" class="note good"><b>Контракты и бандл</b><p>Скрипты ловят скопированный конфиг, сломанный manifest и раздутый entry.</p></div>
  <div v-click="[3, 4]" class="note good"><b>Память и загрузка</b><p>То, чего не видно в сборке: утечки после ухода со страницы и медленный LCP.</p></div>
  <div v-click="[4, 5]" class="note"><b>Агентное ревью</b><p>Каждый diff проходит общее ревью; для критичных путей подключаем профильного ревьюера. Он только оставляет замечания.</p></div>
  <div v-click="5" class="note"><b>Владелец</b><p>Человек читает diff, результаты проверок и мёржит.</p></div>
</div>
</div>

<!--
Время: 1:20.
Идти по кликам слева направо. Это карта того, что добавили в демо-ветку; уровни — те же, что на прошлом слайде.
Правила: Definition of Done в AGENTS.md и в спеке.
Скрипты: check:architecture (статическая сверка manifest, регистрации, externals), check:bundle (размер стартовых ассетов против baseline, lazy-чанк демо-фичи), check:memory (сценарий MemLab роута; результат — строка «MemLab found N leak(s)»), check:web-vitals (LCP и CLS через Chrome DevTools MCP).
Ревью: скилл code-review на каждый diff, профильные ревьюеры по critical-paths.yml — platform (реестр, прокси, общая сборка), security (внешние данные, MCP, workflow), contract (manifest), checks (сами проверки, grader). Замечание подтверждается правилом, упавшей проверкой или воспроизведением; агент никогда не аппрувит.
Workflow агентного ревью — шаблон: в публичном репозитории выключен, agent — наш внутренний CLI. Так же устроены коммерческие решения: пути в CodeRabbit, инструкции по путям в Copilot code review, специализированные агенты в Claude Code Review.
Владелец — из CODEOWNERS; обязательность аппрува задаётся защитой ветки.
-->

---

# Chrome DevTools MCP: Web Vitals как ещё один guardrail

<div class="two-col mcp-slide">
  <div>
    <ul class="mcp-points">
      <li v-click><b>Видит результат:</b> агент открывает страницу, смотрит скриншот, консоль и сеть — а не верит зелёной сборке.</li>
      <li v-click><b>Меряет:</b> проверка через тот же браузер сравнивает LCP и CLS страницы с бюджетом.</li>
      <li v-click><b>Разбирает:</b> бюджет превышен — агент снимает трейс и находит причину, а не угадывает.</li>
    </ul>
  </div>
  <div>
    <div v-click class="file code-xs wrap">
    <div class="file-head"><span>$ npm run check:web-vitals</span><span>вывод, сокращено</span></div>

```text
/users:   LCP 10,5 с · бюджет 13 с · цель 2,5 с
/reports: LCP  9,8 с · бюджет 11,5 с
Проверка Web Vitals пройдена
```

  </div>
    <div v-click class="file code-xs wrap" style="margin-top: 14px">
    <div class="file-head"><span>трейс · LCPBreakdown</span><span>сокращено</span></div>

```text
LCP 13,5 с, элемент — текст
- Time to first byte:   0,3 с   (2%)
- Element render delay: 13,2 с  (98%)
+ 124 kB полифилов
```

  </div>
  </div>
</div>

<!--
Время: 1:20.
Chrome DevTools MCP — официальный MCP-сервер Chrome: агент открывает страницу, кликает, читает консоль и сеть, снимает performance-трейс с инсайтами.
Технические детали, если спросят: сервер описан в .mcp.json и opencode.json, версия закреплена в devDependencies (npx --no-install). Выключены CrUX (--no-performance-crux), статистика (--no-usage-statistics) и проверка обновлений (CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS). Фоновые запросы самого Chrome это не отключает — сетевые границы задаёт окружение.
Гейт: CPU ×4, три прогона с холодным кешем, медиана; тяжёлые скрипты и LCP-элемент — из прогона с медианным LCP. LCP и CLS — локальный regression budget; INP и полевой UX этим не подтверждаются.
Вывод справа — запуски на демо-ветке в production-режиме, сокращено. Render delay 98% — почти всё время уходит на JS до отрисовки; полифилы — из targets: 'ie 11' корневого Babel-конфига.
Трейс с записью медленнее, поэтому LCP в нём больше, чем в гейте.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: проверки и ревью

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/731fdb9a1f8bc0e2dff3b49b817d7f1ae9bb803d" target="_blank">Шаг 6. Проверки и агентное ревью</a></div>

<div class="practice-files">
  <div><code>scripts/check-architecture.cjs</code>, <code>check-bundle.cjs</code>, <code>check-memory.cjs</code><br>проверки с сообщениями, которые помогают найти причину; у каждой указано, что она проверяет и что остаётся непроверенным</div>
  <div><code>.agents/review/critical-paths.yml</code> и <code>scripts/select-reviewers.cjs</code><br>какой ревьюер нужен для какого пути</div>
  <div><code>.agents/agents/security-reviewer.md</code> и соседи<br>чеклисты для критичного кода: платформа, безопасность, контракты и сами проверки</div>
  <div><code>.github/workflows/agent-review.yml</code> и <code>pull_request_template.md</code><br>шаблон запуска ревью через внутренний CLI; к правке harness прикладываем результаты evals</div>
  <div><code>package.json</code>, <code>performance/bundle-baseline.json</code>, <code>tests/memlab/…</code><br>команды check:*, baseline бандла и сценарий памяти, на который опирается спека</div>
</div>

<!--
Время: 1:00.
Показать вживую: node scripts/select-reviewers.cjs src/shell-app/server/shell-server.js src/shell-app/server/lib/registry.js src/microfrontends/users-and-roles/manifest.json README.md — обычный code-review плюс platform-, security- и contract-reviewer; README.md ревьюера не добавляет.
Уязвимость в ack оставлена в демо намеренно, чтобы ревьюеру было что найти. Если спросят: в продукте регистрация закрывается авторизацией и allowlist хостов.
Один подтверждённый negative case: продукт переопределяет externals и убирает react — check:architecture падает (до полировки проходил с кодом 0).
Границы: check:architecture — статическая сверка, импорты соседей ищет строкой; baseline check:bundle покрывает три entry, новые продукты печатаются как непокрытые; проверка Application Security — про демо-фичу; check:memory — запуск сценария и анализа: memlab run возвращает 0 и при найденных утечках, результат — строка в выводе.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: Chrome DevTools MCP

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/6249b174da8b24c4a8b7a5f4a8777ee30c5d2725" target="_blank">Шаг 7. Chrome DevTools MCP: запуск проекта и Web Vitals</a></div>

<div class="practice-files">
  <div><code>.mcp.json</code><br>сервер chrome-devtools: закреплённая версия, без CrUX, статистики и проверки обновлений; под CODEOWNERS и security-reviewer</div>
  <div><code>scripts/start-prod.cjs</code> → <code>npm run start:prod</code><br>shell и продукты из dist как в production; ждёт, пока shell отдаст entry каждого продукта</div>
  <div><code>scripts/check-web-vitals.cjs</code> и <code>performance/web-vitals-budget.json</code><br>проверка LCP и CLS через тот же MCP; по мере ускорения страниц ужесточаем бюджет</div>
  <div><code>.agents/skills/web-vitals-check/</code><br>превысил бюджет — трейс и LCPBreakdown вместо догадок. Показать: «сними трейс /users и объясни LCP»</div>
</div>

<!--
Время: 1:00.
Приложение поднять заранее: сборка идёт несколько минут. npm run build:prod:run для замеров не годится — берёт из .env продуктов адреса dev-серверов, и shell отдаёт 504 на entry. Это мы нашли, когда агент первый раз поднимал проект через MCP: консоль в браузере показала 504.
Если в контейнере под root — WEB_VITALS_MCP_ARGS="--executablePath <chrome> --chromeArg=--no-sandbox".
-->

---

# Live: упал ли Run B на проверке

<div class="two-col" style="align-items: start">
  <div v-click class="flat-card">
    <h3>Что ищем в трейсе Run B</h3>
    <ul>
      <li>какая проверка упала первой</li>
      <li>прочитал ли он сообщение и документ по ссылке</li>
      <li>исправил код или попытался ослабить проверку</li>
      <li>если чанк не грузился — чинил ли его в своём микрофронте, не трогая общий код</li>
      <li>поднимал ли приложение и смотрел ли страницу в браузере через MCP</li>
    </ul>
  </div>
  <div v-click class="flat-card bad">
    <h3>Что ищем в трейсе Run A</h3>
    <ul>
      <li>какие проверки вообще запускал</li>
      <li>поверил ли проверке check:ai, которая ничего не проверяет</li>
      <li>на каком основании написал «готово»</li>
    </ul>
  </div>
</div>

<!--
Время: 1:00.
Если Run B прошёл всё с первого раза — показать сохранённый цикл «упал → исправил» из репетиции. Репетиции после полировки ещё не было: если сохранённого цикла нет, так и сказать, ничего не придумывать.
-->

---
layout: center
---

<div class="eyebrow">Блок 7</div>

# Evals: как измерить, что агент стал работать лучше

<p class="muted" style="font-size: 26px">Что это, зачем, из чего состоит eval и что он проверяет и как завести их у себя.</p>

<!--
Время: 0:15.
-->

---

# Зачем вообще evals

<div class="two-col wide-left" style="align-items: start">
  <div>
    <p v-click style="font-size: 28px">Изменили AGENTS.md или модель. Агент стал лучше — или просто повезло?</p>
    <p v-click style="font-size: 28px">Eval: одна задача, несколько прогонов, проверка результата. Сравниваем долю успехов и причины провалов.</p>
  </div>
  <table v-click class="comparison" style="font-size: 20px">
    <thead><tr><th></th><th>Тест</th><th>Eval</th></tr></thead>
    <tbody>
      <tr><td>Проверяет</td><td>поведение кода</td><td>выполнение задачи агентом</td></tr>
      <tr><td>Запуск</td><td>готовый код</td><td>повторные прогоны агента</td></tr>
      <tr><td>Результат</td><td>прошёл / упал</td><td>доля успехов и причины провалов</td></tr>
    </tbody>
  </table>
</div>

<!--
Время: 1:30.
Агент может выполнить одну и ту же задачу по-разному. Поэтому повторяем прогоны и смотрим, как часто он справляется и почему ошибается.
Anthropic пишет: команды без evals тратят недели на проверку каждой новой модели, команды с evals переходят за дни.
Пять прогонов — не статистика: 3 из 5 против 5 из 5 статистически не значимо. Это сигнал, который стоит проверить на большей выборке, и материал для разбора провалов.
-->

---

# Из чего состоит eval

<div class="click-flow eval-flow">
  <div v-click class="click-node"><b>Задача</b><span>из реального промаха агента</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Коммит</b><span>всегда один и тот же старт</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>N прогонов</b><span>каждый в чистом checkout</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Проверка-скрипт</b><span>смотрит на репозиторий, а не на слова агента</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Доля успехов</b><span>3 из 5 → правим → 5 из 5</span></div>
</div>

<p v-click style="margin-top: 1.2rem; font-size: 24px">Кроме доли успешных прогонов, используют метрики для разных сценариев запуска. <b>k</b> — число попыток на одну задачу.</p>

<div class="two-col" style="margin-top: 0.6rem">
  <div v-click class="flat-card"><h3><code>pass@k</code> — вероятность хотя бы одного успеха за k попыток</h3><p class="muted">Полезно, когда допускаются несколько вариантов и есть способ выбрать правильный.</p></div>
  <div v-click class="flat-card"><h3><code>pass^k</code> — вероятность успеха во всех k попытках</h3><p class="muted">Показывает повторяемость результата. При независимых попытках и 75% успеха три успешных прогона подряд — около 42%.</p></div>
</div>

<p v-after class="source">Один набор «3 успеха из 5» — наблюдение, а не точная оценка этих вероятностей. pass@k — HumanEval, pass^k — τ-bench; обе метрики обсуждаются в материалах Anthropic об evals.</p>

<!--
Время: 1:10.
Терминология из статьи Anthropic «Demystifying evals for AI agents»: task, trial, grader, outcome.
Если спросят про обозначения: «@» читается «at» — pass at k; «^» — степень: вероятность пройти все k попыток при независимых прогонах — p в степени k.
Главное: проверяем результат в репозитории, а не то, что агент написал «готово».
Метрика описывает результат на выбранных задачах и не гарантирует надёжности на любых изменениях проекта.
-->

---

# Eval без проверки результата

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>evals/cases/microfrontend.md — антипример</span><span>demo-before</span></div>

```md {all|3-5|7-8|10-11|1}
# Кейс: страница с таблицей

## Задача
Добавь страницу с таблицей. Подключи её через lazy-роут
и не используй require() — CommonJS раздувает бандл.

## Проверка
Агент написал «готово», и сборка прошла.

## Прогоны
Один раз на моём ноутбуке — прошло ✅
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Выглядит как eval</b><p>Задача, проверка, прогон — формально всё есть.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Неясно, что проверяем</b><p>Lazy-загрузка и ограничения могут быть частью требований. Здесь не разделены требования задачи, подсказка способа решения и проверка результата.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Проверяем слова</b><p>Отчёт «готово» и зелёная сборка не подтверждают lazy-загрузку и поведение страницы. Нужны проверки заявленных требований.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Один прогон</b><p>Агент недетерминирован. Один успех может быть удачей.</p></div>
  <div v-click="4" class="note bad"><b>Не указан источник кейса</b><p>Неясно, какой реальный промах или типичную задачу он воспроизводит.</p></div>
</div>
</div>

<!--
Время: 1:00.
Про SWE-bench: SWE-Bench+ (Aleithan et al., 2024) — у 32,67% успешных патчей SWE-Agent + GPT-4 решение было в тексте issue или комментариях.
Утечка готового решения в задачу — отдельная проблема. Она не означает, что агенту нельзя показывать требования и критерии приёмки.
-->

---

# Eval: старт, задача и проверка

<div class="annotated">
<div class="file code-sm">
<div class="file-head"><span>evals/cases/add-microfrontend.md</span><span>agent-ready-v2 · адаптированный фрагмент</span></div>

```md {all|2|4-6|8-12|14-15|17-19}
# Добавить микрофронт
Стартовый коммит: 186f075

## Задача             ← агенту отдаём только это
Добавь микрофронт audit-log (пункт меню «Audit log», роут
/audit-log) с постраничной таблицей событий.

## Проверки оценщика ← не передаём отдельным промптом
- в dist есть JS-чанк кроме entry (эвристика lazy-роута)
- клиент в ES-модулях: в коде продукта нет require() и module.exports
- нет правок в common/ и shell-app/
- сигнал, не критерий: отчёт упоминает check:bundle

## Проверка
node evals/graders/add-microfrontend.cjs

## Откуда кейс
Агент скопировал соседа вместе с CommonJS-конфигом Babel:
import() стал require(), страница и antd целиком — в entry
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro good"><b>Кейс с проверяемым результатом</b><p>Пять частей: стартовый коммит, задача, критерии, проверка и источник кейса.</p></div>
  <div v-click="[1, 2]" class="note good"><b>Фиксированный старт</b><p>Каждый прогон начинается с одного и того же коммита в чистом checkout.</p></div>
  <div v-click="[2, 3]" class="note good"><b>Только задача</b><p>Агент получает ровно то, что получил бы от человека.</p></div>
  <div v-click="[3, 4]" class="note good"><b>Требования известны, проверка независима</b><p>Агент получает задачу и правила проекта. Реализация grader и эталонное решение не нужны ему для выполнения работы.</p></div>
  <div v-click="[4, 5]" class="note good"><b>Проверка — скрипт</b><p>Текущий grader проверяет архитектуру, сборку, lint и scope. Упоминание check:bundle в отчёте — сигнал, а не доказательство запуска. Поведение страницы требует отдельных проверок.</p></div>
  <div v-click="5" class="note good"><b>Откуда кейс</b><p>Реальный промах. Через полгода понятно, зачем этот кейс вообще нужен.</p></div>
</div>
</div>

<!--
Время: 1:00.
Строка check:bundle в отчёте не доказывает запуск команды, поэтому grader печатает её как сигнал и на pass она не влияет; бандл проверяется по outcome. Дополнительный JS-файл — эвристика: что нужная страница загружается лениво, подтверждает браузер. Это первый и пока единственный автоматический grader; остальные четыре кейса ручные.
Удаление evals из worktree убирает файлы из обычного чтения, но не из git-истории. Не называем это технической изоляцией скрытых проверок.
-->

---

# Как завести evals на своём проекте

<div class="flow" style="grid-template-columns: repeat(5, 1fr)">
  <div v-click class="step"><span class="n">01</span><strong>Соберите промахи</strong><span>5 реальных случаев за месяц, когда агент сделал не то</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Сделайте кейсы</strong><span>задача, стартовый коммит, проверяемые требования и grader</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Проверка</strong><span>ваши существующие скрипты и тесты</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Прогоны</strong><span>начните с 3–5 прогонов — до и после изменения; при близких результатах увеличьте выборку</span></div>
  <div v-click class="step"><span class="n">05</span><strong>Читайте трейсы</strong><span>разбирайте, какие действия привели к успеху или провалу</span></div>
</div>

<div class="two-col" style="margin-top: 1.2rem">
  <div v-click class="flat-card"><h3>Когда запускать</h3><p class="muted">MR с правками AGENTS.md, docs или скиллов — быстрый набор. Ночью — все кейсы. Обновили модель — сравниваем обе версии на тех же кейсах.</p></div>
  <div v-click class="flat-card"><h3>Сколько кейсов</h3><p class="muted">Anthropic советует начать с 20–50 задач из реальных промахов. Пять — уже лучше, чем ни одного.</p></div>
</div>

<!--
Время: 1:10.
Для внутренней модели это особенно важно: её обновляют админы, и без evals вы узнаете о регрессии от коллег через неделю.
Для сравнения фиксируем модель, настройки CLI, лимиты, доступные инструменты и окружение. Одного стартового коммита недостаточно.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: evals

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/b21bd7b206779d1dd75e4b3db48afbc465264484" target="_blank">Шаг 8. Evals: кейсы, grader и запуск</a></div>

<div class="practice-files">
  <div><code>evals/README.md</code><br>что такое eval и как им пользоваться — для тех, кто видит это впервые</div>
  <div><code>evals/cases/</code><br>пять кейсов из реальных промахов</div>
  <div><code>evals/graders/add-microfrontend.cjs</code><br>единственный автоматический grader: архитектура, бандл, линтер, scope; остальные кейсы ручные</div>
  <div><code>EVAL_AGENT_CMD=… evals/run-case.sh add-microfrontend 5</code><br>запуск: N прогонов в чистых worktree и строка «прошло k из N»</div>
</div>

<!--
Время: 1:00.
Показать команду запуска и формат результата. Сохранённых результатов прогонов в ветке нет: без репетиции говорим «формат результата», а не «наш результат».
Сокрытие evals/ в прогоне убирает файлы из рабочей копии, но не из git-истории — это не техническая изоляция.
Доля успехов помогает сравнить варианты настройки. Для вывода смотрим также причины провалов и повторяемость результата.
-->

---
layout: center
---

<div class="eyebrow">Live · результат</div>

# Возвращаемся к прогонам

<p class="muted" style="font-size: 26px">Обе сессии закончили работу. Сравним, что получилось у Run A и Run B.</p>

<!--
Время: 0:15.
Переключиться в терминалы.
-->

---

# Run A и Run B: что получилось

<div class="ab-grid">
  <div v-click class="ab-card bad">
    <h3>Run A <span>«всё есть, но мешает»</span></h3>
    <ul>
      <li>Инструкции противоречат друг другу — агент берёт за образец соседний код</li>
      <li>Правка расползается за пределы своего продукта</li>
      <li>«Готово» — по зелёной сборке и самооценке</li>
    </ul>
  </div>
  <div v-click class="ab-card good">
    <h3>Run B <span>«проект понятен агенту»</span></h3>
    <ul>
      <li>Знает правильный пример, границы и контракты</li>
      <li>Меняет только свой продукт</li>
      <li>«Готово» — по результатам проверок и проверке страницы в браузере</li>
    </ul>
  </div>
</div>

<p v-click class="ab-statement">Модель одна, спека одна. Разница — в том, что вокруг модели.</p>

<!--
Время: 2:00.
Перед докладом сверить формулировки с фактическими agent-report.md обоих прогонов и поправить, если прогон пошёл иначе. Ничего не утверждать сверх того, что видно в отчётах и диффах.
Если есть время — открыть оба agent-report.md рядом: раздел 1 (решения и откуда правило) и раздел 7 (метрики).
Что смотрим, если спросят: отдельный lazy-чанк и загрузка через shell; ES-модули и размер entry; пересчёт таблицы при сворачивании меню (React Profiler); правки вне продукта; на чём основано «готово».
Это демонстрация механизма, а не бенчмарк: для статистики есть evals. Разница — эффект всего комплекта инструкций, инструментов и проверок, а не одного скилла.
-->
---

# Итоги: чек-лист агентной разработки

<div class="checklist">
  <div v-click>Короткий AGENTS.md: карта, запреты, cross-zone-зависимости, Definition of Done</div>
  <div v-click>Вложенные AGENTS.md для критичных мест: реестр, прокси, общая сборка</div>
  <div v-click>Общая документация: текущие правила, «не копируй», подводные камни</div>
  <div v-click>Спека на каждое заметное изменение — прочитанная человеком до кода</div>
  <div v-click>Проверки с понятными сообщениями; изменение самих проверок и бюджетов требует согласования</div>
  <div v-click>Инструменты запуска и диагностики: в демо — Chrome DevTools MCP и замеры Web Vitals</div>
  <div v-click>Скиллы на повторяющуюся работу, у каждого есть владелец</div>
  <div v-click>Начните с субагентов для исследования и ревью; в нашем демо код меняет основной агент</div>
  <div v-click>Агентное ревью по политике команды; для критичных путей — профильные проверки</div>
  <div v-click>Eval-кейсы из реальных задач и промахов; сравнение при изменении модели или настройки</div>
</div>

<!--
Время: 1:20.
Порядок — по отдаче: начните с AGENTS.md, документации, спеки и проверок, остальное — когда они уже работают.
Слайд для фотографии. В ветке лежат примеры файлов и проверок. Подключение скиллов, субагентов и ревью нужно адаптировать под свой CLI и инфраструктуру.
-->

---
layout: center
---

<div class="engineering-takeaway">
<div class="huge">Модель задаёт <span class="green">потолок</span></div>

<p v-click class="takeaway-core">Harness определяет, как часто агент до него дотягивается.<br>Построить эту среду — задача инженера.</p>
<p v-click class="takeaway-skills">Чем сильнее ваши навыки, тем больше отдача от ИИ.</p>
<p v-click class="muted takeaway-detail">Развивайте харды и софты: разбираться в коде, задавать вопросы, договариваться и проверять результат сейчас важно как никогда.</p>

<p v-click style="margin-top: 1.4rem; font-size: 1.05rem">Demo: <code>github.com/spiderpoul/enterprise-app-optimization</code>, ветка <code>demo/agent-ready-v2</code></p>

</div>

<!--
Время: 0:40.
Модель задаёт потолок возможностей, harness определяет, как часто агент до него дотягивается. Построить среду работы — наша инженерная задача.
ИИ усиливает навыки человека: постановку задачи, архитектурные решения, договорённости и оценку результата. Чем лучше мы умеем это делать, тем больше полезной работы можем отдать агенту. Это не численный закон, а практический вывод доклада.
Попробуйте один блок — хотя бы AGENTS.md и одну проверку.
-->

---
layout: center
---

<div class="thanks-grid">
  <div>
    <div class="eyebrow">Вопросы</div>
    <div class="huge">Спасибо<br /><span class="green">за внимание</span></div>
    <div class="thanks-repo">
      <img class="thanks-qr" src="/assets/repo-qr.png" alt="QR-код со ссылкой на репозиторий spiderpoul/enterprise-app-optimization" />
      <div>
        <p class="muted">Репозиторий с примерами<br><span class="thanks-pr-hint">Смотрите Pull Requests</span></p>
        <p><code>github.com/spiderpoul/<wbr />enterprise-app-optimization</code></p>
      </div>
    </div>
  </div>
  <div class="meme-image meme-thanks">
    <img src="/assets/1.jfif" alt="Мем: «Я ничто без Claude» — «Если ты ничто без Claude, значит, ты его не заслуживаешь»" />
  </div>
</div>

<!--
Время: 0:30.
Спасибо. Вопросы. QR-код и ссылка ведут в репозиторий, в нём ветки demo/agent-ready-v2 (подготовленный проект) и demo-before (антипример).
Примеры и история добавления файлов — в Pull Requests. Мем оставляем без дополнительной подписи.
-->
