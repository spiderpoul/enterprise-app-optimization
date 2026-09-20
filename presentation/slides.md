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
---

# Кто я

<div class="speaker-grid">
  <div>
    <div class="eyebrow">Павел · enterprise-разработка</div>
    <div v-click class="speaker-fact"><b>9+ лет</b><span>разрабатываю enterprise-проекты</span></div>
    <div v-click class="speaker-fact"><b>200+</b><span>технических собеседований — и продолжаю проводить</span></div>
    <div v-click class="speaker-fact"><b>Челлендж</b><span>как только у нас появилась агентная разработка — перестать писать код руками</span></div>
    <div v-click class="statement" style="margin-top: 1.5rem">Пока держусь 🙂</div>
  </div>
  <div v-click class="speaker-photo">
    <img src="https://avatars.githubusercontent.com/u/23116531?v=4" alt="Фото Павла" />
    <div class="source">Временно использую фото из GitHub-профиля — заменим на приложенную фотографию.</div>
  </div>
</div>

<!--
Время: 1:00.
Не превращать в резюме. Последний пункт — мостик к докладу:
если меньше пишешь руками, инженерного решения и ответственности становится не меньше, а больше.
-->

---
layout: center
---

<div class="meme-image meme-spider">
  <img src="/assets/1.jfif" alt="Мем с Питером Паркером и Тони Старком про зависимость от Claude" />
</div>

<div v-click class="meme-caption">План A: Claude Code. План B: попросить доступ к Claude Code.</div>

<!--
Время: 0:50.
Шутка → тезис: если весь AI-процесс держится на одном внешнем инструменте, это SPOF, а не engineering strategy.
-->

---
---

# Кому знакомо?

<div class="grid-4">
  <div v-click class="flat-card bad">
    <h3>«Быстрее самому»</h3>
    <p class="muted">Объяснял задачу дольше, чем писал бы фикс</p>
  </div>
  <div v-click class="flat-card bad">
    <h3>«Опять не туда»</h3>
    <p class="muted">Нашёл соседний код — и выбрал именно legacy</p>
  </div>
  <div v-click class="flat-card bad">
    <h3>«Зачем 30 файлов?»</h3>
    <p class="muted">Контекст уже забит, а первая правка ещё не сделана</p>
  </div>
  <div v-click class="flat-card bad">
    <h3>«Готово»</h3>
    <p class="muted">Тесты не запускал, ограничения не проверил, зато уверен</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.7rem">Это не обязательно «глупая модель». Часто ей просто негде узнать, что правильно именно у нас.</div>

<!--
Время: 1:20.
Поднять руки: кто узнаёт хотя бы два пункта.
Главная мысль — не оправдывать модель, а поменять объект инженерной работы: не prompt, а среду вокруг агента.
-->

---
---

# Проект, на котором это особенно заметно: Kaspersky Security Center

<div class="two-col wide-left">
  <div>
    <div v-click class="metric">10+ команд</div>
    <div v-click class="metric" style="margin-top: 1.1rem">25+ плагинов</div>
    <div v-click class="metric" style="margin-top: 1.1rem">1000+ страниц</div>
  </div>
  <div>
    <div v-click class="flat-card">
      <h3>KSC</h3>
      <p>Платформа централизованного управления защитой и корпоративной инфраструктурой.</p>
      <p class="muted">Три вида поставки: XDR · Cloud · on-prem</p>
    </div>
    <div v-click class="flat-card" style="margin-top: 1.2rem">
      <h3>Frontend</h3>
      <p>Микрофронты · Node.js · React · Hexa UI</p>
      <p class="muted">Проекту 9+ лет — значит, рядом живут несколько поколений решений.</p>
    </div>
  </div>
</div>

<!--
Время: 1:30.
Это не попытка похвастаться размером. Масштаб объясняет, почему «прочитай репозиторий и разберись» — плохая постановка даже для сильной модели.
-->

---
---

# Почему enterprise сложнее для агента

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Масштаб</strong><span>Десятки команд, сотни модулей, пересекающиеся зависимости</span></div>
  <div v-click class="step"><span class="n">02</span><strong>История</strong><span>Legacy, reverts, временные решения, устаревшие технологии</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Процессы</strong><span>CI, security, owners, release flow и внутренние инструменты</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Границы</strong><span>Код, логи и документацию часто нельзя отправлять наружу</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.7rem">Большое context window помогает прочитать больше. Оно не объясняет, что из прочитанного — текущий стандарт.</div>

<!--
Время: 1:30.
В закрытом security-контуре внешняя модель может быть запрещена полностью или доступна с сильно урезанными правами:
без внутренних MCP, Confluence, логов, трейсинга и production-like данных.
-->

---
---

# Поэтому внутренняя модель — не «запасной вариант»

<div class="two-col">
  <div v-click class="flat-card">
    <h3 class="green">Что она получает внутри контура</h3>
    <ul>
      <li>репозиторий и историю изменений;</li>
      <li>внутренние docs / Confluence / code search;</li>
      <li>MCP и корпоративные инструменты;</li>
      <li>E2E-логи, traces, дампы и отчёты проверок.</li>
    </ul>
  </div>
  <div v-click class="flat-card">
    <h3 class="green">Что получает команда</h3>
    <ul>
      <li>данные не уходят во внешний сервис;</li>
      <li>единый управляемый набор прав;</li>
      <li>воспроизводимый workflow для всех;</li>
      <li>возможность встроить агента в существующий SDLC.</li>
    </ul>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.6rem">В enterprise доступ к правильному контексту часто важнее доступа к самой модной модели.</div>

<!--
Время: 1:30.
Не противопоставлять «облако плохое / on-prem хорошее».
Если внешняя модель разрешена и интегрирована — отлично. Но доклад про случай, когда этого нет.
-->

---
---

# Модели уже достаточно сильные, чтобы начать

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

<div v-click class="statement" style="margin-top: 1.8rem">Это не «open-weight победил Claude». Это сигнал: разрыв уже не настолько большой, чтобы откладывать engineering вокруг модели.</div>

<p v-click class="source">Источник: Artificial Analysis, данные на сентябрь 2026. Разные benchmark-наборы и режимы не равны реальной работе в вашем репозитории.</p>

<!--
Время: 1:40.
Не продавать leaderboard.
Смысл: даже если внутренняя модель не №1, она уже умеет исследовать код, делать bounded changes, писать тесты и выполнять процедуры.
Проверять нужно не «голую модель», а agent system в вашем репозитории.
-->

---
---

# Модель задаёт потолок. Harness — траекторию

<div class="two-col wide-right">
  <div>
    <div v-click class="metric">Модель</div>
    <p v-click>рассуждает, пишет код и выбирает следующий шаг</p>
    <div v-click class="metric" style="margin-top: 1.35rem">Harness</div>
    <p v-click>подсовывает нужный контекст, ограничения, действия и обратную связь</p>
    <div v-click class="statement" style="margin-top: 1.4rem">Не обязательно ждать ещё +5 пунктов benchmark. Сначала уберите неопределённость вокруг модели.</div>
  </div>
  <div>
    <div v-click class="image-frame"><img src="/assets/harness-anatomy.png" alt="Harness anatomy" /></div>
    <p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 7. Соотношение 10/90 — метафора авторов, не измерение.</p>
  </div>
</div>

<!--
Время: 2:00.
Сильная модель тоже может переусложнить задачу, зациклиться, захламить контекст или уверенно выбрать не тот паттерн.
Harness не заменяет интеллект — он делает решения воспроизводимыми и ограничивает пространство ошибки.
-->

---
layout: center
---

<div class="meme-image meme-rescue">
  <img src="/assets/3.png" alt="Мем: harness спасает модель из горящего legacy" />
</div>

<div v-click class="meme-caption">Модель: «Я разобрался». Harness: «Сначала AGENTS.md. Потом проверки.»</div>

<!--
Время: 0:45.
Мем как переход к конкретике: обвязку не «сгенерит магически агент».
Разработчик должен определить, что давать модели, чем ограничивать и как проверять.
-->

---
---

# Соседний код — это не стандарт. Это археология

<div class="timeline">
  <div v-click class="timeline-item"><b>PR #12 / #13</b><span>Module Federation + shared / eager React</span></div>
  <div v-click class="timeline-arrow">→</div>
  <div v-click class="timeline-item"><b>PR #25</b><span>Ещё одна версия shared runtime</span></div>
  <div v-click class="timeline-arrow">→</div>
  <div v-click class="timeline-item bad"><b>PR #26</b><span>Revert</span></div>
  <div v-click class="timeline-arrow">→</div>
  <div v-click class="timeline-item"><b>PR #31</b><span>window externals вместо Federation</span></div>
</div>

<div v-click class="flat-card" style="margin-top: 1.6rem">
  <h3>Промпт: «Добавь новый microfrontend как соседний»</h3>
  <p class="muted">Какой соседний? Какой период истории? Как отличить действующий паттерн от уже отменённого?</p>
</div>

<div v-click class="statement" style="margin-top: 1.25rem">Чем сильнее модель, тем убедительнее она может обобщить неправильный пример.</div>

<!--
Время: 2:00.
Это реальный advanced-пример из истории demo-репозитория.
Он сильнее синтетического «плохая сортировка в таблице»: архитектурно правдоподобных путей несколько.
-->

---
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
---

# Spec-Driven Development: сначала договор о change

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
Минимальная спека должна убрать продуктовую и архитектурную неоднозначность до написания кода.
-->

---
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

# В коде не должно появляться нового смысла

<div class="two-col" style="margin-top: 1.5rem">
  <div v-click class="flat-card">
    <h3 class="green">До реализации уже определено</h3>
    <p>Что меняется · что не меняется · критерии готовности · обязательные ограничения</p>
  </div>
  <div v-click class="flat-card warn">
    <h3 class="yellow">Код выбирает</h3>
    <p>Локальную форму реализации, но не изобретает продуктовую семантику на ходу</p>
  </div>
</div>

<div class="pattern-pair" style="margin-top: 1.5rem">
  <div v-click class="pattern-good"><b>✓ Хорошо определено</b><span>lazy route обязателен · один shared React · manifest id уникален</span></div>
  <div v-click class="pattern-bad"><b>✕ Плохо определено</b><span>«сделай красиво» · «как-нибудь быстро» · «примерно как соседний»</span></div>
</div>

<!--
Время: 1:40.
«Новый смысл» — не каждая строка кода.
Это продуктовые решения, архитектурные инварианты и критерии приёмки, которые модель не должна придумывать сама.
-->

---
---

# Контекст агента: постоянный и по запросу

<div class="two-col wide-right">
  <div>
    <div v-click class="flat-card">
      <h3>На старте</h3>
      <p>AGENTS.md · global/team memory · доступные tools · обязательные gates</p>
    </div>
    <div v-click class="flat-card" style="margin-top: 1.15rem">
      <h3>По мере работы</h3>
      <p>Code search · RAG · MCP · Confluence · PR history · logs / traces · deep references</p>
    </div>
    <div v-click class="statement" style="margin-top: 1.3rem">Не максимум данных. Минимум, достаточный для текущего решения.</div>
  </div>
  <div>
    <div v-click class="image-frame"><img src="/assets/context-static-dynamic.png" alt="Шесть типов статического и динамического агентного контекста" /></div>
    <p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 4.</p>
  </div>
</div>

<!--
Время: 2:00.
Слайд специально без терминов Procedures/Capabilities.
Контекст не обязан физически лежать в prompt: важно, что агент знает, где его получить и когда.
-->

---
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
Не делать зоопарк. Skill имеет смысл, когда это повторяемая процедура, а не ещё один кусок документации.
-->

---
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
Пример из PR #66: performance-check выбирает нужные проверки и порядок,
но не дублирует архитектуру проекта внутри skill.
-->

---
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
---

# Backpressure: среда не позволяет соврать об успехе

<div class="roadmap">
  <div v-click><b>01</b><strong>Types</strong><span>Несовместимость видна сразу</span></div>
  <div v-click><b>02</b><strong>Architecture</strong><span>Инварианты стали executable</span></div>
  <div v-click><b>03</b><strong>Tests</strong><span>Проверяем поведение, а не уверенность</span></div>
  <div v-click><b>04</b><strong>Perf</strong><span>Bundle / memory budget ловит regression</span></div>
  <div v-click><b>05</b><strong>Review</strong><span>Человек принимает смысл и риск</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.5rem">Один хороший gate полезнее десяти строк «обязательно будь внимателен».</div>

<!--
Время: 1:50.
Для более слабой модели backpressure особенно ценен:
короткий шаг → быстрый сигнал → исправление → ограниченное число повторов → stop condition.
-->

---
---

# Evals: один реальный фейл → regression case

<div class="click-flow eval-flow">
  <div v-click class="click-node"><b>Фейл</b><span>агент выбрал плохой путь</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Eval case</b><span>task + repo state + graders</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Baseline</b><span>как система ведёт себя сейчас</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Harness change</b><span>rule / docs / skill / tool</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Candidate</b><span>те же objective graders</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.55rem">Skill — гипотеза об улучшении. Eval показывает, помог он или просто добавил ещё текста.</div>

<!--
Время: 1:50.
На сцене будет 1 task × 2 runs — демонстрация механизма, а не benchmark.
В реальной команде кейсы накапливаются из реальных ошибок и прогоняются в clean trials.
-->

---
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
layout: center
---

<div class="eyebrow">Практика · 20 минут</div>

<div v-click class="huge">Одна задача.<br><span class="green">Одна модель. Две среды.</span></div>

<p v-click class="muted" style="font-size: 1.4rem; margin-top: 2rem">Сравниваем не интеллект модели, а окружение, в котором она принимает решения.</p>

<!--
Время: 0:40.
Переключиться в IDE.
Одинаковые model settings и продуктовая задача; независимая переменная — repository harness.
-->

---
---

# Задача: новый Application Security microfrontend

<div v-click class="big-quote" style="font-size: 48px">«Добавь новую страницу Application Security и microfrontend как в соседней реализации»</div>

<div class="two-col" style="margin-top: 1.5rem">
  <div v-click class="flat-card bad">
    <h3>Run A · main</h3>
    <p>Никакого подготовленного harness.</p>
    <p class="muted">Наблюдаем, куда модель пойдёт сама.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B · demo/agent-ready</h3>
    <p>Тот же продуктовый change, но проект уже описывает правильный путь.</p>
    <p class="muted">Prompt: Implement openspec/changes/add-application-security/</p>
  </div>
</div>

<!--
Время: 1:00.
Run A exact prompt:
Add a new Application Security page and microfrontend like the neighboring implementation.

Run B exact prompt:
Implement openspec/changes/add-application-security/.
-->

---
---

# Run A: смотрим не на текст ответа, а на trace

<div class="grid-4">
  <div v-click class="flat-card"><h3>Что читает</h3><p class="muted">Сколько файлов / PR открыл до первой правки</p></div>
  <div v-click class="flat-card"><h3>Что считает нормой</h3><p class="muted">Federation? externals? registry?</p></div>
  <div v-click class="flat-card"><h3>Что проверяет</h3><p class="muted">Build? architecture? bundle? memory?</p></div>
  <div v-click class="flat-card"><h3>Где говорит «готово»</h3><p class="muted">Есть ли доказательство или только self-assessment</p></div>
</div>

<div v-click class="statement" style="margin-top: 1.6rem">PR archaeology показывает: правдоподобных исторических решений несколько.</div>

<!--
Время: 4:00.
Показывать историю действий и diff, а не ждать модель в тишине.
Подсветить PR #12/#13/#25/#26/#31 и открытые perf PR #52–#55/#64 как реальные конкурирующие сигналы.
-->

---
---

# Что уже лежит в agent-ready ветке

<div class="grid-4">
  <div v-click class="flat-card"><h3>Knowledge</h3><p>AGENTS.md + frontend / microfrontend / performance docs</p></div>
  <div v-click class="flat-card"><h3>Change contract</h3><p>Spec для Application Security</p></div>
  <div v-click class="flat-card"><h3>Executable constraints</h3><p>Architecture + bundle + lazy route checks</p></div>
  <div v-click class="flat-card"><h3>Feedback</h3><p>Route-specific MemLab + performance workflow</p></div>
</div>

<div v-click class="statement" style="margin-top: 1.6rem">Мы не подсказываем модели решение в prompt. Мы изменяем репозиторий так, чтобы правильный путь был наблюдаемым.</div>

<!--
Время: 3:00.
Коротко открыть артефакты из PR #66:
AGENTS.md → docs → spec → scripts/check-* → performance-check skill.
-->

---
---

# Run B: модель сама проходит по harness

<div class="click-flow">
  <div v-click class="click-node"><b>AGENTS.md</b><span>карта + gates</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Canonical docs</b><span>текущая архитектура</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Change spec</b><span>scope + DoD</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Implement</b><span>bounded change</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Feedback loop</b><span>architecture · bundle · memory</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.55rem">Если gate падает — агент получает конкретную причину, а не совет «подумай ещё».</div>

<!--
Время: 6:00.
Не коучить модель в сторону решения.
Показать хотя бы один fail → correction loop, если он возникает; иначе использовать сохранённый rehearsal artifact.
-->

---
class: compact-table
---

# Сравниваем наблюдаемые результаты

<table class="comparison">
  <thead><tr><th>Смотрим</th><th>Run A</th><th>Run B</th></tr></thead>
  <tbody>
    <tr v-click><td>Architecture / runtime</td><td>Что модель выбрала из истории</td><td>Соответствует canonical docs + gate</td></tr>
    <tr v-click><td>Route chunking / bundle</td><td>Проверила ли вообще</td><td>Budget проверяется автоматически</td></tr>
    <tr v-click><td>Memory / navigation</td><td>Самооценка или generic test</td><td>Route-specific MemLab scenario</td></tr>
    <tr v-click><td>Scope</td><td>Может расползтись</td><td>Ограничен spec</td></tr>
    <tr v-click><td>«Готово»</td><td>Модель решила сама</td><td>Есть inspectable evidence</td></tr>
  </tbody>
</table>

<div v-click class="statement" style="margin-top: 1.3rem">Мы не сделали модель умнее. Мы уменьшили число решений, которые ей приходится угадывать.</div>

<!--
Время: 3:00.
Не делать статистический вывод по двум запускам.
Это demonstration of mechanism; устойчивость подтверждают eval trials.
-->

---
---

# Если live demo решит жить своей жизнью

<div class="grid-4">
  <div v-click class="flat-card"><h3>Trace</h3><p class="muted">Сохранённая история исследования для обоих runs</p></div>
  <div v-click class="flat-card"><h3>Diff</h3><p class="muted">Финальные изменения Run A / Run B</p></div>
  <div v-click class="flat-card"><h3>Failed gate</h3><p class="muted">Реальный пример actionable feedback</p></div>
  <div v-click class="flat-card"><h3>Passed gates</h3><p class="muted">Evidence после исправления</p></div>
</div>

<div v-click class="statement" style="margin-top: 1.55rem">Демо должно пережить недетерминированность модели.</div>

<!--
Время: 0:50.
Это speaker fallback, но аудитории можно показать одной фразой:
инженерный эксперимент не должен зависеть от того, повезло ли сегодня live-run.
-->

---
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
Слайд для фотографии.
-->

---
layout: center
---

<div class="statement">Не ждите идеальную модель</div>

<div v-click class="huge green" style="margin-top: 1.4rem">Сначала сделайте проект<br>понятным агенту</div>

<p v-click class="muted" style="margin-top: 2.1rem; font-size: 1.25rem">Модель определяет потолок. Harness превращает удачный запуск в инженерный процесс.</p>

<!--
Время: 0:50.
Вернуться к коту и пожарному.
Финальная мысль: сильная модель полезна, но enterprise-эффект появляется, когда знания, ограничения и feedback принадлежат команде, а не одной сессии.
-->
