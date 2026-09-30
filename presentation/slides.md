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

# Напишите в чат: +, ++ или +++

<div class="poll plus">
  <div v-click><span>+</span>На работе облачные агенты запрещены или сильно ограничены</div>
  <div v-click><span>++</span>…и при этом в контуре компании есть своя внутренняя модель</div>
  <div v-click><span>+++</span>…и вы реально пишете ей код в рабочем репозитории — не вопросы и не тесты</div>
</div>

<!--
Время: 1:20.
Руки не поднимаем: попросить написать в чат столько плюсов, сколько пунктов про вас. Показать все три пункта, подождать чат.
Если «+++» мало — это и есть тема доклада. Если много — отлично, спросить после доклада, как они это устроили.
-->

---

# Какие слышу отзывы по внутренним моделям

<div class="grid-4">
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Не тянет, с Claude не сравнить»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Галлюцинирует: может напридумывать своего</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Для тестиков сойдёт, но код писать не доверю</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">Быстрее самому написать, чем пол часа объяснять</h3></div>
</div>

<p v-click style="margin-top: 1.7rem; font-size: 29px">Но чаще всего дело не в слабости модели. Мы просто не объяснили ей проект — и единственное что остаётся делать это угадывать.</p>

<!--
Время: 1:00.
Все четыре фразы я говорил сам. Дальше покажу, откуда берутся «галлюцинации» в большом проекте
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
      <p class="muted">Команды, требования и подходы менялись — в коде остались следы всех эпох.</p>
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

# Внутренние модели слабее, но уже ненамного

<div class="benchmark-strip">
  <div v-click class="benchmark"><b>45</b><span>GLM-5.3</span></div>
  <div v-click class="benchmark"><b>45</b><span>Claude Opus 5<br/>medium effort</span></div>
  <div v-click class="benchmark"><b>40</b><span>DeepSeek V4.1 Flash<br/>reasoning max</span></div>
  <div v-click class="benchmark"><b>38</b><span>Claude Sonnet 5<br/>max effort</span></div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 27px">Открытые GLM, Kimi или DeepSeek можно поднять на своей инфраструктуре и они вполне достойно пишут код.
Разрыв есть, но главное, что мешает, — модель ничего не знает о вашем проекте.</p>

<p v-after class="source">Artificial Analysis Intelligence Index v4.3, сентябрь 2026. Лидер индекса — Claude Opus 5.5 (max), 58 баллов. Это общий уровень модели; проверять всё равно нужно на своём репозитории.</p>

<!--
Время: 1:00.
Числа — баллы индекса Artificial Analysis v4.3, не проценты; не путать с числами до пересчёта шкалы. Я не утверждаю, что внутренняя модель «победила Claude».
Opus 5 на medium взят как типичная повседневная настройка; на max у Opus 5 — 51, у Opus 5.5 — 58. Лучшие открытые модели — GLM-5.3 и Kimi K3, около 44–45.
Тезис скромнее: её уже достаточно для реальной разработки, если не заставлять её угадывать.
-->

---

# Почему даже умная модель может ошибиться

<div class="grid-4 reasons">
  <div v-click class="flat-card warn">
    <h3>Не знает, какой пример правильный</h3>
    <p class="muted">Все продукты собираются и работают. Но они наследуют корневой Babel-конфиг с <code>modules: 'cjs'</code>: скопируешь соседа — entry вырастет на 2,5&nbsp;МБ, а <code>import()</code> не создаст чанк.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Не видит неявных контрактов</h3>
    <p class="muted">На id и routePath из manifest.json завязаны сохранённые ссылки пользователей и селекторы MemLab. Из кода микрофронта этого не видно.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Не знает, кого ещё заденет правка</h3>
    <p class="muted">Одна строка в <code>common/webpack</code> меняет сборку всех 25 продуктов. По самому файлу этого не понять.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Не знает, когда работа закончена</h3>
    <p class="muted">Сборка зелёная, тесты проходят — а LCP страницы 11 секунд. Это видно только в браузере, на запущенном приложении.</p>
  </div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 26px">Это не галлюцинации: модель достраивает недостающее по коду, который лежит рядом. Всё, что мы добавляем в проект, чтобы ей не приходилось угадывать, дальше называю <b class="green">harness</b>: AGENTS.md, документация, спеки, скиллы, проверки и evals.</p>

<!--
Время: 1:30.
Четыре причины — по кликам, для каждой один пример из нашего репозитория. Код — архив решений за девять лет, и хорошие решения в нём лежат рядом с плохими.
Слабая модель угадывает хуже сильной, поэтому ей особенно нужно, чтобы угадывать было нечего.
Дальше каждый блок доклада закрывает одну из этих дыр, и после каждого я переключаюсь в репозиторий и показываю коммит. В конце вернёмся к этим четырём причинам и сравним прогоны по ним.
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
  <div class="hx-ring hx-inner"><span class="hx-label">harness — здесь складывается поведение агента</span></div>
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
  <div v-if="$clicks < 1" class="note intro"><b>Что вокруг модели</b><p>Схема из документа Google о новом SDLC, упрощённая. В центре — модель, вокруг — всё, что даём ей мы. Пройдём по слоям.</p></div>
  <div v-click="[1, 2]" class="note hx-note-core"><b>LLM — двигатель</b><p>Рассуждает и выбирает следующий шаг. Внутреннюю модель мы не выбираем: её дали, и это данность.</p></div>
  <div v-click="[2, 3]" class="note good"><b>Instructions / Rule files</b><p>Что агент читает всегда или по ссылке: AGENTS.md, документация, спека. Блоки 1–3.</p></div>
  <div v-click="[3, 4]" class="note good"><b>Tools &amp; MCP</b><p>Чем агент действует: скрипт вместо чтения лога целиком, браузер через Chrome DevTools MCP. Блоки 4 и 6.</p></div>
  <div v-click="[4, 5]" class="note good"><b>Orchestration</b><p>Кто и в каком порядке работает: скиллы — процедуры из шагов, субагенты — отдельный контекст для шумной работы. Блоки 4–5.</p></div>
  <div v-click="[5, 6]" class="note good"><b>Guardrails &amp; Hooks</b><p>Что не даёт объявить «готово» раньше времени: quality gates и агентное ревью. Блок 6.</p></div>
  <div v-click="[6, 7]" class="note"><b>Eval &amp; Testing</b><p>Как понять, что правка harness помогла, а не показалось: одна задача, N прогонов, доля успехов. Блок 7.</p></div>
  <div v-click="[7, 8]" class="note intro"><b>Платформа</b><p>CLI и IDE, рантайм, сессии, логи и трейсы. Это даёт платформенная команда; сегодня не трогаем.</p></div>
  <div v-click="8" class="note good"><b>10% модель, 90% harness</b><p>«The model is the engine. The harness is the car, the road, and the traffic laws». Почти всё, что решает успех, — в наших руках.</p></div>
</div>
<p class="source hx-source">Google, «The New SDLC with Vibe Coding» (A. Osmani, S. Saboo, S. Kartakis), май 2026, рис. 7 — схема упрощена. 10/90 — метафора авторов, а не измерение.</p>
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
    <p>«Implement <code>openspec/changes/application-security/spec.md</code>»</p>
    <p class="muted">Спека, написанная в спешке, и AI-сетап, какой бывает в жизни: AGENTS.md из общих (местами вредных) советов, зоопарк скиллов, «команда агентов», ревью-бот и проверка, которая ничего не проверяет.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B · <code>demo/agent-ready-v2</code></h3>
    <p>«Implement <code>openspec/changes/add-application-security/</code>»</p>
    <p class="muted">Тот же код плюс всё, что покажу дальше.</p>
  </div>
</div>

<p v-click class="source">Демо-репозиторий — упрощённая копия продукта: два микрофронта вместо 25, но те же ловушки. Оба прогона получают спеку, разница только в её качестве.</p>

<div v-click class="flat-card warn" style="margin-top: 1rem; padding: 18px 26px">
  <h3 style="font-size: 23px; margin-bottom: 6px">Оба промпта заканчиваются одинаково</h3>
  <p style="font-size: 20px">«When you are done, write a short report in Russian to <code>agent-report.md</code>: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.»</p>
</div>

<!--
Время: 1:30.
Переключиться в терминал, запустить обе сессии на одной внутренней модели с одинаковыми настройками, вернуться к слайдам.
Run A — не пустой репозиторий. В ветке demo-before «всё есть», но сделано так, как делать не надо. Все антипримеры из доклада взяты оттуда.
Оба получают спеку: Run A — плохую из demo-before (разберём её в блоке про спеки), Run B — хорошую. Так мы сравниваем подготовку проекта, а не длину промпта.
Перед стартом evals/ скрыт в обоих worktree: в demo-before кейс прямо подсказывает про CommonJS.
Отчёт в конце — одинаковая просьба для обоих: в финале сравним и код, и рассуждения.
Если live-модель недоступна — дальше используем сохранённые трейсы и диффы репетиции.
Дальше после каждого блока переключаемся в репозиторий и смотрим, каким коммитом мы это добавили.
-->

---
layout: center
---

<div class="eyebrow">Блок 1</div>

# AGENTS.md: первое, что читает агент

<p class="muted" style="font-size: 26px">Разберём файл из репозитория по частям и посмотрим, как делать не надо.</p>

<!--
Время: 0:15.
Файлы в демо написаны по-русски, чтобы их было удобно читать со сцены. В рабочем проекте это компромисс:
английский дешевле по токенам и модели следуют ему стабильнее, а русский удобнее команде, которая читает ту же документацию.
Мы держим AGENTS.md и скиллы на английском, а docs — на языке команды.
-->

---

# <code>AGENTS.md</code>: карта, источник истины, запреты

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>AGENTS.md</span><span>demo/agent-ready-v2</span></div>

```md {all|1-2|4-8|10-13|15-19}
# Enterprise App Optimization
Nx-монорепа: shell и React-микрофронты, каждый деплоится отдельно. Node 22+.

## Где что лежит
- Продукт → `src/microfrontends/<name>/` (client, server, manifest.json)
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
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Что попадает в каждую задачу</b><p>AGENTS.md агент читает всегда, поэтому здесь только то, что нужно почти в любой задаче. Разберём по частям.</p></div>
  <div v-click="[1, 2]" class="note"><b>Одна строка о проекте</b><p>Никаких «ты опытный разработчик»: роль ничего не говорит модели о нашем коде.</p></div>
  <div v-click="[2, 3]" class="note"><b>Карта вместо пересказа</b><p>Только пути и куда идти за подробностями. Архитектура живёт в docs, поэтому AGENTS.md не разрастается. Вложенные AGENTS.md упомянуты прямо здесь.</p></div>
  <div v-click="[3, 4]" class="note"><b>Главная строка для legacy</b><p>Что делать, когда соседний код спорит с документацией. Без неё модель скопирует ближайший рабочий пример.</p></div>
  <div v-click="4" class="note"><b>Конкретные запреты</b><p>Четыре ошибки, которые у нас дорого обходятся. Конкретный запрет слабая модель выполняет, а «пиши качественно» — нет.</p></div>
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
| `common/webpack/createMicrofront…` | сборку всех 25 продуктов сразу | architecture, bundle |
| `id` или `routePath` в manifest.json | меню, сохранённые ссылки, MemLab-селекторы | architecture |
| `shell-app/server/lib/*` | загрузку всех продуктов сразу | smoke всех продуктов |
| `shell-app/client/shared/*` | все страницы, которые его импортируют | memory для каждой |
| таблицу или список с пагинацией | риск утечки DOM после ухода со страницы | memory для роута |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Команды

- architecture → `npm run check:architecture` · bundle → `npm run check:bundle`
- memory → `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js`
- web vitals → `npm run start:prod -- --build`, затем `WEB_VITALS_BASE_URL=http://localhost:4300 npm run check:web-vitals -- <роут>`
- всё сразу → `npm run check` (architecture + lint + build)

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Definition of Done

Запусти проверки из активной спеки; без спеки — `npm run check`. В отчёте: команды, результаты, что не проверил и почему.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 4 }">

## Сначала спроси владельца из CODEOWNERS

общая зависимость · `id`, `routePath`, `entryPath`, `api.prefix` в manifest · `common/` · `shell-app/server/`

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Вторая половина файла</b><p>Отвечает на два вопроса: на какие ещё зоны влияет правка и как доказать, что работа закончена.</p></div>
  <div v-click="[1, 2]" class="note"><b>Cross-zone-зависимости</b><p>Самое полезное, что мы добавили. Агент правит один файл и сразу видит, на что ещё это влияет и чем это проверить. В продукте такие таблицы есть и в корне, и в документации каждой области.</p></div>
  <div v-click="[2, 3]" class="note"><b>Точные команды</b><p>Не «проверь память», а готовая команда с переменной окружения. Слабая модель не угадает, что MemLab и замеру Web Vitals нужен адрес поднятого приложения.</p></div>
  <div v-click="[3, 4]" class="note"><b>Definition of Done — команды и отчёт</b><p>Не «убедись, что работает», а проверки из спеки и честный список того, что не проверено.</p></div>
  <div v-click="4" class="note"><b>Когда остановиться и спросить</b><p>Три уровня: «никогда», «сначала спроси», всё остальное можно. Без stop-условий слабая модель героически доводит опасную правку до конца.</p></div>
</div>
</div>

<!--
Время: 1:20.
Таблица cross-zone — ответ на главный страх большого проекта: правка в общем коде ломает соседние команды.
Для опасных мест есть вложенные AGENTS.md (shell-app/server, common) — покажу их в коммите.
Файл показан как превью Markdown, чтобы таблица читалась со сцены; в репозитории это обычный AGENTS.md. Строку web vitals добавляет шаг 7.
-->

---

# Как не надо: AGENTS.md, который мешает

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
  <div v-click="[1, 2]" class="note bad"><b>Роль и капслок</b><p>Ноль информации о проекте. Капслок и «ОЧЕНЬ» только размывают действительно важные правила.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Правила спорят</b><p>«Используй lazy» и «импортируй страницы сразу» в одном файле. Модель выберет то, что подтверждает соседний код.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Вредный совет</b><p><code>require()</code> в компоненте ничего не откладывает: webpack кладёт библиотеку в тот же бандл, причём целиком — CommonJS не tree-shake’ится. У нас это +2,5&nbsp;МБ в entry.</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Разрешение ломать общий код</b><p>Одна строка — и агент правит common/, от которого зависят все продукты.</p></div>
  <div v-click="5" class="note bad"><b>Ложный Definition of Done</b><p>check:ai печатает «пройдено» и ничего не проверяет, а одобрение бота считается готовностью.</p></div>
</div>
</div>

<p v-click style="margin-top: 0.8rem; font-size: 23px">Простой тест: если строку можно вставить в AGENTS.md любого другого проекта, в вашем AGENTS.md ей не место.</p>

<!--
Время: 1:20.
Anthropic в рекомендациях по CLAUDE.md советует для каждой строки спрашивать: «Если её убрать, агент ошибётся?» Если нет — убираем.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы изменили: AGENTS.md

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/351ce39b72ab6ac9c33c9fb620d6e5c899bd6e8e" target="_blank">Шаг 1. AGENTS.md: карта проекта, запреты и cross-zone-зависимости</a></div>

<div class="practice-files">
  <div><code>AGENTS.md</code><br>карта, источник истины, запреты, таблица cross-zone, Definition of Done</div>
  <div><code>src/shell-app/server/AGENTS.md</code><br>вложенный файл для реестра и прокси: что уже ломалось и как это проверить</div>
  <div><code>src/microfrontends/common/AGENTS.md</code><br>вложенный файл для общей сборки: какие правки задевают все 25 продуктов</div>
  <div><span class="muted">Рассказать</span><br>вложенный AGENTS.md появился после инцидента: удалённый микрофронт жил в сохранённом реестре, и не грузился ни один продукт</div>
</div>

<!--
Время: 1:30.
Открыть коммит на GitHub или в IDE. Пройти три файла, для каждого — одна фраза.
Показать, что корневой файл короткий, а подробности — во вложенных. Не каждый CLI подхватывает вложенные файлы сам, поэтому корневой AGENTS.md перечисляет их явно.
Историю с реестром рассказать подробно: это коммит 64f408a «drop stale microfrontends and isolate failed entries». Теперь в файле записано, как устроен реестр и почему нельзя отключать TTL.
Команды check:*, на которые ссылается AGENTS.md, появятся в шаге 6.
Формат «что поменял → что сломается → как это проявится» и есть самое ценное во вложенных файлах.
-->

---

# Live: что агенты прочитали первым

<div class="two-col" style="align-items: start">
  <div v-click class="flat-card bad">
    <h3>Run A</h3>
    <p class="muted">Смотрим в трейсе: послушался ли вредных советов из AGENTS.md, какой скилл взял, утащил ли хук с утечкой по совету из старой документации.</p>
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

<p class="muted" style="font-size: 26px">Посмотрим на фрагмент нашей документации и сравним плохой и хороший абзац.</p>

<!--
Время: 0:15.
-->

---

# Одна документация для людей и агента

<div class="annotated wide">
<div class="file md-view">
<div class="file-head"><span>docs/performance.md</span><span>фрагмент · превью</span></div>
<div class="md-body">

# Производительность фронтенда

<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

Владелец: @perf-guild · Проверено: 2026-09 · Проверки: `npm run check:bundle`, `npm run check:web-vitals`

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Как сейчас правильно

1. Страницу продукта подключай через lazy-роут: `React.lazy` + `Suspense` в элементе роута.
2. Клиентский код — только ES-модули: `import`/`export` и свой `client/babel.config.cjs` с `modules: false`.
3. Кто создал observer, таймер или подписку, тот и снимает их в cleanup эффекта.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Не копируй: код работает, но так делать нельзя

| Что | Где встретишь | Почему нельзя |
|---|---|---|
| CommonJS: `require()`, `modules: 'cjs'` | корневой `babel.config.cjs` | +2,5 МБ в entry, `import()` без чанка |
| статический `import` страницы | `users-and-roles/client/index` | код страницы в стартовом бандле |
| тяжёлый расчёт прямо в рендере | визард React Perf, HeavyBlock | ~150 мс блокировки на каждый ввод |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 4 }">

## Подводные камни

- CommonJS не видно ни в сборке, ни в тестах: страница работает, а entry users-and-roles весит 8,4 МБ вместо 5,9 — из `require()` webpack не вырезает неиспользуемый код, и antd с иконками едут целиком. Ловит `npm run check:bundle`.
- Тяжёлый расчёт в рендере не выглядит ошибкой: код короткий и понятный. А в фильтре визарда каждое нажатие клавиши блокирует UI на ~150 мс. Видно только в React Profiler или трейсе.

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Не отдельная дока для агента</b><p>Это обычная документация команды — её читают и люди, и агент. Мы только требуем четыре раздела: как правильно, что не копировать, подводные камни и как проверить.</p></div>
  <div v-click="[1, 2]" class="note"><b>Владелец и дата</b><p>Документ без владельца протухает первым. Дата подсказывает агенту и человеку, насколько ему верить.</p></div>
  <div v-click="[2, 3]" class="note"><b>Как правильно — шагами</b><p>Lazy-роут, только ES-модули, cleanup эффектов. Каждый шаг можно проверить командой.</p></div>
  <div v-click="[3, 4]" class="note"><b>Что не копировать</b><p>Человек помнит, что корневой Babel собирает в CommonJS «со времён IE11». Агент видит только рабочий код — поэтому плохие примеры называем явно: где лежат и чем плохи.</p></div>
  <div v-click="4" class="note"><b>Что ломается тихо</b><p>Формат: что сделал → что увидишь → чем поймать. Цифры — из настоящей сборки. У Run A вместо этого старая документация, которая уверенно советует собирать в CommonJS ради IE11.</p></div>
</div>
</div>

<!--
Время: 1:40.
Отдельной документации «для агента» у нас нет: docs/ — общая, её читают и люди, и агент. Меняется только то, как она написана:
явно называет плохие примеры и тихие поломки. Новичку в команде это помогает ровно так же, как модели.
8,4 МБ против 5,9 МБ — production-сборка users-and-roles с корневым Babel (CommonJS) и с modules: false; замер на демо-ветке.
-->

---

# Один и тот же совет — устаревший и актуальный

<div class="two-col">
  <div v-click class="flat-card bad">
    <h3>Так документация вредит</h3>
    <p>«Оптимизируй всё через <code>useMemo</code> и <code>useCallback</code>: колонки, обработчики, отфильтрованные данные, даже простые строки. Так компоненты не перерисовываются лишний раз.»</p>
    <p class="muted"><code>docs/architecture.md</code> в demo-before: март 2021, без владельца и без единой проверки. Модель и так знает этот совет из статей — документ только закрепляет его. Именно его читает Run A.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Так работает</h3>
    <p>«Замеряй конкретное действие, а не мемоизируй всё подряд. В фильтре визарда React Perf <code>HeavyBlock</code> пересчитывается на каждый ввод — ~150&nbsp;мс блокировки. Видно в React Profiler или в трейсе. Мемоизация и debounce — варианты решения, а не правило.»</p>
  </div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 26px">Правило для ревью документации: у документа есть владелец и дата проверки, а в абзаце — путь к файлу, число или команда, которой это проверить.</p>

<!--
Время: 1:00.
Плохой совет общий: его можно вставить в документацию любого React-проекта, и модель знает его без нас. Хороший — про наш код: где, сколько и чем проверить.
Справа — «Рендер React» и «Не копируй» из docs/performance.md демо-ветки.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: документацию

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/35941176db093b350546cc37eda251b50470a347" target="_blank">Шаг 2. Документация: как правильно, что не копировать, подводные камни</a></div>

<div class="practice-files">
  <div><code>docs/architecture/microfrontends.md</code><br>контракт, «не копируй», подводные камни, рецепт lazy-чанков через shell</div>
  <div><code>docs/architecture/frontend.md</code><br>правила рендера, жизненного цикла и lazy-загрузки</div>
  <div><code>docs/performance.md</code><br>как правильно, что не копировать (CommonJS, HeavyBlock), подводные камни — разобрали на слайде</div>
  <div><span class="muted">Показать</span><br>раздел «Lazy-чанки через shell» — обход проверили руками на users-and-roles, а в ветке оставили только описание</div>
</div>

<!--
Время: 1:00.
Смотрите: «Не копируй» с номерами PR. Если агент полезет в историю и найдёт эти PR, документация заранее говорит, что от этих подходов отказались.
-->

---
layout: center
---

<div class="eyebrow">Блок 3</div>

# Спецификация: договориться о задаче до кода

<p class="muted" style="font-size: 26px">Как внедрить spec-driven development (SDD) в legacy, какой должна быть спека, хороший и плохой пример.</p>

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
Критика SDD справедлива: на маленькой задаче это кувалда. Поэтому спека у нас — на заметное изменение, а не на каждую правку.
-->

---

# Какой должна быть спека

<div class="two-col">
  <div>
    <div v-click class="flat-card"><h3>1 · Поведение, а не реализация</h3><p class="muted">Что увидит пользователь. Как — решает агент в рамках документации.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>2 · Сценарии WHEN / THEN</h3><p class="muted">Каждый можно проверить руками или тестом.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>3 · Scope и разрешения</h3><p class="muted">Что не трогаем и что можно поменять, если упёрлись: например, конфиг своего микрофронта.</p></div>
  </div>
  <div>
    <div v-click class="flat-card"><h3>4 · Контракты legacy</h3><p class="muted">id, роуты, API, которые нельзя сломать. Их не видно в коде соседей.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>5 · «Готово» — это команды</h3><p class="muted">Конкретные проверки, включая сценарий для этого роута.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>6 · Прочитана человеком</h3><p class="muted">Вопросы закрыты до кода. Размер — один-два экрана, больше — режем изменение.</p></div>
  </div>
</div>

<!--
Время: 1:00.
Это совпадает с тем, что советуют OpenSpec (сценарии WHEN/THEN), Kiro (требования в нотации EARS: WHEN … THE SYSTEM SHALL …)
и Addy Osmani (границы «всегда / спроси / никогда», небольшой объём). Если хотя бы одного пункта нет — спека возвращается на доработку, как код на ревью.
-->

---

# Хорошая спека: разбор

<div class="annotated wide">
<div class="file md-view">
<div class="file-head"><span>…/add-application-security/specs/application-security/spec.md</span><span>фрагмент · превью</span></div>
<div class="md-body">
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

## Публичный контракт

После мёржа не меняется: на это опираются ссылки пользователей, MemLab и check:bundle.

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

## Если lazy-чанк не работает

Можно менять конфиг только этого микрофронта (Babel, webpack, его сервер); обход опиши в отчёте. Рецепт — «Lazy-чанки через shell» в docs.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 5 }">

## Вне scope

- редактирование, фильтры, экспорт · изменения в `common/`, shell или других продуктах

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Фрагмент спеки</b><p>Показываю самое важное: контракт, требование со сценарием, разрешение на случай, если упёрся, и что вне scope.</p></div>
  <div v-click="[1, 2]" class="note"><b>Публичный контракт</b><p>Значения, на которые опираются ссылки пользователей, MemLab и проверки. Агент не должен их придумывать.</p></div>
  <div v-click="[2, 3]" class="note"><b>Требование</b><p>Одно предложение о поведении, без слов «быстро» и «красиво».</p></div>
  <div v-click="[3, 4]" class="note"><b>Сценарий</b><p>Каждая строка THEN проверяется руками или тестом. «Код скачивается только в этот момент» — это и есть требование к lazy-загрузке.</p></div>
  <div v-click="[4, 5]" class="note"><b>Разрешение, если упёрся</b><p>Можно менять конфиг только своего микрофронта. Без этого агент либо сдаётся, либо лезет чинить общий код.</p></div>
  <div v-click="5" class="note"><b>Вне scope</b><p>Иначе агент «заодно» поправит common/, а от него зависят все 25 плагинов.</p></div>
</div>
</div>

<!--
Время: 1:40.
В конце файла ещё раздел «Definition of Done» с командами и парой строк, которые заранее отрезают лёгкие способы объявить «готово».
-->

---

# Как не надо: плохая спека

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>spec.md — антипример</span><span>demo-before</span></div>

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
  <div v-if="$clicks < 1" class="note intro bad"><b>Эту спеку получил Run A</b><p>Такие пишут, когда торопятся. Агент выполнит её добросовестно — и сделает не то.</p></div>
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

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/365e127af22be72dd173a5c94cdf907ccfa38b47" target="_blank">Шаг 3. Спецификация Application Security</a></div>

<div class="practice-files">
  <div><code>…/add-application-security/specs/application-security/spec.md</code><br>контракт, сценарии, разрешение для lazy-чанка, «готово»</div>
  <div><code>proposal.md</code> и <code>tasks.md</code><br>зачем это изменение и порядок работы со ссылками на скиллы и субагентов</div>
  <div><code>openspec/README.md</code><br>как мы работаем со спеками в legacy</div>
  <div><span class="muted">Показать</span><br>именно этот файл получает Run B вместо длинного промпта</div>
</div>

<!--
Время: 1:00.
Run B получил этот файл вместо промпта; tasks.md уже ссылается на скиллы и субагентов — их покажу дальше.
-->

---
layout: center
---

<div class="eyebrow">Блок 4</div>

# Скиллы: как делать повторяющуюся работу

<p class="muted" style="font-size: 26px">Какие скиллы у нас есть, как выглядит хороший и плохой, как делимся ими между командами и где брать идеи.</p>

<!--
Время: 0:15.
-->

---

# Какими скиллами мы пользуемся

<div class="skill-grid four">
  <div v-click class="flat-card"><h3>story-analysis</h3><p class="muted">Разбирает тикет до кода: задаёт недостающие вопросы, находит затронутые контракты и готовит черновик спеки.</p></div>
  <div v-click class="flat-card"><h3>log-trace-analysis</h3><p class="muted">Скрипт сворачивает лог в сводку, модель находит первопричину и место в коде.</p></div>
  <div v-click class="flat-card"><h3>performance-check</h3><p class="muted">По типу изменения выбирает нужные проверки: бандл, память, рендер, рантайм.</p></div>
  <div v-click class="flat-card"><h3>ui-form</h3><p class="muted">Формы на нашем UI-ките: обёртки полей, валидация, все состояния, доступность.</p></div>
  <div v-click class="flat-card"><h3>safe-change</h3><p class="muted">Правка общего кода: сначала список потребителей и план отката, потом код.</p></div>
  <div v-click class="flat-card"><h3>security-check</h3><p class="muted">Проверяет, откуда приходят внешние данные и куда уходят: авторизация эндпоинтов, allowlist прокси, CORS, секреты. Blocker-находки не чинит сам.</p></div>
  <div v-click class="flat-card"><h3>code-review</h3><p class="muted">Ревью diff по контрактам репозитория. Каждое замечание ссылается на правило; нет правила — нет замечания.</p></div>
  <div v-click class="flat-card"><h3>web-vitals-check</h3><p class="muted">Поднимает приложение, через Chrome DevTools MCP меряет LCP и CLS роута, при превышении бюджета разбирает трейс.</p></div>
</div>

<!--
Время: 1:20.
Самый заметный по эффекту обычно story-analysis: он переносит вопросы в начало, пока они дешёвые.
code-review — основа агентного ревью в CI, подробнее в блоке про проверки.
security-check — не пересказ OWASP, а короткий список того, что в этом репозитории уже было опасно. Его же использует security-reviewer в CI — покажу в блоке про ревью.
[TODO: какой скилл оказался самым полезным у вас — одна живая история.]
-->

---

# Хороший скилл: разбор <code>performance-check</code>

<div class="annotated wide">
<div class="file md-view">
<div class="file-head"><span>.agents/skills/performance-check/SKILL.md</span><span>фрагмент · превью</span></div>
<div class="md-body">
<div class="sec frontmatter" :class="{ dim: $clicks > 0 && $clicks !== 1 }">
  <div><span>name</span><code>performance-check</code></div>
  <div><span>description</span><p>Выбирает и запускает проверки производительности после изменений фронтенда, которые могут повлиять на старт и загрузку, бандл, рендер, память DOM или рантайм микрофронтов. Не нужен для правок текста, стилей и документации.</p></div>
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

## 3. Чего не делать

- не подменяй сценарий MemLab сценарием другого роута
- не считай зелёную сборку доказательством производительности
- не ослабляй baseline, чтобы проверка прошла: остановись и спроси @perf-guild

</div>
</div>
</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Скилл — это процедура</b><p>Не знание о производительности, а порядок действий после правки: что проверить и как отчитаться.</p></div>
  <div v-click="[1, 2]" class="note"><b>description</b><p>Единственное, что агент видит всегда. По нему он решает, открывать ли скилл, поэтому в нём сказано, и когда скилл нужен, и когда нет.</p></div>
  <div v-click="[2, 3]" class="note"><b>Ссылка вместо копии</b><p>Правила живут в docs. Если скопировать их в скилл, через полгода будет две разные правды.</p></div>
  <div v-click="[3, 4]" class="note"><b>Сначала понять риск</b><p>По тому, что заметит пользователь, а не по имени файла. Иначе правку в hooks/ агент сочтёт «не про производительность».</p></div>
  <div v-click="[4, 5]" class="note"><b>Минимальный набор</b><p>Слабая модель без таблицы гоняет либо всё подряд, либо ничего. С таблицей — ровно то, что нужно.</p></div>
  <div v-click="5" class="note"><b>Чего не делать</b><p>Каждая строка — реальный промах агента: чужой сценарий MemLab, «сборка прошла», ослабленный baseline. Ниже в файле — формат отчёта: команды, дельты, что упало, что не проверено.</p></div>
</div>
</div>

<!--
Время: 1:40.
У нас правило — SKILL.md держим коротким; длинные справочники — в references, детерминированная работа — в scripts.
-->

---

# <code>log-trace-analysis</code>: скрипт читает, модель думает

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
   с `--trace <id>` — получишь хронологию.
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
    <p v-click style="margin-top: 1rem; font-size: 23px">Сколько бы строк ни было в логе, в контекст модели попадает только сводка. Решение о первопричине всё равно принимает модель.</p>
  </div>
</div>

<!--
Время: 1:00.
Группировка, подсчёт и сортировка — детерминированная работа, её незачем отдавать модели.
Вывод справа — настоящий запуск скрипта на fixtures/sample.log (около 5 000 строк) из демо-ветки, его можно повторить вживую.
-->

---

# Как не надо: скилл, который мешает

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
  <div v-click="[1, 2]" class="note bad"><b>Описание ни о чём</b><p>Под «помогает с фронтендом» подходит любая задача, и скилл грузится всегда — или никогда.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Роль вместо процедуры</b><p>Модели не нужно напоминать, кто она. Ей нужны шаги.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Знание вместо шагов</b><p>Это документация, причём устаревшая. «Всегда useMemo» — правило, которое вредит.</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Противоречит документации</b><p>Скилл советует <code>require()</code> «для ленивой загрузки», а документация его запрещает. Слабая модель выберет того, кто сказал последним.</p></div>
  <div v-click="5" class="note bad"><b>Нет результата</b><p>Нет stop-условий и формата отчёта — «проверь, что всё работает» ничего не проверяет.</p></div>
</div>
</div>

<!--
Время: 1:10.
Хороший вопрос перед созданием скилла: решается ли задача без него так же хорошо? Если да — скилл не нужен.
Проверяется это evals — о них в конце.
-->

---

# Как мы шарим скиллы между командами

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
      <li v-click><b>CODEOWNERS:</b> правка скилла — это MR, который аппрувит команда-владелец.</li>
      <li v-click><b>Реестр:</b> <code>.agents/skills/README.md</code> — что делает, когда брать, владелец, eval-кейс.</li>
      <li v-click><b>Изменение скилла</b> — вместе с прогоном eval-кейса «до и после»; подробнее в блоке про evals.</li>
      <li v-click><b>Чужие скиллы</b> — только как идеи: у 13% из 3&nbsp;984 публичных скиллов Snyk нашёл критичные проблемы. Читаем, адаптируем, кладём копию к себе.</li>
    </ul>
  </div>
</div>

<!--
Время: 1:00.
Никакой отдельной платформы: скиллы — это код и живут по правилам кода.
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

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/d2264a5bb83292bdee481c4f21c3bdbe4cc77c09" target="_blank">Шаг 4. Скиллы и их владельцы</a></div>

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

# Субагенты: отдельный контекст для шумной работы

<p class="muted" style="font-size: 26px">Субагентам отдаём шумное чтение и проверку — логи, историю, ревью diff. Код пишет один агент.</p>

<!--
Время: 0:30.
Правило совпадает с опытом Anthropic и Cognition: параллельными делаем исследование и ревью, а запись кода оставляем в одном потоке.
Если параллельно пишут несколько агентов, каждый принимает свои неявные решения, и они расходятся. Многоагентные системы тратят в разы больше токенов — на внутренней модели это время GPU.
-->

---

# Субагент <code>explorer</code> и откуда его вызывают

<div class="annotated">
<div class="file code-xs wrap">
<div class="file-head"><span>.agents/agents/explorer.md</span><span>demo/agent-ready-v2</span></div>

```md {all|3|4,6|8-12|11}
---
name: explorer
description: Read-only исследует код, документацию и историю git. Используй, чтобы ответить «как X сделано сейчас, что из этого эталон и кто от этого зависит», не забивая файлами основной контекст.
tools: Read, Grep, Glob, Bash   # Bash — только git log и git show
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
  <div v-if="$clicks < 1" class="note intro"><b>Три способа вызова</b><p>Агент зовёт его сам, если задача похожа на description. Из шага скилла или tasks.md: «поручи explorer». Явно по имени: «@explorer, кто использует manifest id?»</p></div>
  <div v-click="[1, 2]" class="note"><b>description решает, когда звать</b><p>Агент делегирует автоматически, если задача похожа на описание. Поэтому описание — про ситуацию, а не про роль.</p></div>
  <div v-click="[2, 3]" class="note"><b>Короткий список инструментов</b><p>Исследователь не должен «заодно поправить». Bash оставлен для git log и git show — это договорённость; если CLI умеет allowlist команд, ограничьте Bash там.</p></div>
  <div v-click="[3, 4]" class="note"><b>Контракт ответа</b><p>Лимит строк и file:line для каждого утверждения. Без этого вернётся простыня, и основной агент снова утонет.</p></div>
  <div v-click="4" class="note"><b>Эталон или legacy</b><p>Explorer сразу отделяет эталон от legacy — по документации, а не по тому, что выглядит свежее.</p></div>
</div>
</div>

<!--
Время: 1:30.
Формат frontmatter у разных агентных CLI немного отличается, суть одна: имя, когда звать, какие инструменты, что вернуть.
В демо explorer вызывается из tasks.md (шаг 2) и из скиллов safe-change и story-analysis. Рядом лежат reviewer и log-analyst.
-->

---

# Как не надо: «команда агентов»

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
  <div v-click="[1, 2]" class="note bad"><b>Эстафета пересказов</b><p>Каждый шаг пересказывает задачу своими словами. На каждом что-то теряется, а что-то додумывается.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Вопросы запрещены</b><p>PM додумывает сам — неясность из задачи превращается в уверенное решение.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Scope расползается</b><p>Архитектор закладывает рефакторинг общего кода в задачу про одну страницу.</p></div>
  <div v-click="4" class="note bad"><b>Проверяет тот, кто чинит</b><p>QA сам исправляет и сам одобряет по зелёной сборке и check:ai. Запись есть у всех — ревьюер без свежего взгляда.</p></div>
</div>
</div>

<!--
Время: 1:00.
Контраст с тем, что мы делаем: субагенты только читают и возвращают короткий ответ по контракту, код пишет один агент, а проверяет ревьюер без права записи.
Рядом в demo-before лежит ревью-бот: комментарий к каждой строке, nit'ы без ссылки на правило и автоодобрение, если нет critical.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: субагентов

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/d7392475dba50b6fa820ad9aeb2f1f5d0a604c73" target="_blank">Шаг 5. Субагенты: explorer, reviewer, log-analyst</a></div>

<div class="practice-files">
  <div><code>.agents/agents/explorer.md</code><br>исследование только на чтение, ответ до 25 строк</div>
  <div><code>.agents/agents/reviewer.md</code><br>свежий взгляд на diff перед «готово»</div>
  <div><code>.agents/agents/log-analyst.md</code><br>разбор длинного вывода упавших проверок</div>
  <div><code>.agents/agents/README.md</code><br>три способа вызова и где они используются в tasks и скиллах</div>
</div>

<!--
Время: 0:50.
В tasks.md шаг 2 — explorer, шаг 8 — reviewer: так субагент попадает в работу без участия человека.
-->

---
layout: center
---

<div class="eyebrow">Блок 6</div>

# Проверки и ревью.

<p class="muted" style="font-size: 26px">Модель не должна сама решать, что работа закончена. Это решают quality gates.</p>

<!--
Время: 0:15.
-->

---

# Quality gates для агента: четыре уровня

<div class="click-flow gate-flow">
  <div v-click class="click-node"><b>В цикле агента</b><em>секунды</em><span>lint и типы по изменённому файлу — хуком CLI после каждой правки</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Перед «готово»</b><em>минуты</em><span>Definition of Done: check:architecture, check:bundle, check:web-vitals</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>CI на каждый MR</b><em>те же команды</em><span>плюс обязательное агентное ревью</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node human"><b>Человек</b><em>владелец</em><span>из CODEOWNERS читает diff и мёржит</span></div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 26px">Чем раньше сработал гейт, тем дешевле исправление: агент чинит сам, пока задача у него в контексте. До человека доходит уже зелёный MR с отчётом.</p>

<p v-after class="source">Хуки на правку и на завершение есть в Claude Code, Cursor и OpenCode; если в вашем CLI их нет — те же команды в Definition of Done и в CI.</p>

<!--
Время: 1:10.
Дешёвое — ближе к агенту, дорогое — позже. lint по одному файлу занимает секунды, его можно гонять после каждой правки; check:bundle и Web Vitals — минуты, их запускаем перед «готово» и в CI.
Главное: одни и те же команды на всех уровнях. Агент может воспроизвести падение CI у себя, а не гадать.
-->

---

# Как строить гейты, чтобы агент их не обходил

<div class="gate-grid">
  <div v-click class="flat-card"><h3>Скрипт, а не промпт</h3><p>Всё, что можно проверить машиной, проверяет скрипт. «Держи бандл маленьким» в AGENTS.md не работает, <code>check:bundle</code> с baseline — работает. LLM-судья — последним.</p></div>
  <div v-click class="flat-card"><h3>Гейт вне досягаемости агента</h3><p>Проверки, baseline и бюджеты — под CODEOWNERS и checks-reviewer. Ослабить baseline, чтобы позеленело, — реальный промах агента.</p></div>
  <div v-click class="flat-card"><h3>Ошибка — это следующий промпт</h3><p>Что нарушено, где, почему и куда смотреть. <code>check:ai</code> с «✓ пройдено» агент примет за готовность.</p></div>
  <div v-click class="flat-card"><h3>Храповик вместо идеала</h3><p>Бюджет — сегодняшний уровень с запасом, и только ужесточаем. LCP <code>/users</code> сейчас ~11&nbsp;с, бюджет 13&nbsp;с, цель 2,5&nbsp;с. Гейт, красный с первого дня, отключат.</p></div>
  <div v-click class="flat-card"><h3>Стабильность важнее полноты</h3><p>Медиана трёх прогонов, фиксированный троттлинг CPU. Флаки-гейт хуже никакого: агент учится перезапускать, а не чинить.</p></div>
  <div v-click class="flat-card"><h3>«Готово» — с доказательством</h3><p>В отчёте команды, их вывод и что не проверено. Нет вывода команды — нет «готово».</p></div>
</div>

<!--
Время: 1:40.
Каждая карточка — из практики этого репозитория. check:ai из demo-before — пример гейта, который врёт: печатает «пройдено» и выходит с кодом 0.
Сообщение check:bundle для lazy-чанка называет и причину, и разрешённый обход, и документ — по нему Run B чинит сам, без человека.
Храповик: бюджет Web Vitals записан из сегодняшних замеров. Цель 2,5 с — ориентир; двигаем бюджет вниз отдельными MR, когда страница стала быстрее.
-->

---

# Агентное ревью в CI — на каждый MR

<div class="click-flow review-flow">
  <div v-click class="click-node"><b>MR</b><span>любые изменения</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Проверки</b><span>детерминированные, до модели</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>code-review</b><span>обязательно, каждый MR</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>+ профильный ревьюер</b><span>если задет критичный путь</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Владелец</b><span>из CODEOWNERS мёржит</span></div>
</div>

<div class="review-grid">
  <div v-click class="flat-card bad">
    <h3>Реестр, прокси, общая сборка</h3>
    <p class="paths"><code>shell-app/server/lib/</code> · <code>microfrontends/common/</code></p>
    <p><b>platform-reviewer</b> — ошибка здесь ломает загрузку всех продуктов сразу.</p>
  </div>
  <div v-click class="flat-card bad">
    <h3>Внешние данные и MCP</h3>
    <p class="paths"><code>shell-server.js</code> · <code>*/server/</code> · <code>.mcp.json</code></p>
    <p><b>security-reviewer</b> — в демо находит ack без авторизации; MCP-сервер видит браузер и данные.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Публичные контракты</h3>
    <p class="paths"><code>*/manifest.json</code></p>
    <p><b>contract-reviewer</b> — переименованный id ломает ссылки пользователей и сценарии MemLab.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3>Сами проверки</h3>
    <p class="paths"><code>performance/</code> · <code>scripts/check-*.cjs</code></p>
    <p><b>checks-reviewer</b> — ослабить baseline значит выключить проверку для всех команд.</p>
  </div>
</div>

<p v-click class="source">Критичный путь в <code>.github/CODEOWNERS</code> назначает владельца-человека, а в <code>.agents/review/critical-paths.yml</code> — профильного агента-ревьюера. Агенты комментируют со ссылкой на правило и не аппрувят.</p>

<!--
Время: 1:30.
Базовое агентное ревью обязательно для каждого MR: скилл code-review, нет ссылки на правило — нет комментария, nitpick'и не публикуем.
Если diff задел критичный путь, CI по critical-paths.yml добавляет профильного ревьюера, а CODEOWNERS — команду-владельца, без которой не смёржить.
Так устроены и коммерческие решения: пути в CodeRabbit, инструкции по путям в Copilot code review, специализированные агенты в Claude Code Review. Мы делаем то же на внутренней модели.
В публичном репозитории job выключен переменной AGENT_REVIEW_ENABLED: agent — наш внутренний CLI.
-->

---

# Chrome DevTools MCP: Web Vitals как ещё один guardrail

<div class="two-col mcp-slide">
  <div>
    <div v-click class="file code-xs">
    <div class="file-head"><span>.mcp.json</span><span>demo/agent-ready-v2</span></div>

```json
{ "mcpServers": { "chrome-devtools": {
    "command": "npx",
    "args": ["--no-install", "chrome-devtools-mcp",
      "--headless", "--isolated", "--viewport=1440x900",
      "--no-usage-statistics", "--no-performance-crux"] } } }
```

  </div>
    <ul class="mcp-points">
      <li v-click><b>Закрытый контур:</b> версия закреплена в devDependencies, CrUX и статистика выключены — URL страниц не уходят в Google.</li>
      <li v-click><b>Гейт:</b> <code>check:web-vitals</code> ходит в тот же MCP-сервер — CPU ×4, медиана 3 прогонов, бюджет из <code>performance/</code>.</li>
      <li v-click><b>Разбор:</b> превысил бюджет — агент снимает трейс, а не угадывает.</li>
    </ul>
  </div>
  <div>
    <div v-click class="file code-xs wrap">
    <div class="file-head"><span>$ npm run check:web-vitals</span><span>вывод</span></div>

```text
/users: LCP 10 492 мс (бюджет 13 000 мс, цель 2 500 мс)
  · CLS 0.142 (бюджет 0.15, цель 0.1) · JS до LCP 3,9 МБ
  · CPU ×4, медиана 3 прогонов
/reports: LCP 9 760 мс (бюджет 11 500 мс, цель 2 500 мс) …
Проверка Web Vitals пройдена.
```

  </div>
    <div v-click class="file code-xs wrap" style="margin-top: 14px">
    <div class="file-head"><span>MCP · performance_analyze_insight</span><span>LCPBreakdown</span></div>

```text
LCP 13 525 ms (CPU 4x), элемент — текст
- Time to first byte:   319 ms (2.4%)
- Element render delay: 13 205 ms (97.6%)
+ LegacyJavaScript: 123.8 kB полифилов
```

  </div>
  </div>
</div>

<!--
Время: 1:40.
Chrome DevTools MCP — официальный MCP-сервер Chrome: агент открывает страницу, кликает, читает консоль и сеть, снимает performance-трейс с инсайтами.
Для закрытого контура важны два флага: --no-performance-crux (иначе URL из трейса уходят в CrUX API) и --no-usage-statistics. Версию ставим из внутреннего npm-зеркала, npx --no-install не ходит в интернет.
Вывод справа — настоящие запуски на демо-ветке в production-режиме. Render delay 97% — почти всё время уходит на JS до отрисовки; LegacyJavaScript — полифилы из targets: 'ie 11' того же корневого Babel-конфига.
Трейс с включённой записью медленнее, поэтому LCP в нём больше, чем в гейте: гейт меряет без трейса.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: проверки и ревью

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/287d3d3059e61badb1db5eb83f72401da21ab319" target="_blank">Шаг 6. Проверки и агентное ревью</a></div>

<div class="practice-files">
  <div><code>scripts/check-architecture.cjs</code>, <code>check-bundle.cjs</code>, <code>check-memory.cjs</code><br>проверки с сообщениями, по которым агент исправит ошибку без человека</div>
  <div><code>.agents/review/critical-paths.yml</code> и <code>scripts/select-reviewers.cjs</code><br>какой ревьюер нужен для какого пути</div>
  <div><code>.agents/agents/security-reviewer.md</code> и соседи<br>чеклисты для критичного кода; security-reviewer найдёт ack без авторизации</div>
  <div><code>.github/workflows/agent-review.yml</code> и <code>pull_request_template.md</code><br>как ревью запускается на каждом MR; к правке harness прикладываем прогон evals</div>
  <div><code>package.json</code>, <code>performance/bundle-baseline.json</code>, <code>tests/memlab/…</code><br>команды check:*, baseline бандла и сценарий памяти, на который опирается спека</div>
</div>

<!--
Время: 1:00.
Показать вживую: node scripts/select-reviewers.cjs src/shell-app/server/shell-server.js src/shell-app/server/lib/registry.js src/microfrontends/users-and-roles/manifest.json README.md — обычный code-review плюс platform-, security- и contract-reviewer; README.md ревьюера не добавляет.
Уязвимость в ack оставлена в демо намеренно, чтобы ревьюеру было что найти. Если спросят: в продукте регистрация закрывается авторизацией и allowlist хостов.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: Chrome DevTools MCP

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/08c2544dab37844be6c940333cfe2d1bca951128" target="_blank">Шаг 7. Chrome DevTools MCP: запуск проекта и Web Vitals</a></div>

<div class="practice-files">
  <div><code>.mcp.json</code><br>сервер chrome-devtools: закреплённая версия, без CrUX и статистики; под CODEOWNERS и security-reviewer</div>
  <div><code>scripts/start-prod.cjs</code> → <code>npm run start:prod</code><br>shell и продукты из dist как в production; ждёт, пока shell отдаст entry каждого продукта</div>
  <div><code>scripts/check-web-vitals.cjs</code> и <code>performance/web-vitals-budget.json</code><br>гейт LCP и CLS через тот же MCP; бюджет — храповик</div>
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
Если Run B прошёл всё с первого раза — показать сохранённый цикл «упал → исправил» из репетиции.
-->

---
layout: center
---

<div class="eyebrow">Блок 7</div>

# Evals: как измерить, что агент стал работать лучше

<p class="muted" style="font-size: 26px">Что это, зачем, как выглядит хороший и плохой eval и как завести их у себя.</p>

<!--
Время: 0:15.
-->

---

# Зачем вообще evals

<div class="two-col wide-left" style="align-items: start">
  <div>
    <p v-click style="font-size: 28px">Поправили AGENTS.md или обновили модель — через неделю в чате: «агент стал хуже». Спорим на ощущениях.</p>
    <p v-click style="font-size: 28px">Eval — автотест для связки «агент + harness»: одна задача, несколько прогонов, доля успехов. Было 3 из 5, стало 5 из 5 — сильный сигнал, что правка помогла.</p>
  </div>
  <table v-click class="comparison" style="font-size: 20px">
    <thead><tr><th></th><th>Тест</th><th>Eval</th></tr></thead>
    <tbody>
      <tr><td>Проверяет</td><td>код</td><td>агента и harness</td></tr>
      <tr><td>Запуск</td><td>один раз</td><td>N раз</td></tr>
      <tr><td>Результат</td><td>зелёный или красный</td><td>доля успехов</td></tr>
    </tbody>
  </table>
</div>

<!--
Время: 1:30.
Агент недетерминирован, поэтому один прогон ничего не доказывает — как флаки-тест, только флакость здесь и есть то, что мы меряем.
Anthropic пишет: команды без evals тратят недели на проверку каждой новой модели, команды с evals переходят за дни.
Пять прогонов — не статистика: 3 из 5 против 5 из 5 статистически не значимо. Но это отличает «помогло» от «один раз повезло», а для решения о мёрже этого хватает.
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

<p v-click style="margin-top: 1.2rem; font-size: 24px">Результат считают двумя общепринятыми метриками. <b>k</b> — число попыток на одну задачу.</p>

<div class="two-col" style="margin-top: 0.6rem">
  <div v-click class="flat-card"><h3><code>pass@k</code> — хотя бы одна из k прошла</h3><p class="muted">«Агент в принципе умеет». Подходит, когда человек выберет лучший из нескольких вариантов. Растёт с числом попыток.</p></div>
  <div v-click class="flat-card"><h3><code>pass^k</code> — прошли все k попыток</h3><p class="muted">«Агенту можно доверять». Нужно, когда агент работает сам. Падает быстро: при 75% успеха на попытку три подряд — всего 42%.</p></div>
</div>

<p v-after class="source">Пример: 3 из 5 — это pass@5 = да, pass^5 = нет. pass@k — из статьи OpenAI о Codex (HumanEval, 2021), pass^k — из τ-bench (2024); обе метрики использует Anthropic в «Demystifying evals for AI agents».</p>

<!--
Время: 1:10.
Терминология из статьи Anthropic «Demystifying evals for AI agents»: task, trial, grader, outcome.
Если спросят про обозначения: «@» читается «at» — pass at k; «^» — степень: вероятность пройти все k попыток при независимых прогонах — p в степени k.
Главное: проверяем результат в репозитории, а не то, что агент написал «готово».
-->

---

# Как не надо: eval, который ничего не измеряет

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
  <div v-click="[1, 2]" class="note bad"><b>Ответ в задаче</b><p>Критерии отданы агенту. Мы проверяем, умеет ли он читать, а не справится ли без подсказки. В SWE-bench у трети «успешных» патчей решение было прямо в тексте задачи.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Проверяем слова</b><p>«Готово» и зелёная сборка — не результат. Проверять нужно состояние репозитория.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Один прогон</b><p>Агент недетерминирован. Один успех может быть удачей.</p></div>
  <div v-click="4" class="note bad"><b>Кейс выдуман</b><p>Не сказано, откуда кейс, — возможно, мы чиним то, что и так работало.</p></div>
</div>
</div>

<!--
Время: 1:00.
Про SWE-bench: SWE-Bench+ (Aleithan et al., 2024) — у 32,67% успешных патчей SWE-Agent + GPT-4 решение было в тексте issue или комментариях.
-->

---

# Хороший eval: разбор

<div class="annotated">
<div class="file code-sm">
<div class="file-head"><span>evals/cases/add-microfrontend.md</span><span>demo/agent-ready-v2</span></div>

```md {all|2|4-6|8-12|14-15|17-19}
# Добавить микрофронт
Стартовый коммит: 186f075

## Задача            ← агенту отдаём только это
Добавь микрофронт audit-log (пункт меню «Audit log», роут
/audit-log) с постраничной таблицей событий.

## Критерии          ← агент их не видит
- страница подключена через lazy-роут: в сборке есть её чанк
- клиент в ES-модулях: в коде продукта нет require() и module.exports
- нет правок в common/ и shell-app/
- в отчёте агента есть check:bundle

## Проверка
node evals/graders/add-microfrontend.cjs

## Откуда кейс
Агент скопировал соседа вместе с CommonJS-конфигом Babel:
import() стал require(), страница и antd целиком — в entry
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro good"><b>Тот же кейс, сделанный правильно</b><p>Пять частей: старт, задача, критерии, проверка и откуда кейс.</p></div>
  <div v-click="[1, 2]" class="note good"><b>Фиксированный старт</b><p>Каждый прогон начинается с одного и того же коммита в чистом checkout.</p></div>
  <div v-click="[2, 3]" class="note good"><b>Только задача</b><p>Агент получает ровно то, что получил бы от человека.</p></div>
  <div v-click="[3, 4]" class="note good"><b>Критерии скрыты</b><p>Их знает только проверка. Задача при этом конкретная: имя продукта и роут, чтобы прогоны можно было сравнить.</p></div>
  <div v-click="[4, 5]" class="note good"><b>Проверка — скрипт</b><p>Архитектура, бандл, линтер, scope и отчёт агента. Никакого LLM-судьи на старте.</p></div>
  <div v-click="5" class="note good"><b>Откуда кейс</b><p>Реальный промах. Через полгода понятно, зачем этот кейс вообще нужен.</p></div>
</div>
</div>

<!--
Время: 1:00.
-->

---

# Как завести evals на своём проекте

<div class="flow" style="grid-template-columns: repeat(5, 1fr)">
  <div v-click class="step"><span class="n">01</span><strong>Соберите промахи</strong><span>5 реальных случаев за месяц, когда агент сделал не то</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Сделайте кейсы</strong><span>задача, стартовый коммит, скрытые критерии</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Проверка</strong><span>ваши существующие скрипты и тесты</span></div>
  <div v-click class="step"><span class="n">04</span><strong>3–5 прогонов</strong><span>до и после каждой правки harness</span></div>
  <div v-click class="step"><span class="n">05</span><strong>Читайте трейсы</strong><span>цифра говорит «что», трейс — «почему»</span></div>
</div>

<div class="two-col" style="margin-top: 1.2rem">
  <div v-click class="flat-card"><h3>Когда запускать</h3><p class="muted">MR в AGENTS.md, docs или скиллы — быстрый набор. Ночью — все кейсы. Новая версия внутренней модели — прогон старой и новой на тех же кейсах.</p></div>
  <div v-click class="flat-card"><h3>Сколько кейсов</h3><p class="muted">Anthropic советует начать с 20–50 задач из реальных промахов. Пять — уже лучше, чем ни одного.</p></div>
</div>

<!--
Время: 1:10.
Для внутренней модели это особенно важно: её обновляют админы, и без evals вы узнаете о регрессии от коллег через неделю.
-->

---

# Как связать скилл и eval

<div class="two-col" style="align-items: start">
  <div v-click class="file code-xs wrap">
  <div class="file-head"><span>.agents/skills/README.md</span><span>реестр, фрагмент</span></div>

```md
| Скилл             | Eval-кейсы                          |
|-------------------|-------------------------------------|
| performance-check | add-lazy-route, add-large-table, …  |
| safe-change       | add-microfrontend                   |
| story-analysis    | пока нет — «пробный»                |
```

  </div>
  <div v-click class="file code-xs wrap">
  <div class="file-head"><span>.github/pull_request_template.md</span><span>фрагмент</span></div>

```md
## Изменение harness (AGENTS.md, docs/architecture, .agents/)
Гипотеза: что агенты должны начать делать лучше?

| Кейс              | До (main) | После (этот MR) |
|-------------------|-----------|-----------------|
| add-microfrontend |   3 / 5   |   5 / 5         |
| add-lazy-route    |   4 / 5   |   4 / 5         |
```

  </div>
</div>

<div class="two-col" style="margin-top: 1rem; align-items: start">
  <p v-click style="font-size: 22px; margin: 0">В реестре у скилла указаны кейсы, которые его проверяют. Кейса нет — скилл помечен «пробный», и следующая его правка приходит вместе с первым кейсом.</p>
  <p v-click style="font-size: 22px; margin: 0">В MR со скиллом прогоняем его кейсы на <code>main</code> и на ветке, цифры — в описание MR. Мёржим, если «после» лучше и соседние кейсы не просели.</p>
</div>

<!--
Время: 1:00.
Связь — обычная таблица в реестре скиллов, никакой платформы. Запуск: EVAL_REF=origin/main evals/run-case.sh add-microfrontend 5, затем EVAL_REF=HEAD — то же самое.
Скриптовый grader пока есть только у add-microfrontend, остальные кейсы оцениваем руками по критериям. Цифры в шаблоне PR на слайде для примера.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: evals

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/8fc4a127f9b0c095ba7b9a6f25d8d6d5e0a3a865" target="_blank">Шаг 8. Evals: кейсы, grader и запуск</a></div>

<div class="practice-files">
  <div><code>evals/README.md</code><br>что такое eval и как им пользоваться — для тех, кто видит это впервые</div>
  <div><code>evals/cases/</code><br>пять кейсов из реальных промахов</div>
  <div><code>evals/graders/add-microfrontend.cjs</code><br>проверка-скрипт: архитектура, бандл, линтер, scope, отчёт</div>
  <div><code>EVAL_AGENT_CMD=… evals/run-case.sh add-microfrontend 5</code><br>запуск: N прогонов в чистых worktree и строка «прошло k из N»</div>
</div>

<!--
Время: 1:00.
Показать команду запуска и формат результата. Цифры — из своего прогона на репетиции.
Одна строка «прошло k из N» — и спор «стало хуже» закрывается цифрой.
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
class: compact-table
---

# Сравниваем Run A и Run B по пяти вопросам

<p style="font-size: 23px; margin: -0.4rem 0 1rem">Открываем результат обоих прогонов: <span class="red-text">что сбивало Run A</span> и <span class="green">что подсказывало Run B</span>.</p>

<table class="comparison runs">
  <thead><tr><th>Вопрос к результату</th><th>Как проверяем</th><th class="run-a">Что сбивало Run A</th><th class="run-b">Что подсказало Run B</th></tr></thead>
  <tbody>
    <tr v-click><td>Страница открывается через shell и грузится отдельным чанком?</td><td>check:bundle, открыть страницу из меню</td><td class="run-a">«импортируй страницы сразу» в AGENTS.md</td><td class="run-b">сценарий в спеке, check:bundle, рецепт в docs</td></tr>
    <tr v-click><td>Клиент в ES-модулях, entry не раздут?</td><td>размер entry, check:web-vitals</td><td class="run-a">«antd через require()» в спеке, Babel с <code>modules: 'cjs'</code></td><td class="run-b">«Никогда» в AGENTS.md, «Не копируй» в docs, web-vitals-check</td></tr>
    <tr v-click><td>Таблица не пересчитывается, когда сворачивают меню?</td><td>React Profiler</td><td class="run-a">«оптимизируй всё через useMemo»</td><td class="run-b">сценарий «посторонний рендер» в спеке, правила рендера в docs</td></tr>
    <tr v-click><td>Агент не трогал чужой код?</td><td>список изменённых файлов</td><td class="run-a">«если сборка падает — поправь common/»</td><td class="run-b">«вне scope» в спеке, safe-change</td></tr>
    <tr v-click><td>На чём основано «готово»?</td><td><code>agent-report.md</code></td><td class="run-a">check:ai → «✓ пройдено»</td><td class="run-b">команды и их вывод вместо самооценки</td></tr>
  </tbody>
</table>

<!--
Время: 3:00.
Идти по строкам и открывать diff или вывод проверки обоих прогонов. Не утверждать заранее, что Run A ошибся.
Это демонстрация механизма, а не бенчмарк: для статистики есть evals.
-->

---

# Что поменялось между Run A и Run B

<table class="comparison runs">
  <thead><tr><th>Почему модель ошибается</th><th class="run-a">Что было у Run A</th><th class="run-b">Что закрыло это в Run B</th></tr></thead>
  <tbody>
    <tr v-click><td>Не знает, какой пример правильный</td><td class="run-a">старая дока: «собирай в CommonJS ради IE11»</td><td class="run-b">«Источник истины» в AGENTS.md, «Не копируй» в docs, explorer</td></tr>
    <tr v-click><td>Не видит неявных контрактов</td><td class="run-a">спека «как у соседей»</td><td class="run-b">публичный контракт в спеке, check:architecture, contract-reviewer</td></tr>
    <tr v-click><td>Не знает, кого ещё затронет правка</td><td class="run-a">«если сборка падает — поправь common/ под себя»</td><td class="run-b">таблица cross-zone, «Вне scope», safe-change</td></tr>
    <tr v-click><td>Не знает, когда работа закончена</td><td class="run-a">check:ai → «✓ пройдено», бот одобрил</td><td class="run-b">Definition of Done, quality gates с понятными сообщениями, Web Vitals через MCP, ревьюер</td></tr>
  </tbody>
</table>

<p v-click style="margin-top: 1.3rem; font-size: 27px">Модель одна и та же, и AI-сетап есть в обоих репозиториях. Разница в том, помогает он модели или сбивает её с толку.</p>

<!--
Время: 1:00.
-->

---

# Итоги: check-list агентной разработки

<div class="checklist">
  <div v-click>Короткий AGENTS.md: карта, запреты, cross-zone-зависимости, Definition of Done</div>
  <div v-click>Вложенные AGENTS.md для критичных мест: реестр, прокси, общая сборка</div>
  <div v-click>Общая документация: «как правильно», «не копируй», подводные камни</div>
  <div v-click>Спека на каждое заметное изменение — прочитанная человеком до кода</div>
  <div v-click>Quality gates вне агента: скрипты с понятными сообщениями и бюджеты-храповики</div>
  <div v-click>Chrome DevTools MCP: агент сам поднимает проект и меряет Web Vitals</div>
  <div v-click>Скиллы на повторяющуюся работу, у каждого есть владелец</div>
  <div v-click>Субагенты для исследования и ревью, а код пишет один агент</div>
  <div v-click>Агентное ревью в CI на каждый MR, для критичных путей — профильное</div>
  <div v-click>Eval-кейсы из реальных промахов и прогон при каждой правке</div>
</div>

<!--
Время: 1:20.
Порядок — по отдаче: начните с AGENTS.md, документации, спеки и проверок, остальное — когда они уже работают.
Слайд для фотографии. Всё показанное лежит в ветке demo/agent-ready-v2 — можно взять как шаблон.
-->

---
layout: center
---

<div class="huge">Сделайте проект <span class="green">понятным агенту</span></div>

<p v-click class="muted" style="margin-top: 2.1rem; font-size: 2.5rem">Модель определяет потолок, а harness — как часто вы до него дотягиваетесь.</p>

<p v-click style="margin-top: 1.4rem; font-size: 1.05rem">Demo: <code>github.com/spiderpoul/enterprise-app-optimization</code>, ветка <code>demo/agent-ready-v2</code></p>

<!--
Время: 0:40.
Вернуться к вопросу из начала: у кого есть внутренняя модель и кто ей не пользуется. Попробуйте один блок — хотя бы AGENTS.md и одну проверку.
Спасибо. Вопросы.
-->
