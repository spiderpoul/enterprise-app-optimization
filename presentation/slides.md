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
Я Павел Уваров, Software Expert в Kaspersky. Больше девяти лет работаю с enterprise-разработкой,
провёл больше двухсот технических собеседований и продолжаю это делать.
Мой личный челлендж после появления агентной разработки — перестать писать код руками.
Пока не получилось. И это хороший мостик: кода руками может стать меньше,
но инженерного понимания, чтобы поставить задачу и принять результат, меньше не становится.
-->

---

# Содержание

<div class="agenda-grid">
  <div v-click><b>01</b><span>Почему модель<br>не знает норму проекта</span></div>
  <div v-click><b>02</b><span>Как собрать harness<br>для большого legacy</span></div>
  <div v-click><b>03</b><span>Как превратить промахи<br>в feedback и evals</span></div>
  <div v-click><b>04</b><span>Практика: одна модель,<br>две среды</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.8rem">Не ищем «лучшую модель». Учимся делать проект понятным агенту.</div>

<!--
Время: 0:45.
Сначала быстро задаю маршрут. Начнём с причины: даже умная модель не знает,
какой из исторических примеров в проекте сейчас считается правильным.
Потом разберём harness: контекст, ограничения, процедуры и feedback.
В конце покажу это не как теорию, а на одной задаче в двух одинаковых моделях и разных средах.
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
      <p class="muted">Команды, требования и архитектурные подходы менялись — в коде остаются следы разных эпох.</p>
    </div>
  </div>
  <div class="project-metrics">
    <div v-click class="metric"><b>10+</b><span>команд</span></div>
    <div v-click class="metric"><b>25+</b><span>плагинов</span></div>
    <div v-click class="metric"><b>1000+</b><span>страниц</span></div>
  </div>
</div>

<p v-click class="source">Настоящий enterprise-гигант.</p>

<!--
Время: 1:30.
Это Kaspersky Security Center — большой живой продукт, а не специально подготовленный demo-repo.
Цифры нужны не ради масштаба: здесь много команд, плагинов и экранов, а продукт развивается больше девяти лет.
Поэтому код хранит историю решений. Для агента просьба «прочитай код и разберись» — уже отдельная исследовательская задача:
он видит рядом и правильные сегодняшние решения, и следы старых подходов.
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

<p v-click class="source">Числа — баллы Artificial Analysis Intelligence Index: 45 / 40 / 38. Источник: Artificial Analysis, сентябрь 2026. Benchmark показывает общий уровень, но не заменяет проверку на вашем репозитории.</p>

<!--
Время: 1:40.
Здесь числа — не проценты и не скорость. Это баллы Artificial Analysis Intelligence Index,
то есть сравнительный benchmark общего уровня моделей. Поэтому не продаю leaderboard и не утверждаю,
что внутренняя модель «победила Claude». Тезис проще: модели, которые можно развернуть внутри контура,
уже достаточно сильны для полезной разработки. А доступ к внутреннему коду, документации и хороший harness
нередко компенсируют разницу в чистом интеллекте. Настоящую проверку всё равно делаем на своём репозитории.
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

# Интеллект модели ≠ знание нормы проекта

<div class="two-col wide-left">
  <div>
    <div v-click class="big-quote" style="font-size: 39px">Код — это архив решений, а не инструкция «как правильно сегодня».</div>
    <div v-click class="flat-card" style="margin-top: 1.15rem">
      <h3>Модель видит правдоподобные примеры</h3>
      <p class="muted">Старые и новые реализации, временные обходы и откаты могут одинаково убедительно выглядеть в поиске по коду.</p>
    </div>
    <div v-click class="statement" style="margin-top: 1.1rem">Без явно названного golden path она не узнает, какой исторический паттерн сегодня считается правильным.</div>
  </div>
  <div v-click class="meme-image">
    <img src="/assets/office-legacy-patterns.jpg" alt="Офисный мем о выборе устаревшего паттерна" style="height: 430px; max-height: 49vh;" />
  </div>
</div>

<!--
Время: 2:00.
Главная мысль: интеллект модели не даёт ей знания о том, какой исторический паттерн сегодня считается правильным.
Для неё код — это архив: старое, новое, временный обход и откат выглядят как правдоподобные примеры.
Без явно названного golden path она выберет не «правильное», а просто убедительное решение.

Мем для замены: Dwight «False» — https://tenor.com/view/the-office-dwight-false-gif-5220144 .
Он точнее текущего кадра: агент уверенно выбрал пример из истории, а команда отвечает «False».
Картинку не генерируем; перед финальной сборкой нужно скачать или легально подготовить статичный кадр из выбранного источника.
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
Без harness агенту приходится каждый раз угадывать четыре вещи: где искать контекст,
какой паттерн считать нормой, где заканчивается задача и как доказать, что она завершена.
Это не «недостаток промпта», а отсутствующие артефакты проекта. Дальше покажу, из чего их собрать.
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
Это основная карта доклада. Context отвечает на вопрос «что агенту нужно знать сейчас»;
constraints — «что нельзя нарушать»; procedures — «как повторять работу»; actions — «что он может сделать»;
feedback — «как среда проверит результат». Сквозной принцип один: не загружаем всю организацию знаний в первый prompt.
-->

---

# Harness — общий продукт команды

<div class="two-col wide-left">
  <div v-click class="flat-card">
    <h3>Не набор личных промптов</h3>
    <p>Это общие правила принятия решений, процедуры и проверки, которыми пользуется вся команда.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Не «вторая документация»</h3>
    <p>Harness связывает существующие источники истины, делает норму явной и добавляет feedback.</p>
  </div>
</div>

<div class="roadmap" style="margin-top: 1.35rem">
  <div v-click><b>01</b><strong>Owners</strong><span>кто отвечает за правило</span></div>
  <div v-click><b>02</b><strong>Versioning</strong><span>изменения видны и обсуждаемы</span></div>
  <div v-click><b>03</b><strong>CI</strong><span>ссылки и gates не протухают</span></div>
  <div v-click><b>04</b><strong>Learning loop</strong><span>ошибка становится правилом, test или eval</span></div>
</div>

<div v-click class="statement" style="margin-top: 1.25rem">Иначе команда создаст ещё один legacy — только уже в <code>.agents/</code>.</div>

<!--
Время: 1:30.
Harness не должен быть папкой личных промптов одного сильного разработчика.
Это общий продукт команды: у правил есть owner, изменения версионируются, CI ловит протухшие ссылки и gates,
а из реальных ошибок появляется новое знание. Иначе мы просто строим второе legacy — уже в .agents.
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
    <div v-click class="statement context-key-message">Не максимальный контекст. Нужный контекст для текущего решения.</div>
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
Когда появляется вопрос, он подтягивает code search, MCP-ответ, историю PR или глубокую reference.
Так мы не экономим на знании — мы подаём его ровно в момент, когда оно влияет на решение.
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
Контекст раскрываем слоями. Сначала агент видит короткую карту — AGENTS.md.
Дальше он открывает только подходящий skill, а глубокие reference и scripts — только когда они реально нужны.
Иначе мы тратим контекстное окно на справочник, который не помогает принять решение по текущей задаче.
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
AGENTS.md загружается рано, поэтому за каждый лишний абзац мы платим на каждой задаче.
Его роль — сказать, с чего начать, где лежит источник истины, какими командами проверить результат и где остановиться.
Он не должен становиться вторым Confluence или tutorial по React: длинное знание живёт рядом с соответствующим кодом.
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
а не в гигантском корневом prompt, который устаревает целиком. Важно назвать не только правильный путь,
но и анти-паттерны с причиной: агент иначе честно найдёт старый рабочий пример и скопирует его.
-->

---

# SDD в legacy: начинаем с одного change, а не с переписывания прошлого

<div class="click-flow">
  <div v-click class="click-node"><b>Берём один change</b><span>понятная бизнес-задача и ограниченный scope</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Собираем факты</b><span>код, тесты, продуктовый запрос, владельцы области</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Фиксируем решение</b><span>intent · scope · constraints · done</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Реализуем и сохраняем</b><span>agent + gates + review → spec становится знанием</span></div>
</div>

<div class="two-col" style="margin-top: 1.5rem">
  <div v-click class="flat-card">
    <h3 class="green">Внедряем по границе изменений</h3>
    <p>Не документируем девятилетний продукт. Первый draft агент готовит по коду и тестам, а владелец области уточняет норму.</p>
  </div>
  <div v-click class="flat-card warn">
    <h3 class="yellow">Не подменяем факты догадкой</h3>
    <p>Код — факт, spec — намерение. Если они расходятся, владелец области отделяет актуальную норму от случайности legacy.</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.25rem">OpenSpec, Spec Kit или Markdown — не принципиально. Ценность в снятой до кода неоднозначности.</div>

<!--
Время: 1:50.
SDD в legacy не означает «сначала напишем спецификации для всего девятилетнего продукта».
Так мы никогда не начнём. Берём следующий change с понятной бизнес-ценностью и ограниченным scope.
Агент собирает draft: что говорит код, тесты и продуктовый запрос. Затем владелец области уточняет intent,
границы изменения, ограничения и Definition of Done. После реализации spec остаётся рядом с изменением:
она фиксирует принятое решение и постепенно превращает legacy в систему с явной нормой.
Если код расходится со spec, это не повод выбирать автоматически. Код — факт, но не всегда правило; решение принимает человек.
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
Не нужна идеальная энциклопедия. Перед тем как писать код, достаточно ответить на шесть вопросов со слайда:
что меняем и зачем, где границы, что точно не трогаем, какие есть ограничения и чем докажем готовность.
Если эти ответы появились, агент перестаёт додумывать продуктовый смысл на ходу.
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
Skill — это не ещё одна папка знаний. Это повторяемая процедура для одного класса задач:
порядок действий, stop conditions, запуск детерминированных scripts и ожидаемый объективный результат.
Например, performance-check выбирает нужные проверки и порядок, но не дублирует архитектуру проекта внутри skill.
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
Вот почему «react-best-practices», «webpack-rules» и «hooks» в skills — плохой запах.
Знание кладём в docs, стабильное ограничение — в rule, повторяемую процедуру — в skill,
а доступ к системе — в tool. Это простое разделение спасает команду от зоопарка skills.
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
Субагент нужен не потому, что агентов стало модно запускать пачками. Он полезен, когда можно изолировать
независимый контекст: один смотрит код, другой — проверки, третий — документацию. Root-agent получает короткие выводы,
а не гигантский смешанный prompt. Для demo безопасный default — исследовательские subagents read-only.
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
Это не тезис «слабая модель лучше сильной». Даже флагманская модель не заменяет deterministic feedback
и project-specific Definition of Done. Она может написать правдоподобный отчёт, но среда должна сама показать:
прошли ли types, архитектурные инварианты, тесты, bundle и memory budget. Модель не решает сама, что она finished.
-->

---

# Eval отвечает на один вопрос: улучшили ли мы среду агента?

<div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px">
  <div v-click class="flat-card">
    <h3>Test / gate</h3>
    <p>проверяет результат в продукте</p>
    <p class="muted">lazy route? · bundle budget? · memory leak?</p>
  </div>
  <div v-click class="flat-card">
    <h3>Skill</h3>
    <p>подсказывает агенту порядок действий</p>
    <p class="muted">как выполнить класс задач · например performance-check</p>
  </div>
  <div v-click class="flat-card">
    <h3>Eval</h3>
    <p>измеряет, помогло ли изменение harness</p>
    <p class="muted">одна задача · зафиксированный repo · одинаковые graders · несколько запусков</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.55rem">Test говорит: «результат проходит требование». Skill говорит: «попробуй сделать так». Eval говорит: «после этого изменения агенты стали справляться лучше?»</div>

<!--
Время: 1:50.
Важно не смешивать три вещи. Test или gate проверяет продуктовый результат. Skill подсказывает агенту порядок действий.
Eval — контролируемый эксперимент над агентной системой: фиксируем задачу, состояние репозитория, model settings и graders,
меняем одну часть harness и смотрим, стал ли результат повторяемо лучше.
-->

---

# Реальный промах агента превращаем в eval-case

<div class="click-flow eval-flow">
  <div v-click class="click-node"><b>Промах</b><span>выбрал deprecated loader</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Eval-case</b><span>task + fixed repo + grader</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Baseline</b><span>сколько запусков выбирают устаревший путь</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Изменение harness</b><span>canonical doc / rule / skill</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Повторяем</b><span>та же задача · тот же grader</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Оставляем кейс</b><span>защита от регрессии harness</span></div>
</div>

<div class="two-col" style="margin-top: 1.2rem">
  <div v-click class="flat-card">
    <h3>Что оцениваем</h3>
    <p class="muted">выбран canonical path · diff в scope · все gates passed · есть evidence, а не «done»</p>
  </div>
  <div v-click class="flat-card">
    <h3>Как не усложнить</h3>
    <p class="muted">начать с одного реального фейла и machine grader; без LLM judge, dashboard и отдельной платформы</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.05rem">Skill — гипотеза об улучшении harness. Eval показывает, помогла ли она на повторяемой задаче.</div>

<!--
Время: 2:00.
Начинаем без eval-платформы. Берём настоящий промах агента, превращаем его в одну фиксированную задачу,
пишем простой machine grader и делаем несколько запусков до и после изменения harness.
На сцене это lightweight representative case, а не статистический benchmark: нам важно понять, устранили ли мы конкретную причину ошибки.
-->

---

# В командный harness попадает только доказанное

<div class="two-col wide-left">
  <pre v-click class="repo-tree">real failure
  ↓
eval case
  ↓
proven improvement
  ↓
docs / rule / skill / gate
  ↓
team release</pre>
  <div v-click>
    <ul>
      <li>owner принимает изменение и отвечает за актуальность;</li>
      <li>versioning / release notes делают новую норму видимой;</li>
      <li>CI проверяет структуру, ссылки и executable gates;</li>
      <li>не доказали пользу — не добавляем ещё один skill;</li>
      <li>меряем rework, bugs и cycle time, а не красоту demo.</li>
    </ul>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.5rem">Так harness растёт из реальных инженерных проблем, а не из коллекции модных инструкций.</div>

<!--
Время: 1:40.
Так замыкается цикл. Промах не просто фиксится в одном PR: он становится eval-case, изменение доказывает пользу,
и только тогда превращается в docs, rule, skill или gate для всей команды. Если пользы не доказали,
не добавляем ещё одну инструкцию только потому, что она красиво звучит.
-->

---
layout: center
---

# Нужно ли ещё уметь писать код?

<div v-click class="statement">Чем сильнее инженер, тем выше его <span class="green">мультипликатор от AI</span></div>

<div class="flow engineer-multiplier" style="grid-template-columns: repeat(3, 1fr)">
  <div v-click class="step"><strong>Отличить инвариант</strong><span>от случайности legacy</span></div>
  <div v-click class="step"><strong>Поставить границы</strong><span>чтобы агент не решал лишнее</span></div>
  <div v-click class="step"><strong>Сохранить знание</strong><span>в spec, docs, test, rule или eval</span></div>
</div>

<!--
Время: 1:30.
Возвращаюсь к личному челленджу из начала. Кода руками может быть меньше, но сильный инженер всё ещё отличает
инвариант от случайности legacy, ставит границы задачи и сохраняет знание в нужном артефакте.
Поэтому AI не отменяет инженерность — он сильнее умножает её.
-->

---

# Agent-ready checklist

<div class="checklist">
  <div v-click>Есть короткая точка входа</div>
  <div v-click>У знаний есть понятный источник истины</div>
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
