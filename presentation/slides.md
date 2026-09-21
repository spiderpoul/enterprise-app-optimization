---
theme: default
title: "Демо-сессия «Не Claude единым: агентная разработка в закрытом контуре большого фронтенда»"
info: |
  Что делать, если Claude Code и Codex нельзя подключить к корпоративному репозиторию,
  а доступная внутренняя модель заметно чаще ошибается и галлюцинирует?

  Поговорим о том, как выстроить вокруг внутренней модели рабочую агентную среду
  для крупного проекта: подключить поиск по коду и документации, зафиксировать
  архитектурные ограничения, предоставить агенту необходимые инструменты и
  замкнуть цикл его работы на тестах и других автоматических проверках.
author: Павел
colorSchema: dark
transition: slide-left
lineNumbers: false
mdc: true
aspectRatio: 16/9
canvasWidth: 1440
---

<div class="eyebrow">Демо-сессия</div>

# «Не Claude единым:<br>агентная разработка в закрытом контуре большого фронтенда»

<div class="muted" style="margin-top: 2.4rem; font-size: 1.05rem">Павел</div>

<!--
Время: 0:40.
Обещание доклада: не сравниваем подписки и не ищем «самую умную модель».
Покажу, что нужно положить вокруг внутренней модели, чтобы ею можно было пользоваться в большом enterprise-проекте.
-->

---

# Кто я

<div class="speaker-grid">
  <div>
    <div class="eyebrow">Павел Уваров</div>
    <div class="speaker-role">Software Expert в Kaspersky</div>
    <div class="speaker-role muted">Спикер Podlodka React Crew · HolyJS</div>
    <div v-click class="speaker-fact"><b>9+ лет</b><span>разрабатываю enterprise-проекты</span></div>
    <div v-click class="speaker-fact"><b>200+</b><span>технических собеседований — и продолжаю проводить</span></div>
    <div v-click class="speaker-fact"><b>Челлендж</b><span>как только у нас появилась агентная разработка — перестать писать код руками</span></div>
    <div v-click class="statement" style="margin-top: 1.25rem">Пока держусь 🙂</div>
  </div>
  <div v-click class="speaker-photo">
    <img src="/assets/pavel-uvarov.jpg" alt="Павел Уваров" />
  </div>
</div>

<!--
Время: 1:00.
Коротко представиться: Software Expert в Kaspersky, Podlodka React Crew, HolyJS.
Челлендж «не писать код руками» — мостик к вопросу на следующем слайде:
если руками кода меньше, инженерного понимания всё равно нужно не меньше.
-->

---
layout: center
---

# Нужно ли сегодня ещё уметь писать код?

<div class="two-col wide-left">
  <div>
    <div v-click class="big-quote" style="font-size: 41px">«На собеседованиях всё чаще вижу: человек не может без агента написать даже простой цикл»</div>
    <div v-click class="flat-card" style="margin-top: 1.3rem">
      <h3>Мой тезис</h3>
      <p>Если без Claude ты не можешь объяснить и поддержать решение, Claude это не исправит.</p>
    </div>
    <div v-click class="statement" style="margin-top: 1.25rem">Сильная модель без контекста тоже ошибается — только дороже.</div>
  </div>
  <div v-click class="meme-image meme-spider meme-spider-small">
    <img src="/assets/1.jfif" alt="Мем про зависимость от Claude" />
  </div>
</div>

<p v-click class="muted" style="margin-top: 1.15rem; font-size: 1.08rem">Сильная облачная модель особенно полезна там, где высока неопределённость. Но сначала нужно научиться правильно готовить контекст для агента.</p>

<!--
Время: 1:40.
Спросить аудиторию: «Как считаете, нужно ли сегодня вообще уметь писать код?»
На собеседованиях всё чаще вижу людей, которые без AI теряются даже на базовой задаче.
Если кажется, что Claude — волшебная таблетка, а внутренняя модель — «шлак»,
скорее всего, мы ещё не научились выжимать максимум и из Claude.
Хороший контекст и хороший harness усиливают любую модель.
-->

---

# Кому знакомо?

<div class="grid-4">
  <div v-click class="flat-card bad">
    <h3 style="font-size: 29px">«Да самому быстрее сделать»</h3>
  </div>
  <div v-click class="flat-card bad">
    <h3 style="font-size: 29px">«Не хочу ревьювить AI-slop»</h3>
  </div>
  <div v-click class="flat-card bad">
    <h3 style="font-size: 27px">«Я полчаса объяснял — за 15 минут уже написал бы»</h3>
  </div>
  <div v-click class="flat-card bad">
    <h3 style="font-size: 26px">«Он вроде починил баг, но теперь я не понимаю, что он сломал»</h3>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.7rem">И здесь очень хочется обвинить модель. Но часто мы просто не подготовили ей нормальную среду.</div>

<!--
Время: 1:20.
Попросить поднять руки, кому знакомы хотя бы две фразы.
Это не оправдание модели: дальше разбираем, что именно должен подготовить разработчик,
чтобы результат перестал зависеть от удачи.
-->

---

# Настоящий enterprise-гигант

<div class="two-col wide-left">
  <div>
    <div v-click class="metric">10+ команд</div>
    <div v-click class="metric" style="margin-top: 1.1rem">25+ плагинов</div>
    <div v-click class="metric" style="margin-top: 1.1rem">1000+ страниц</div>
  </div>
  <div>
    <div v-click class="flat-card">
      <h3>Kaspersky Security Center</h3>
      <p>Платформа централизованного управления защитой и корпоративной инфраструктурой.</p>
      <p class="muted">Три вида поставки: XDR · Cloud · on-prem</p>
    </div>
    <div v-click class="flat-card" style="margin-top: 1.2rem">
      <h3>9+ лет эволюции</h3>
      <p>Микрофронты · Node.js · React · Hexa UI</p>
      <p class="muted">За это время менялись команды, требования, библиотеки и архитектурные подходы — следы разных эпох остаются в коде.</p>
    </div>
  </div>
</div>

<!--
Время: 1:30.
Размер здесь важен не ради цифр.
Главное: большой живой enterprise-проект хранит историю решений.
Для агента «прочитай код и разберись» — это уже отдельная исследовательская задача.
-->

---

# С чем сталкиваемся в большом enterprise

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Масштаб</strong><span>Десятки команд, сотни модулей, пересекающиеся зависимости</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Контекст взрывается</strong><span>Один запрос «сделай как рядом» превращается в десятки файлов до первой правки</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Legacy</strong><span>Временные решения, обходы и старые подходы выглядят как нормальные примеры</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Закрытый контур</strong><span>Код, логи, traces и конфиденциальные данные нельзя просто отправить наружу</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.7rem">Агенту приходится не только решать задачу — сначала нужно отделить актуальное знание от шума.</div>

<!--
Время: 1:30.
Ключевой pain: раздутый контекст.
Даже большое context window не отвечает на вопрос, какой из найденных паттернов текущий и правильный.
-->

---

# Почему облачная модель не всегда спасает

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Данные</strong><span>Передача кода, логов и traces наружу — отдельный security-риск и часто просто запрещена policy</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Нет внутренних доступов</strong><span>MCP, Confluence, code search, внутренние сервисы и инфраструктура остаются за стеной</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Цена и лимиты</strong><span>Тарифы, квоты и условия использования контролирует внешний поставщик</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Интеграция</strong><span>Чем больше данных и прав даём облаку, тем больше согласований и поверхность передачи данных</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.7rem">Облачная модель может быть сильнее сама по себе — и при этом знать слишком мало о вашей реальности.</div>

<!--
Время: 1:30.
Не делать вывод «облако плохое».
Если Claude разрешён и имеет нужные доступы — отлично.
Но в закрытом контуре его преимущество в интеллекте легко упирается в отсутствие контекста и прав.
-->

---

# Модели на собственной инфраструктуре уже достаточно сильные

<div class="benchmark-strip">
  <div v-click class="benchmark">
    <b>45</b>
    <span>GLM-5.3<br/>AA Intelligence Index</span>
  </div>
  <div v-click class="benchmark">
    <b>45</b>
    <span>Claude Opus 5<br/>medium effort</span>
  </div>
  <div v-click class="benchmark">
    <b>40</b>
    <span>DeepSeek V4.1 Flash<br/>reasoning max</span>
  </div>
  <div v-click class="benchmark">
    <b>38</b>
    <span>Claude Sonnet 5<br/>max effort</span>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.65rem">При правильном контексте, инструментах и проверках внутренняя модель может не уступать по эффективности топовой облачной на типовых инженерных задачах.</div>

<p v-click class="source">Источник: Artificial Analysis, данные на сентябрь 2026. Benchmark показывает уровень моделей, но не заменяет проверку на вашем репозитории.</p>

<!--
Время: 1:40.
Не продавать leaderboard и не говорить, что open-weight «победил Claude».
Тезис другой: модели, которые можно разворачивать внутри контура, уже достаточно сильны для полезной разработки.
А доступ к внутренним данным и хороший harness компенсируют часть разницы в чистом интеллекте.
-->

---

# Модель — только часть системы

<div v-click class="image-frame harness-hero-frame">
  <img src="/assets/harness-anatomy.png" alt="Harness anatomy" />
</div>

<div class="harness-legend">
  <div v-click><b>Модель</b><span>рассуждает и генерирует</span></div>
  <div v-click><b>Harness</b><span>контекст · ограничения · инструменты · feedback</span></div>
</div>

<p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 7. Соотношение 10/90 — метафора авторов, не измерение.</p>

<!--
Время: 2:00.
Слайд должен визуально показать: модель — маленькая часть всей системы.
Сильная модель всё равно может переусложнить задачу, забить контекст или уверенно выбрать не тот паттерн.
Harness нужен, чтобы эти ошибки ограничивать и быстро обнаруживать.
-->

---
layout: center
---

<div v-click class="meme-kicker">Примерно так же выглядела модель, когда я впервые сказал ей: «Пройдись по нашему репозиторию и найди баг»</div>

<div v-click class="meme-image meme-rescue">
  <img src="/assets/3.png" alt="Мем: испуганная модель в большом legacy-репозитории" />
</div>

<div v-click class="meme-caption">Обвязка нужна не для красоты: она переводит агента из «мечусь по репозиторию» в нормальный инженерный процесс.</div>

<!--
Время: 0:55.
Первый клик — фраза сверху. Второй — картинка. Третий — вывод.
Сказать живо: первый запуск реально выглядел как метание по огромному проекту.
Наша работа — дать агенту карту, правила движения и возможность проверить себя.
-->

---

# Сильная модель может очень убедительно ошибаться

<div class="timeline">
  <div v-click class="timeline-item"><b>Сначала</b><span>Module Federation + shared runtime</span></div>
  <div v-click class="timeline-arrow">→</div>
  <div v-click class="timeline-item"><b>Потом</b><span>другая версия того же архитектурного подхода</span></div>
  <div v-click class="timeline-arrow">→</div>
  <div v-click class="timeline-item bad"><b>Затем</b><span>откат</span></div>
  <div v-click class="timeline-arrow">→</div>
  <div v-click class="timeline-item"><b>Сегодня</b><span>другой runtime-механизм и другой golden path</span></div>
</div>

<div v-click class="flat-card" style="margin-top: 1.55rem">
  <h3>Все эти куски кода выглядят правдоподобно</h3>
  <p class="muted">Если сказать «сделай как рядом», модель ещё должна угадать, какой из соседних вариантов — актуальный стандарт.</p>
</div>

<div v-click class="statement" style="margin-top: 1.2rem">Слабая модель может ошибиться заметно. Сильная — ошибиться красиво, последовательно и очень убедительно.</div>

<!--
Время: 2:00.
Не показывать номера PR на слайде — это история проекта, а не экскурсия по GitHub.
Главная мысль: интеллект модели не даёт ей знания о том, какой исторический паттерн сегодня считается правильным.
-->

---

# Без harness агенту приходится угадывать

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Найти контекст</strong><span>Какие файлы и PR вообще релевантны?</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Выбрать норму</strong><span>Какой из исторических подходов текущий?</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Удержать цель</strong><span>Не утонуть в 50 файлах и нескольких версиях архитектуры</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Самопровериться</strong><span>Понять, что «работает» недостаточно</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.7rem">Наша задача — превратить эти догадки в проектные артефакты и executable feedback.</div>

<!--
Время: 1:20.
Переходим к составу harness.
-->

---

# Из чего складывается harness

<div class="roadmap">
  <div v-click><b>01</b><strong>Context</strong><span>Что агент должен знать сейчас</span></div>
  <div v-click><b>02</b><strong>Constraints</strong><span>Что допустимо / запрещено</span></div>
  <div v-click><b>03</b><strong>Procedures</strong><span>Как выполнять повторяемую работу</span></div>
  <div v-click><b>04</b><strong>Actions</strong><span>Что агент может сделать сам</span></div>
  <div v-click><b>05</b><strong>Feedback</strong><span>Как среда докажет, что результат нормальный</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.5rem">И всё это подаётся постепенно: нужный контекст — в нужный момент.</div>

<!--
Время: 1:40.
Это основная карта доклада.
Progressive disclosure — сквозной принцип: не грузим всю организацию знаний в первый prompt.
-->

---

# AGENTS.md — карта проекта, не энциклопедия

<div class="two-col wide-left">
  <div v-click>

~~~md
# Project guide

## Start here
- frontend: docs/architecture/frontend.md
- microfrontends: docs/architecture/microfrontends.md
- performance: docs/performance.md

## Validate
- npm run check:architecture
- npm run lint
- npm run build
- npm run check:bundle

## Never
- introduce a second React runtime
- bypass manifest registration
~~~

  </div>
  <div>
    <div v-click class="flat-card"><h3>В AGENTS.md</h3><p>Навигация · инварианты · команды · stop conditions</p></div>
    <div v-click class="flat-card bad" style="margin-top: 1.1rem"><h3>Не в AGENTS.md</h3><p>1000 строк архитектуры · tutorial по React · вся история проекта</p></div>
  </div>
</div>

<!--
Время: 2:00.
AGENTS.md загружается рано, поэтому каждый лишний абзац платится на каждой задаче.
Он должен направить к источнику истины, а не стать вторым Confluence.
-->

---

# Документация — ближе к источнику

<div class="two-col">
  <div v-click class="flat-card">
    <h3>AGENTS.md</h3>
    <p><b>Стабильная карта:</b> куда идти, что обязательно, как проверить.</p>
    <p class="muted">Меняется редко.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Docs рядом с кодом</h3>
    <p><b>Локальное знание:</b> архитектура, решения, golden paths, anti-patterns, примеры.</p>
    <p class="muted">Меняется вместе с конкретной областью.</p>
  </div>
</div>

<div class="pattern-pair" style="margin-top: 1.5rem">
  <div v-click class="pattern-good"><b>✓ Делай так</b><span>manifest registry · shared runtime · lazy route</span></div>
  <div v-click class="pattern-bad"><b>✕ Не копируй</b><span>deprecated loader · duplicate React · eager route</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.4rem">Агенту нужны не только правила. Ему нужны явные pattern / anti-pattern с причиной.</div>

<!--
Время: 1:50.
«Ближе к источнику» — буквально: знание про microfrontends рядом с microfrontend-архитектурой,
а не гигантский корневой prompt, который устаревает целиком.
-->

---

# Spec-Driven Development: сначала фиксируем, что именно меняем

<div class="click-flow">
  <div v-click class="click-node"><b>1. Intent</b><span>что меняем и зачем</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>2. Contract</b><span>scope · scenarios · constraints</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>3. Implement</b><span>код + локальные решения</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>4. Verify</b><span>tests · architecture · perf</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.8rem">Формат вторичен: OpenSpec, Spec Kit, свой Markdown. Важен versioned contract изменения.</div>

<!--
Время: 2:00.
OpenSpec — один из вариантов, не золотой стандарт.
Смысл SDD: до реализации убрать продуктовую и архитектурную неоднозначность,
а не заставить команду принять конкретный framework.
-->

---

# Как завести SDD в legacy, где спек никогда не было

<div class="click-flow">
  <div v-click class="click-node"><b>Код сегодня</b><span>реальное поведение</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Agent draft</b><span>восстановить spec из кода и тестов</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Human review</b><span>отделить intent от случайности</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Next change</b><span>уже начинается со spec</span></div>
</div>

<div class="two-col" style="margin-top: 1.5rem">
  <div v-click class="flat-card">
    <h3 class="green">Не требуем идеала</h3>
    <p>Не нужно сначала описать весь девятилетний продукт.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3 class="yellow">Spec может отставать</h3>
    <p>Bugfix или hotfix иногда появляется раньше обновления документа — тогда синхронизируем постфактум.</p>
  </div>
</div>

<!--
Время: 1:50.
Если spec расходится с кодом, нельзя слепо генерировать код из устаревшего текста.
В legacy код и тесты остаются важным наблюдаемым источником факта; spec фиксирует intent и должна поддерживаться как инженерный артефакт.
-->

---
layout: center
---

# Минимальная спецификация, которой уже достаточно

<div class="spec-grid">
  <div v-click class="flat-card"><h3>Что меняем</h3><p class="muted">Наблюдаемое поведение после изменения</p></div>
  <div v-click class="flat-card"><h3>Зачем</h3><p class="muted">Пользовательская или инженерная причина</p></div>
  <div v-click class="flat-card"><h3>Scope</h3><p class="muted">Где можно менять код</p></div>
  <div v-click class="flat-card bad"><h3>Out of scope</h3><p class="muted">Что точно не трогаем</p></div>
  <div v-click class="flat-card"><h3>Constraints</h3><p class="muted">Архитектура · security · performance</p></div>
  <div v-click class="flat-card"><h3>Done</h3><p class="muted">Какими проверками докажем результат</p></div>
</div>

<div v-click class="statement" style="margin-top: 1.25rem">Этого уже хватает, чтобы агент перестал додумывать смысл задачи на ходу.</div>

<!--
Время: 1:40.
Не нужна идеальная энциклопедия.
Даже короткая spec ценна, если она фиксирует поведение, scope, ограничения и definition of done.
-->

---

# Контекст агента: что уже внутри, а что подтягиваем по ходу

<div class="two-col wide-right">
  <div>
    <div v-click class="flat-card">
      <h3>Сразу доступно агенту</h3>
      <p>AGENTS.md · global/team memory · system/project rules · текущий task / spec · описание доступных tools / MCP</p>
    </div>
    <div v-click class="flat-card" style="margin-top: 1.15rem">
      <h3>Подгружается по мере работы</h3>
      <p>Code search · RAG · MCP responses · Confluence / docs · PR / Git history · logs / traces · deep references из skills</p>
    </div>
    <div v-click class="statement" style="margin-top: 1.3rem">Не максимальный контекст. Нужный контекст для текущего решения.</div>
  </div>
  <div>
    <div v-click class="image-frame"><img src="/assets/context-static-dynamic.png" alt="Статический и динамически получаемый контекст агента" /></div>
    <p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 4.</p>
  </div>
</div>

<!--
Время: 2:00.
«Сразу доступно» не означает, что содержимое всех tools или всей документации целиком лежит в prompt.
На старте агент знает базовые правила, текущую задачу и доступные возможности.
Тяжёлый контекст — ответы MCP, история, логи, deep refs — подтягивается только когда нужен.
-->

---

# Progressive disclosure: контекст раскрывается слоями

<div class="click-flow">
  <div v-click class="click-node"><b>AGENTS.md</b><span>куда смотреть</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Skill description</b><span>нужен ли workflow</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>SKILL.md</b><span>default path + stop conditions</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Refs / scripts</b><span>только если понадобились</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.8rem">Не грузим 50 страниц «на всякий случай» — оставляем агенту место думать о текущей задаче.</div>

<!--
Время: 1:30.
Это ответ на проблему «забил контекст до первой правки».
-->

---

# Хороший skill — это процедура

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Один класс задач</strong><span>Например, performance review change</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Default path</strong><span>Порядок действий и stop conditions</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Scripts</strong><span>Детерминированное не поручаем рассуждению</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Objective output</strong><span>Отчёт и проверки вместо «кажется, всё хорошо»</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.55rem">Если задача без skill решается так же хорошо и стабильно — skill, скорее всего, не нужен.</div>

<!--
Время: 1:35.
Сначала дать положительное определение: skill — повторяемая процедура.
Пример из PR #66: performance-check выбирает нужные проверки и порядок,
но не дублирует архитектуру проекта внутри skill.
-->

---

# Не всё — skill

<div class="two-col">
  <pre v-click class="repo-tree">❌ skills/
├─ react-best-practices/
├─ webpack-rules/
├─ microfrontend-rules/
├─ memory-rules/
├─ tables/
├─ lazy-loading/
├─ hooks/
└─ optimization/</pre>

  <pre v-click class="repo-tree">✅ docs/
├─ architecture/
│  └─ microfrontends.md
└─ performance.md
✅ AGENTS.md / rules/
└─ стабильные ограничения
✅ skills/
└─ performance-check/</pre>
</div>

<div v-click class="statement" style="margin-top: 1.35rem">Знание → docs · ограничение → rule · процедура → skill · доступ к системе → tool</div>

<!--
Время: 1:35.
После определения skill показать антипример: если это не процедура, не надо складывать знание в skills/.
-->

---

# Субагенты: делегируем независимый контекст

<div class="subagent-flow">
  <div v-click class="sub-root"><b>Root agent</b><span>держит цель, state и решение</span></div>
  <div class="sub-branches">
    <div v-click class="sub-card"><b>Explore code</b><span>read-only</span></div>
    <div v-click class="sub-card"><b>Tests / perf</b><span>read-only review</span></div>
    <div v-click class="sub-card"><b>Docs / constraints</b><span>read-only</span></div>
  </div>
  <div v-click class="sub-result"><b>Короткие результаты</b><span>возвращаются root-agent'у, а не смешиваются в один гигантский контекст</span></div>
</div>

<div class="pattern-pair" style="margin-top: 1.4rem">
  <div v-click class="pattern-good"><b>✓ Да</b><span>независимые ветки исследования, разные области, разные роли</span></div>
  <div v-click class="pattern-bad"><b>✕ Нет</b><span>один файл, общий mutable state, последовательная задача</span></div>
</div>

<!--
Время: 1:45.
Субагент — способ изолировать контекст, не размножить хаос.
Для demo безопасный default — исследовательские subagents read-only.
-->

---
layout: center
---

<div v-click class="meme-image">
  <img src="/assets/2.jfif" alt="Мем про наблюдение за работой нескольких агентов" style="height: 570px; max-height: 64vh;" />
</div>

<div v-click class="meme-caption" style="margin-top: 1rem">А потом так сидим и смотрим, как всё крутится</div>

<!--
Время: 0:35.
Короткая эмоциональная пауза после orchestration/subagents.
Не объяснять мем дольше одной фразы.
-->

---

# Backpressure: среда не позволяет соврать об успехе

<div class="roadmap">
  <div v-click><b>01</b><strong>Types</strong><span>Несовместимость видна сразу</span></div>
  <div v-click><b>02</b><strong>Architecture</strong><span>Инварианты стали executable</span></div>
  <div v-click><b>03</b><strong>Tests</strong><span>Проверяем поведение, а не уверенность</span></div>
  <div v-click><b>04</b><strong>Perf</strong><span>Bundle / memory budget ловит regression</span></div>
  <div v-click><b>05</b><strong>Review</strong><span>Человек принимает смысл и риск</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.25rem">Один хороший gate полезнее десяти строк «обязательно будь внимателен».</div>
<div v-click class="muted" style="margin-top: 0.9rem; font-size: 1.08rem; text-align: center">Пусть флагманская модель находит хоть 100× больше проблем — она всё равно не знает сама, что считается «правильно» именно в вашем проекте.</div>

<!--
Время: 1:55.
Не тезис «слабая модель лучше сильной».
Тезис: frontier intelligence не заменяет deterministic feedback и project-specific Definition of Done.
Модель не должна сама решать, прошла ли она DoD.
-->

---

# Eval — тест не кода, а агентной системы

<div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px">
  <div v-click class="flat-card">
    <h3>Test</h3>
    <p>код / приложение</p>
    <p class="muted">route lazy? · bundle budget? · memory leak?</p>
  </div>
  <div v-click class="flat-card">
    <h3>Skill</h3>
    <p>процедура для агента</p>
    <p class="muted">как выполнить класс задач · например performance-check</p>
  </div>
  <div v-click class="flat-card">
    <h3>Eval</h3>
    <p>task + repo state + harness + graders</p>
    <p class="muted">Task · invariants · machine checks · failure classes</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.55rem">Test проверяет продукт. Skill помогает агенту действовать. Eval проверяет агента + harness на воспроизводимой задаче.</div>

<!--
Время: 1:35.
Не путать eval с unit/e2e test.
Eval нужен, чтобы сравнивать одну и ту же модель на одной и той же задаче
между baseline-repository и agent-ready repository.
-->

---

# Evals: один реальный фейл → regression case

<div class="click-flow eval-flow">
  <div v-click class="click-node"><b>Real failure</b><span>реальный промах агента</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Eval case</b><span>task + fixed repo + graders</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Baseline</b><span>как harness ведёт себя сейчас</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Harness change</b><span>docs / rule / skill / tool</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Candidate</b><span>те же graders</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Regression suite</b><span>кейс остаётся с нами</span></div>
</div>

<div class="two-col" style="margin-top: 1.2rem">
  <div v-click class="flat-card">
    <h3>Сравниваем честно</h3>
    <p class="muted">same task · fixed repo state · same graders · clean context · несколько trials</p>
  </div>
  <div v-click class="flat-card">
    <h3>Начинаем с малого</h3>
    <p class="muted">objective / machine graders · representative dataset · без LLM judge, dashboard и eval-platform</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.05rem">Skill — гипотеза об улучшении harness. Eval показывает, действительно ли он помогает.</div>

<!--
Время: 2:00.
На сцене — lightweight representative case, а не статистический benchmark.
Недетерминированность требует нескольких trials, но сейчас не строим отдельную eval-platform.
-->

---

# Harness живёт на уровне команды

<div class="two-col wide-left">
  <pre v-click class="repo-tree">agent-platform/
├─ docs/
├─ rules/
├─ skills/
│  └─ performance-check/
├─ evals/
├─ templates/
└─ owners.yaml</pre>
  <div v-click>
    <ul>
      <li>owners для доменных правил и skills;</li>
      <li>versioning и release notes;</li>
      <li>CI валидирует структуру и ссылки;</li>
      <li>ошибка оставляет test / eval / rule;</li>
      <li>метрики: rework, bugs, cycle time.</li>
    </ul>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.5rem">Команду убеждает снижение возвратов и регрессий, а не красивое AI-demo.</div>

<!--
Время: 1:40.
Структура примерная. Главное — ownership и lifecycle.
Иначе через полгода получим второй legacy, только уже в .agents/.
-->

---
layout: center
---

# Нужно ли ещё уметь писать код?

<div v-click class="statement">Чем сильнее инженер, тем выше его <span class="green">мультипликатор от AI</span></div>

<div class="flow" style="grid-template-columns: repeat(3, 1fr)">
  <div v-click class="step"><strong>Отличить инвариант</strong><span>от случайности legacy</span></div>
  <div v-click class="step"><strong>Поставить границы</strong><span>чтобы агент не решал лишнее</span></div>
  <div v-click class="step"><strong>Сохранить знание</strong><span>в spec, docs, test, rule или eval</span></div>
</div>

<!--
Время: 1:30.
Связать с личным челленджем из начала:
кода руками может быть меньше, инженерного суждения требуется больше.
-->

---

# Agent-ready checklist

<div class="checklist">
  <div v-click>Есть короткая точка входа</div>
  <div v-click>Документация живёт рядом с кодом</div>
  <div v-click>Pattern и anti-pattern названы явно</div>
  <div v-click>Change начинается с versioned spec</div>
  <div v-click>Контекст раскрывается постепенно</div>
  <div v-click>Knowledge, rules, skills и tools не смешаны</div>
  <div v-click>Результат проверяет среда</div>
  <div v-click>Реальные ошибки становятся eval cases</div>
</div>

<div v-click class="muted" style="margin-top: 1.3rem; font-size: 1.05rem">Для большой команды: owners · versioning · CI · метрики внедрения.</div>

<!--
Время: 1:10.
Слайд для фотографии и сборка всей теории перед live-demo.
После него теорию уже не добавлять.
-->

---
layout: center
---

<div class="eyebrow">Практика · 20 минут</div>

<div v-click class="huge">Одна задача.<br><span class="green">Одна модель. Две среды.</span></div>

<p v-click class="muted" style="font-size: 1.4rem; margin-top: 2rem">Сравниваем не интеллект модели, а окружение, в котором она принимает решения.</p>

<!--
Время: 0:40.
Переключиться в IDE.
Одинаковые model settings и одна продуктовая задача.
Не позиционировать demo как benchmark модели.
-->

---

# Application Security: на первый взгляд простая задача

<div v-click class="big-quote" style="font-size: 43px">«Добавь новую страницу / microfrontend Application Security по аналогии с существующей реализацией»</div>

<div class="checklist" style="margin-top: 1.2rem">
  <div v-click>canonical frontend architecture</div>
  <div v-click>canonical microfrontend runtime</div>
  <div v-click>route-level code splitting</div>
  <div v-click>no bundle regression</div>
  <div v-click>no memory regression</div>
  <div v-click>architecture / performance checks</div>
</div>

<div v-click class="statement" style="margin-top: 1rem">Сложность начинается в словах «сделай production-ready».</div>

<!--
Время: 1:20.
Сначала показать только формулировку задачи, затем по кликам раскрыть реальный Definition of Done.
-->

---

# Run A vs Run B

<div class="two-col">
  <div v-click class="flat-card bad">
    <h3>Run A · main</h3>
    <p>“Add a new Application Security page and microfrontend like the neighboring implementation.”</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B · demo/agent-ready</h3>
    <p>“Implement openspec/changes/add-application-security/”</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.5rem">Same model · Same product task · Different repository environment</div>

<!--
Время: 1:00.
Run A: не коучить модель к правильному решению.

Speaker-only trace checklist:
- сколько файлов / PR открыл до первой правки;
- что считает canonical;
- какие checks запускает;
- когда говорит done;
- есть ли evidence или только self-assessment.
-->

---

# Что изменилось между Run A и Run B

<div class="two-col">
  <pre v-click class="repo-tree">RUN A
repo
  ↓
neighboring code
  ↓
агент сам угадывает правила</pre>

  <pre v-click class="repo-tree">RUN B
AGENTS.md
  ↓
canonical docs
  ↓
spec
  ↓
implementation
  ↓
architecture / bundle / memory feedback</pre>
</div>

<div v-click class="statement" style="margin-top: 1.35rem">Мы не сделали модель умнее. Мы уменьшили количество вещей, которые ей приходится угадывать.</div>

<!--
Время: 6:00.
Коротко открыть реальные артефакты agent-ready ветки:
AGENTS.md → canonical docs → spec → scripts/check-* → performance-check.

Если gate падает — показать fail → correction loop.
Не подсказывать модели конкретное решение в prompt.
-->

---
class: compact-table
---

# Сравниваем наблюдаемые результаты

<table class="comparison">
  <thead><tr><th>Смотрим</th><th>Baseline</th><th>Agent-ready</th></tr></thead>
  <tbody>
    <tr v-click><td>Architecture</td><td>агент выбирает из истории</td><td>canonical docs + gate</td></tr>
    <tr v-click><td>Loading</td><td>может не проверить</td><td>bundle gate</td></tr>
    <tr v-click><td>Memory</td><td>может не заметить</td><td>MemLab scenario</td></tr>
    <tr v-click><td>Scope</td><td>может расползтись</td><td>ограничен spec</td></tr>
    <tr v-click><td>Done</td><td>self-assessment</td><td>machine evidence</td></tr>
  </tbody>
</table>

<div v-click class="statement" style="margin-top: 1.3rem">Harness не гарантирует идеальный ответ. Он делает ошибку заметной и исправимой.</div>

<!--
Время: 3:00.
Это demonstration of mechanism, не benchmark модели и не доказательство по одному запуску.

Speaker-only fallback, если live demo ломается:
- saved trace;
- saved diff;
- failed gate с actionable feedback;
- passed gates после исправления.

Не показывать отдельный fallback-слайд аудитории.
-->

---
layout: center
---

<div class="statement">Не ждите идеальную модель</div>

<div v-click class="huge green" style="margin-top: 1.4rem">Сначала сделайте проект<br>понятным агенту</div>

<p v-click class="muted" style="margin-top: 2.1rem; font-size: 1.25rem">Модель определяет потолок. Harness превращает удачный запуск в инженерный процесс.</p>

<!--
Время: 0:50.
После практики — только этот финальный вывод.
Вернуться к коту и пожарному.
-->
