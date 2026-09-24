---
theme: default
title: "Демо-сессия «Не Claude единым: агентная разработка в закрытом контуре большого фронтенда»"
info: |
  Облачные агенты в корпоративный репозиторий часто нельзя, а внутреннюю модель
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

<div class="eyebrow">Демо-сессия</div>

# «Не Claude единым:<br>агентная разработка в закрытом контуре большого фронтенда»

<div class="muted" style="margin-top: 2.4rem; font-size: 1.05rem">Павел Уваров · Kaspersky</div>

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
  <div v-click class="speaker-photo">
    <img src="/assets/pavel-uvarov.jpg" alt="Павел Уваров" />
  </div>
</div>

<!--
Время: 0:50.
Я Павел, Software Expert в Kaspersky. Когда у нас появилась агентная разработка, я поставил себе челлендж —
перестать писать код руками. Держусь, и держусь на внутренней модели, а не на Claude.
-->

---

# Поднимите руки

<div class="poll">
  <div v-click><span>🔒</span>У кого на работе облачные агенты запрещены или сильно ограничены?</div>
  <div v-click><span>🏠</span>У кого есть внутренняя модель, развёрнутая в контуре компании?</div>
  <div v-click><span>⌨</span>А кто реально пишет ей код в рабочем репозитории — не вопросы и не тесты?</div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 26px">Обычно третьих рук сильно меньше, чем вторых. Модель есть, а в разработке ей почти не пользуются.</p>

<!--
Время: 1:20.
Задавать вопросы по одному и реально ждать рук.
Если третьих рук мало — это и есть тема доклада. Если много — отлично, спросить после доклада, как они это устроили.
-->

---

# Что я слышу от коллег с внутренней моделью

<div class="grid-4">
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Она тупая, с Claude не сравнить»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Галлюцинирует: придумывает функции, которых у нас нет»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Для тестиков сойдёт, в прод-код не пущу»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Пока объяснишь задачу — сам напишешь»</h3></div>
</div>

<p v-click style="margin-top: 1.7rem; font-size: 29px">Мой тезис на сегодня: чаще всего фигню делает не модель. Мы просто не объяснили ей проект — и она честно угадывает.</p>

<!--
Время: 1:00.
Все четыре фразы я говорил сам. Дальше покажу, откуда берутся «галлюцинации» в большом проекте
и что с ними делать, если сильной облачной модели нет и не будет.
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

# Внутренние модели слабее, но уже не намного

<div class="benchmark-strip">
  <div v-click class="benchmark"><b>45</b><span>GLM-5.3</span></div>
  <div v-click class="benchmark"><b>45</b><span>Claude Opus 5<br/>medium effort</span></div>
  <div v-click class="benchmark"><b>40</b><span>DeepSeek V4.1 Flash<br/>reasoning max</span></div>
  <div v-click class="benchmark"><b>38</b><span>Claude Sonnet 5<br/>max effort</span></div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 27px">DeepSeek или Qwen Coder можно поднять на своей инфраструктуре, и по общему уровню они уже рядом с облачными. Разрыв есть, но главное, что мешает, — модель ничего не знает о вашем проекте.</p>

<p v-after class="source">Artificial Analysis Intelligence Index, сентябрь 2026. Это общий уровень модели; проверять всё равно нужно на своём репозитории.</p>

<!--
Время: 1:00.
Числа — баллы индекса Artificial Analysis, не проценты. Я не утверждаю, что внутренняя модель «победила Claude».
Тезис скромнее: её уже достаточно для реальной разработки, если не заставлять её угадывать.
-->

---

# Почему даже умная модель выбирает не тот пример

<div class="two-col wide-left">
  <div>
    <div v-click class="flat-card">
      <h3>Как это выглядит в нашем репозитории</h3>
      <p>За девять лет в нём успели пожить четыре способа подключать микрофронты. Module Federation попробовали и откатили, потом был общий eager-sharing, потом перешли на window externals — так работает и сейчас. Поверх ещё пробовали загрузчик через script-теги и тоже откатили.</p>
    </div>
    <p v-click style="margin-top: 1.1rem; font-size: 25px">Агент ищет «как сделано у соседей» и находит все четыре. В каждом есть рабочий код, и по самому коду не видно, какой из них сегодня считается правильным. Он берёт самый убедительный — и это не галлюцинация, а честная попытка угадать.</p>
  </div>
  <div v-click class="meme-image">
    <img src="/assets/office-legacy-patterns.jpg" alt="Офисный мем о выборе устаревшего паттерна" style="height: 430px; max-height: 49vh;" />
  </div>
</div>

<!--
Время: 1:20.
Ключевая мысль доклада: модель не знает норму проекта, она её угадывает по коду. Код — архив решений за девять лет.
Слабая модель угадывает хуже сильной, поэтому ей особенно нужно, чтобы угадывать было нечего.
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

# Идея доклада: агенту не нужно угадывать

<table class="comparison">
  <thead><tr><th>Что агент угадывает без подготовки</th><th>Что отвечает на этот вопрос</th></tr></thead>
  <tbody>
    <tr v-click><td>Где что лежит и что заденет правка</td><td>AGENTS.md — карта, запреты, кросс-зависимости</td></tr>
    <tr v-click><td>Какой из похожих примеров — норма</td><td>Документация: как правильно и что не копировать</td></tr>
    <tr v-click><td>Что именно нужно сделать и где границы</td><td>Спецификация, прочитанная человеком до кода</td></tr>
    <tr v-click><td>Как выполнять повторяющуюся работу</td><td>Скиллы и субагенты</td></tr>
    <tr v-click><td>Готово ли на самом деле</td><td>Проверки и агентное ревью</td></tr>
    <tr v-click><td>Стало ли лучше после наших правок</td><td>Evals</td></tr>
  </tbody>
</table>

<p v-click style="margin-top: 1.2rem; font-size: 25px">После каждого блока переключаемся в репозиторий и смотрим, каким коммитом мы это добавили.</p>

<!--
Время: 1:20.
Это план доклада. Чем слабее модель, тем меньше ей можно оставлять на угадывание.
Каждая строка — отдельный блок, и после каждого я показываю коммит в демо-репозитории.
-->

---
layout: center
---

<div class="eyebrow">Live · старт</div>

# Одна задача, одна модель, два репозитория

<div class="two-col" style="margin-top: 1rem">
  <div v-click class="flat-card bad">
    <h3>Run A · <code>main</code></h3>
    <p>«Add a new Application Security page and microfrontend like the neighboring implementation.»</p>
    <p class="muted">Обычный репозиторий: код, README, история PR и короткий общий AGENTS.md.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B · <code>demo/agent-ready-v2</code></h3>
    <p>«Implement <code>openspec/changes/add-application-security/</code>»</p>
    <p class="muted">Тот же код плюс всё, что покажу дальше.</p>
  </div>
</div>

<div v-click class="flat-card warn" style="margin-top: 1rem; padding: 18px 26px">
  <h3 style="font-size: 23px; margin-bottom: 6px">Оба промпта заканчиваются одинаково</h3>
  <p style="font-size: 20px">«When you are done, write a short report in Russian to <code>agent-report.md</code>: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.»</p>
</div>

<!--
Время: 1:30.
Переключиться в терминал, запустить обе сессии на одной внутренней модели с одинаковыми настройками, вернуться к слайдам.
Спека у Run B — тоже часть подготовки проекта, а не подсказка: задача приходит к агенту уже разобранной.
Отчёт в конце — одинаковая просьба для обоих: в финале сравним и код, и рассуждения.
Если live-модель недоступна — дальше используем сохранённые трейсы и диффы репетиции.
-->

---
layout: center
---

<div class="eyebrow">Блок 1</div>

# AGENTS.md: первое, что читает агент

<p class="muted" style="font-size: 26px">Живой пример из репозитория, вложенный AGENTS.md для опасного места и пример того, как делать не надо.</p>

<!--
Время: 0:15.
Файлы в демо написаны по-русски, чтобы их было удобно читать со сцены. В рабочем проекте я бы писал по-английски:
тот же текст занимает меньше токенов, и модели ему следуют стабильнее. Команды, пути и ключевые слова — на английском в любом случае.
-->

---

# <code>AGENTS.md</code>: карта, источник истины, запреты

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>AGENTS.md</span><span>demo/agent-ready-v2</span></div>

```md {all|1-2|4-8|10-13|15-19}
# Enterprise App Optimization
Nx-монорепозиторий: shell и независимо развёрнутые React-микрофронты. Node 22+.

## Где что лежит
- Продукт → `src/microfrontends/<name>/` (client, server, manifest.json)
- Опасные места со своими AGENTS.md → `src/shell-app/server/`, `src/microfrontends/common/`
- Архитектура → `docs/architecture/` · Производительность → `docs/performance.md`
- Текущее изменение → `openspec/changes/<id>/` · Скиллы → `.agents/skills/`

## Источник истины
Документация важнее соседнего кода. В истории есть Module Federation, script-loader
и eager sharing — от всех отказались (см. docs/architecture/microfrontends.md).
Если код и документация расходятся, делай по документации и напиши об этом в отчёте.

## Никогда
- не импортируй один микрофронт из другого
- не собирай React / React Router внутрь микрофронта
- не добавляй второй загрузчик, реестр или federation-рантайм
- не ослабляй baseline в `performance/`, чтобы проверка позеленела
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Файл целиком — около 40 строк</b><p>Он загружается в каждую задачу, поэтому сюда попадает только то, что нужно почти всегда. Разберём по частям.</p></div>
  <div v-click="[1, 2]" class="note"><b>Одна строка о проекте</b><p>Никаких «ты опытный разработчик»: роль ничего не говорит модели о нашем коде.</p></div>
  <div v-click="[2, 3]" class="note"><b>Карта вместо пересказа</b><p>Только пути и куда идти за подробностями. Архитектура живёт в docs, поэтому AGENTS.md не разрастается. Вложенные AGENTS.md упомянуты прямо здесь.</p></div>
  <div v-click="[3, 4]" class="note"><b>Главная строка для legacy</b><p>Что делать, когда соседний код спорит с документацией. Без неё модель скопирует ближайший рабочий пример.</p></div>
  <div v-click="4" class="note"><b>Конкретные запреты</b><p>Четыре вещи, нарушение которых у нас дорого стоит. Конкретный запрет слабая модель выполняет, а «пиши качественно» — нет.</p></div>
</div>
</div>

<!--
Время: 1:40.
Идти по кликам. Сюда не кладём то, что модель и так знает, и то, что можно вывести из кода.
Исследование ETH 2026 года показало: сгенерированные моделью AGENTS.md почти не помогают и дорожают на 20%,
а короткие файлы, написанные людьми, помогают. Поэтому пишем руками и коротко.
-->

---

# <code>AGENTS.md</code>: что заденешь и когда готово

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>AGENTS.md (продолжение)</span><span>demo/agent-ready-v2</span></div>

```md {all|1-8|10-14|16-18|20-21}
## Что ещё заденешь
| Меняешь                            | Заденешь                                   | Проверка             |
|------------------------------------|--------------------------------------------|----------------------|
| common/webpack/createMicrofront…   | сборку всех продуктов, общий React         | architecture, bundle |
| id или routePath в manifest.json   | меню, сохранённые ссылки, MemLab-селекторы | architecture         |
| shell-app/server/lib/*             | загрузку всех продуктов сразу              | smoke всех продуктов |
| версию React / React Router        | все продукты (window externals)            | npm run check        |
| таблицу или список с пагинацией    | detached DOM после ухода со страницы       | memory для роута     |

## Команды
- architecture → `npm run check:architecture` · bundle → `npm run check:bundle`
- memory → `MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js`
- smoke → `npm run dev`, открой http://localhost:4300, каждый продукт из меню, перезагрузи его URL
- всё сразу → `npm run check` (architecture + lint + build)

## Готово
Запусти проверки из активной спеки; без спеки — `npm run check`.
В отчёте: команды, результаты, что не проверил и почему.

## Сначала спроси владельца из CODEOWNERS
общая зависимость · id, routePath, entryPath, api.prefix в manifest · common/ · shell-app/server/
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Вторая половина файла</b><p>Отвечает на два вопроса: кого ещё касается правка и как доказать, что работа закончена.</p></div>
  <div v-click="[1, 2]" class="note"><b>Кросс-зависимости</b><p>Самое полезное, что мы добавили. Агент правит один файл и сразу видит, что ещё сломает и чем это проверить. В продукте такие таблицы есть и в корне, и в документации каждой области.</p></div>
  <div v-click="[2, 3]" class="note"><b>Точные команды</b><p>Не «проверь память», а готовая команда с переменной окружения. Слабая модель не угадает, что MemLab нужен адрес поднятого приложения.</p></div>
  <div v-click="[3, 4]" class="note"><b>Готово — это команды и отчёт</b><p>Не «убедись, что работает», а проверки из спеки и честный список того, что не проверено.</p></div>
  <div v-click="4" class="note"><b>Когда остановиться и спросить</b><p>Три уровня: «никогда», «сначала спроси», всё остальное можно. Без stop-условий слабая модель героически доводит опасную правку до конца.</p></div>
</div>
</div>

<!--
Время: 1:20.
Таблица «что заденешь» — ответ на главный страх большого проекта: одна строка в общем коде ломает всех.
Stop-условия важны для слабой модели: без них она будет героически доводить опасную правку до конца.
-->

---

# Вложенный AGENTS.md там, где одна строка роняет всех

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>src/shell-app/server/AGENTS.md</span><span>demo/agent-ready-v2</span></div>

```md {all|1-3|5-8|9-10|11-13|15-16}
# shell-app/server — реестр и прокси для всех микрофронтов
Через этот сервер shell узнаёт о каждом продукте и проксирует его entry и API.
Ошибка здесь выключает не один продукт, а все сразу. Владелец: @platform-frontend.

- lib/registry.js сохраняет реестр в dist/data/microfrontends.json; после рестарта
  продукты возвращаются со следующим heartbeat. Запись без heartbeat дольше
  MICROFRONTEND_TTL_MS удаляется. Не отключай TTL в общих конфигах: мёртвая запись
  останется, и каждый клиент на старте будет ждать её entry.
- POST /api/microfrontends/ack — контракт со всеми продуктами. Меняешь поля —
  меняй common/bootstrap.js в том же PR, иначе продукты перестанут регистрироваться.
- lib/microfrontend-proxy.js проксирует только entryPath и api.prefix продукта.
  Любой другой путь в production shell отдаёт как index.html (в dev — 404),
  так ломаются ленивые чанки.

Перед правкой — скилл safe-change. После: npm run check:architecture, подними shell
и два продукта, открой оба из меню, останови один — второй должен продолжить работать.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Реестр и прокси всех микрофронтов</b><p>Не каждый CLI подхватывает вложенные файлы сам, поэтому корневой AGENTS.md перечисляет их явно. В корень такие детали не помещаются.</p></div>
  <div v-click="[1, 2]" class="note"><b>Цена ошибки — первой строкой</b><p>Модель сразу понимает, что это не обычный файл, и владелец указан явно.</p></div>
  <div v-click="[2, 3]" class="note"><b>Реальный инцидент</b><p>Удалённый микрофронт жил в сохранённом реестре, и из-за него не грузился ни один продукт. Теперь записано, как устроен реестр и почему нельзя отключать TTL.</p></div>
  <div v-click="[3, 4]" class="note"><b>Контракт с другой командой</b><p>Меняешь формат регистрации — меняй и клиентскую сторону в том же PR. По коду одного сервера это не видно.</p></div>
  <div v-click="[4, 5]" class="note"><b>Молчаливая поломка</b><p>Прокси отдаёт index.html вместо файла, и ошибка всплывает совсем в другом месте. Это модель сама не выведет.</p></div>
  <div v-click="5" class="note"><b>Как проверить именно это место</b><p>Не общее «запусти тесты», а сценарий, который ловит поломку: останови один продукт — второй должен работать.</p></div>
</div>
</div>

<!--
Время: 1:30.
Этот файл появился после настоящего бага: удалённый микрофронт продолжал прилетать из сохранённого реестра, и падали все.
Формат «что поменял → что сломается → как это проявится» и есть самое ценное во вложенных файлах.
-->

---

# Как не надо: AGENTS.md, который мешает

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>AGENTS.md — антипример</span></div>

```md {all|1-4|6-9|11-12}
Ты senior React-разработчик с 20-летним опытом.
Всегда пиши чистый, поддерживаемый, качественный код.
Будь ОЧЕНЬ внимателен к производительности!!!
Думай шаг за шагом.

## Лучшие практики React
- Используй функциональные компоненты и хуки.
- Используй useMemo и useCallback, где уместно.
  … ещё 400 строк, скопированных из Confluence (2023)

## Команды
- yarn test:unit        # удалена в 2024
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Всё это я видел в реальных файлах</b><p>По отдельности каждая строка выглядит безобидно.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Роль и заклинания</b><p>Ноль информации о проекте. Модель и так старается, а капслок и «ОЧЕНЬ» только размывают действительно важные правила.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Учебник вместо решений</b><p>Общие практики модель знает. Не знает она ваших решений — а они утонули в 400 строках, которые грузятся в каждую задачу.</p></div>
  <div v-click="3" class="note bad"><b>Протухшая команда</b><p>Агент её запустит, упадёт и потратит полчаса на обход. Лечится проверкой в CI, что все команды из AGENTS.md существуют.</p></div>
</div>
</div>

<p v-click style="margin-top: 0.8rem; font-size: 23px">Простой тест: если строку можно вставить в AGENTS.md любого другого проекта, её там быть не должно.</p>

<!--
Время: 1:20.
Anthropic в своих рекомендациях советует для каждой строки спрашивать: «Если её убрать, агент ошибётся?» Если нет — убираем.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы изменили: AGENTS.md

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/2b71fbd69e9751a8699472a0d8dc99ba89b30647" target="_blank">Шаг 1. AGENTS.md: карта проекта, запреты и что заденет</a></div>

<div class="practice-files">
  <div><code>AGENTS.md</code><br>карта, источник истины, запреты, таблица «что заденешь», команды «готово»</div>
  <div><code>src/shell-app/server/AGENTS.md</code><br>реестр и прокси: что уже ломалось и как это проверить</div>
  <div><code>src/microfrontends/common/AGENTS.md</code><br>общая сборка: какая строка даёт второй React в каждом продукте</div>
  <div><span class="muted">Сказать</span><br>AGENTS.md мы переписали, а команды check:* из него появятся в шаге 6</div>
</div>

<!--
Время: 1:30.
Открыть коммит на GitHub или в IDE. Пройти три файла, для каждого — одна фраза из аннотаций.
Показать, что корневой файл короткий, а подробности — во вложенных.
-->

---

# Live: что агенты прочитали первым

<div class="two-col" style="align-items: start">
  <div v-click class="flat-card bad">
    <h3>Run A</h3>
    <p class="muted">Смотрим в трейсе: сколько файлов открыл до первой правки, какой микрофронт взял за образец, полез ли в историю PR.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B</h3>
    <p class="muted">Ожидаем путь AGENTS.md → спека → docs/architecture → один эталонный микрофронт. Позвал ли explorer.</p>
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

# Документация, по которой агент выбирает норму

<p class="muted" style="font-size: 26px">Разбираем кусок настоящей документации и сравниваем плохой и хороший абзац.</p>

<!--
Время: 0:15.
-->

---

# Документация для агента: разбор на примере

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>docs/architecture/microfrontends.md</span><span>фрагмент</span></div>

```md {all|2|4-9|11-15|17-23}
# Архитектура микрофронтов
Владелец: @platform-frontend · Проверено: 2026-09 · Проверка: npm run check:architecture

## Как сейчас правильно
1. Опиши продукт в src/microfrontends/<name>/manifest.json.
2. Собирай через common/webpack/createMicrofrontendConfig.cjs — не копируй конфиг.
3. Экспортируй RouteObject, страницу подключай через динамический import.
4. Зарегистрируй <name>-client и <name>-server в nx.json и в workspaces.
Эталон: src/microfrontends/users-and-roles/ (кроме шага 3: там страницы пока статические).

## Не копируй: выглядит рабочим, но от этого отказались (остатки не «чини»)
| Подход                  | Где встретишь       | Почему нельзя                   |
|-------------------------|---------------------|---------------------------------|
| Module Federation, eager sharing | PR #25–#29, остатки в shell-app/client/webpack.config.cjs | второй рантайм, два React   |
| script-tag реестр                | PR #33, откат в #34                                        | второй реестр рядом с manifest |

## Подводные камни
- Скопированный webpack-конфиг теряет window externals. Сборка зелёная, а в браузере
  «Invalid hook call» (в production — «Cannot read properties of null»). Ловит check:architecture.
- routePath в manifest должен совпадать с path в экспортированном роуте. Иначе из меню
  страница открывается, а по сохранённой ссылке — Not Found.
- entryPath должен совпадать с outputFileName клиента. Переименуешь файл без manifest —
  entry отдаст 404, и shell покажет продукт как недоступный.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Четыре раздела, которые мы требуем</b><p>Как правильно, что не копировать, подводные камни и как проверить. Остальное — по желанию команды.</p></div>
  <div v-click="[1, 2]" class="note"><b>Владелец и дата</b><p>Документ без владельца протухает первым. Дата подсказывает агенту и человеку, насколько ему верить.</p></div>
  <div v-click="[2, 3]" class="note"><b>Как правильно — шагами</b><p>Плюс ссылка на эталонный продукт и честная оговорка, где эталон отстаёт от нормы.</p></div>
  <div v-click="[3, 4]" class="note"><b>Что не копировать</b><p>Человек помнит, что Module Federation откатили. Агент видит только рабочий код в истории — поэтому плохие варианты называем явно, с причиной.</p></div>
  <div v-click="4" class="note"><b>Что ломается молча</b><p>Формат: что сделал → что увидишь → чем поймать. Именно этого Run A взять неоткуда.</p></div>
</div>
</div>

<!--
Время: 1:40.
Главное отличие документации для агента от обычной: она явно называет плохие примеры и молчаливые поломки.
-->

---

# Одна и та же мысль — плохо и хорошо

<div class="two-col">
  <div v-click class="flat-card bad">
    <h3>Так агенту бесполезно</h3>
    <p>«Микрофронты должны следовать лучшим практикам и корректно использовать общие зависимости. Избегайте дублирования.»</p>
    <p class="muted">Какие практики? Какие зависимости? Как понять, что дублирование уже есть?</p>
  </div>
  <div v-click class="flat-card">
    <h3>Так работает</h3>
    <p>«Webpack-конфиг микрофронта создаётся только через <code>common/webpack</code>. Скопированный конфиг теряет externals: сборка зелёная, а в браузере “Invalid hook call”. Ловит <code>npm run check:architecture</code>.»</p>
  </div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 26px">Правило для ревью документации: в абзаце должен быть хотя бы один путь к файлу или команда. Если нет ни того, ни другого, это, скорее всего, вода.</p>

<!--
Время: 1:00.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: документацию

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/8934845f0b7569e587ffad1e8551cc5da729af03" target="_blank">Шаг 2. Документация: как правильно, что не копировать, подводные камни</a></div>

<div class="practice-files">
  <div><code>docs/architecture/microfrontends.md</code><br>контракт, «не копируй», подводные камни, рецепт ленивых чанков через shell</div>
  <div><code>docs/architecture/frontend.md</code><br>инварианты рендера, жизненного цикла и границ загрузки</div>
  <div><code>docs/performance.md</code><br>что считается регрессией и какой проверкой её ловить</div>
  <div><span class="muted">Показать</span><br>раздел «Ленивые чанки через shell» — обход мы проверили руками на users-and-roles, в ветке он описан текстом</div>
</div>

<!--
Время: 1:00.
Смотрите: «не копируй» с номерами PR — ровно то, что Run A сейчас находит в истории.
-->

---
layout: center
---

<div class="eyebrow">Блок 3</div>

# Спецификация: договориться о задаче до кода

<p class="muted" style="font-size: 26px">Как внедрить SDD в legacy, какие требования мы предъявляем к спеке, хороший и плохой пример.</p>

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
      <li v-click>Спеку пишем только на то, что меняем. Весь продукт задним числом не описываем.</li>
      <li v-click>Черновик готовит агент по тикету и коду, владелец области читает его минут десять.</li>
      <li v-click>После мёржа спека остаётся рядом с кодом и становится частью документации.</li>
    </ul>
  </div>
  <div>
    <h3 class="yellow">Что это даёт</h3>
    <ul>
      <li v-click>Замысел ревьюим до кода: поправить абзац дешевле, чем 40 файлов.</li>
      <li v-click>Контракты legacy, которых не видно в коде, записаны явно — в опубликованном кейсе именно их незнание было главной причиной переделок.</li>
      <li v-click>Слабой модели не нужно додумывать продуктовый смысл по ходу работы.</li>
    </ul>
  </div>
</div>

<p v-click class="source">OpenSpec, «Existing projects»: «Resist the urge to back-fill everything». Кейс: arXiv 2605.18461 — один опубликованный пример, не исследование.</p>

<!--
Время: 1:40.
Главное для legacy: мы не документируем прошлое, мы фиксируем каждое новое решение. Покрытие растёт само,
с каждой заархивированной спекой. Цифры из кейса не обещаю — это один опубликованный пример.
-->

---

# Где мы на карте SDD и при чём тут CodeSpeak

<table class="comparison">
  <thead><tr><th>Уровень</th><th>Что это значит</th><th>Инструменты</th></tr></thead>
  <tbody>
    <tr v-click><td>spec-first</td><td>Спека пишется под одну задачу и дальше не нужна</td><td>обычный промпт, план в чате</td></tr>
    <tr v-click><td><b class="green">spec-anchored</b></td><td>Спека живёт рядом с кодом, изменения описываются дельтами к ней</td><td>OpenSpec, Spec Kit, Kiro</td></tr>
    <tr v-click><td>spec-as-source</td><td>Человек правит только спеку, код генерируется из неё заново</td><td>CodeSpeak, Tessl — пока alpha и beta</td></tr>
  </tbody>
</table>

<p v-click style="margin-top: 1.3rem; font-size: 25px">Для девятилетнего legacy мы выбрали средний уровень: дельты к спеке не требуют описать всю систему заранее. CodeSpeak интересен для изолированных модулей вроде парсеров, но переносить на него ядро продукта рано.</p>

<p v-after class="source">Классификация — Birgitta Böckeler, martinfowler.com, 2025. Thoughtworks Radar держит SDD и оба инструмента в Assess.</p>

<!--
Время: 1:10.
Про CodeSpeak спрашивают часто. Это проект Андрея Бреслава: спеки на структурированном Markdown компилируются моделью в код,
поддерживать нужно только спеки. У него есть mixed mode для существующих проектов и takeover для извлечения спек из кода, но статус — Alpha Preview.
Критика SDD справедлива: на маленькой задаче это кувалда. Поэтому спека у нас — на заметное изменение, а не на каждую правку.
-->

---

# Какие требования мы предъявляем к спеке

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
Это совпадает с тем, что советуют авторы OpenSpec, Kiro и Addy Osmani: сценарии в формате WHEN/THEN, границы «всегда / спроси / никогда»,
небольшой объём. Если хотя бы одного пункта нет — спека возвращается на доработку, как код на ревью.
-->

---

# Хорошая спека: разбор

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>…/add-application-security/specs/application-security/spec.md</span><span>фрагмент</span></div>

```md {all|1-10|12-14|16-19|21-24|26-28}
## Публичный контракт
После мёржа не меняется: на эти значения опираются ссылки пользователей, MemLab и check:bundle.
| Контракт | Значение |
|---|---|
| Пункт меню | Application Security |
| Роут (routePath = path в роуте) | `/application-security` |
| id в manifest (data-testid пункта меню) | `application-security-microfrontend` |
| Entry (entryPath / outputFileName) | `/application-security.js` / `application-security.js` |
| Префикс API | `/api/mf/application-security` |
| Проекты и workspaces | `application-security-client`, `application-security-server` |
…
### Requirement: Страница инвентаря Application Security
Shell SHALL показывать пункт «Application Security» в меню и открывать постраничную
таблицу приложений по адресу `/application-security`.

#### Scenario: открыть из меню
- WHEN пользователь нажимает «Application Security»
- THEN показывается таблица приложений с состояниями загрузки, пустого списка и ошибки
- AND код страницы скачивается только в этот момент (ленивый чанк)
…
## Если ленивый чанк не работает
Можно менять конфиг только этого микрофронта (Babel, webpack, его сервер), пока чанк
не загрузится через shell и проверки не пройдут. Опиши обход в отчёте.
Рецепт: «Ленивые чанки через shell» в docs/architecture/microfrontends.md.

## Вне scope
- редактирование, фильтры, экспорт
- изменения в `src/microfrontends/common/`, shell или других продуктах
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Полная спека — около ста строк</b><p>Показываю самое важное. Ключевые слова OpenSpec оставлены на английском, чтобы работали инструменты.</p></div>
  <div v-click="[1, 2]" class="note"><b>Публичный контракт</b><p>Значения, на которые опираются ссылки пользователей, MemLab и проверки. Агент не должен их придумывать.</p></div>
  <div v-click="[2, 3]" class="note"><b>Требование</b><p>Одно предложение о поведении, без слов «быстро» и «красиво».</p></div>
  <div v-click="[3, 4]" class="note"><b>Сценарий</b><p>Каждая строка THEN проверяется руками или тестом. «Код скачивается только в этот момент» — это и есть требование к ленивой загрузке.</p></div>
  <div v-click="[4, 5]" class="note"><b>Разрешение, если упёрся</b><p>Можно менять конфиг только своего микрофронта. Без этого агент либо сдаётся, либо лезет чинить общий код.</p></div>
  <div v-click="5" class="note"><b>Вне scope</b><p>Иначе агент «заодно» отрефакторит общий webpack-конфиг, и это заденет 25 плагинов.</p></div>
</div>
</div>

<!--
Время: 1:40.
В конце файла ещё раздел «Готово» с командами и строками, которые заранее закрывают дешёвые способы объявить успех.
-->

---

# Как не надо: плохая спека

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>spec.md — антипример</span></div>

```md {all|3|4|5|8-10|12-13}
# Страница Application Security

Нужно сделать страницу безопасности приложений, как у соседей.
Страница должна быстро загружаться и хорошо выглядеть.
Заодно отрефакторить общий webpack-конфиг, он устарел.

## Технические детали
- Использовать Module Federation для обмена компонентами
- Таблица на antd, 50 строк на странице
- … ещё 300 строк кода компонентов

## Готово
Протестировать, что всё работает.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Такие спеки пишут, когда торопятся</b><p>Агент выполнит её добросовестно — и сделает не то.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>«Как у соседей»</b><p>У соседей четыре разных подхода. Спека вернула агента ровно к угадыванию.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>«Быстро и хорошо»</b><p>Нечем проверить. Для агента любое состояние подходит под «быстро».</p></div>
  <div v-click="[3, 4]" class="note bad"><b>«Заодно»</b><p>Scope уехал в общий код, который собирает все продукты. Одна фраза — и под угрозой работа десяти команд.</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Решения и код внутри спеки</b><p>Module Federation противоречит архитектуре, а код в спеке устаревает раньше, чем начнётся работа.</p></div>
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

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/bb59cd787cd32abe103927061761bbfbbd29378a" target="_blank">Шаг 3. Спецификация Application Security</a></div>

<div class="practice-files">
  <div><code>…/add-application-security/specs/application-security/spec.md</code><br>контракт, сценарии, разрешение для ленивого чанка, «готово»</div>
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

<p class="muted" style="font-size: 26px">Сначала разберёмся, что вообще стоит делать скиллом, потом посмотрим хорошие и плохие примеры.</p>

<!--
Время: 0:15.
-->

---

# Интерактив: куда положить?

<table class="comparison quiz">
  <thead><tr><th>Кусочек знания</th><th>Куда положить</th></tr></thead>
  <tbody>
    <tr><td>«Микрофронты не импортируют друг друга»</td><td><span v-click class="answer">AGENTS.md → «Никогда», и проверка в CI</span></td></tr>
    <tr><td>«Почему мы отказались от Module Federation»</td><td><span v-click class="answer">docs/architecture → «Не копируй»</span></td></tr>
    <tr><td>«Как разобрать лог упавшего стенда: четыре шага и скрипт»</td><td><span v-click class="answer">скилл log-trace-analysis</span></td></tr>
    <tr><td>«Список открытых инцидентов из трекера»</td><td><span v-click class="answer">инструмент или MCP-сервер</span></td></tr>
    <tr><td>«Стартовый бандл shell не растёт больше чем на 5%»</td><td><span v-click class="answer">проверка check:bundle и baseline</span></td></tr>
    <tr><td>«Страница Application Security: сценарии и что вне scope»</td><td><span v-click class="answer">спека в openspec/changes</span></td></tr>
  </tbody>
</table>

<!--
Время: 2:00.
Читать строку, ждать ответа из зала, потом кликать.
Правило, которое получается: знание — в документацию, короткое правило — в AGENTS.md, то, что можно проверить машиной, — в проверку,
процедура из нескольких шагов — в скилл, доступ к системе — в инструмент, конкретное изменение — в спеку.
-->

---

# Скиллы, которые стоит завести в большом проекте

<div class="skill-grid">
  <div v-click class="flat-card"><h3>story-analysis</h3><p class="muted">Разбирает тикет до кода: задаёт недостающие вопросы, находит затронутые контракты и готовит черновик спеки.</p></div>
  <div v-click class="flat-card"><h3>log-trace-analysis</h3><p class="muted">Скрипт сворачивает лог в сводку, модель находит первопричину и код-владельца.</p></div>
  <div v-click class="flat-card"><h3>performance-check</h3><p class="muted">По типу изменения выбирает нужные проверки: бандл, память, рендер, рантайм.</p></div>
  <div v-click class="flat-card"><h3>ui-form</h3><p class="muted">Формы на нашем UI-ките: обёртки полей, валидация, все состояния, доступность.</p></div>
  <div v-click class="flat-card"><h3>safe-change</h3><p class="muted">Правка общего кода: сначала список потребителей и план отката, потом код.</p></div>
  <div v-click class="flat-card"><h3>code-review</h3><p class="muted">Тот же чеклист, что у агента-ревьюера в CI. Можно запустить до MR.</p></div>
</div>

<!--
Время: 1:20.
Самый заметный по эффекту обычно story-analysis: он переносит вопросы в начало, пока они дешёвые.
[TODO: какой скилл оказался самым полезным у вас — одна живая история.]
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
    <div v-click class="flat-card warn" style="margin-top: 0.8rem"><h3>Не ставьте напрямую</h3><p class="muted">В проверке 3 984 публичных скиллов у 13% нашлись критичные проблемы. Читаем, адаптируем и кладём копию во внутренний репозиторий.</p></div>
  </div>
</div>

<p v-after class="source">Snyk, ToxicSkills, 2026. Для историй и требований — deanpeters/Product-Manager-Skills (user-story с критериями в Gherkin).</p>

<!--
Время: 1:00.
Это источники идей, а не готовые решения: у вас свои контракты и свои проверки.
Внутри контура это ещё и вопрос безопасности — скилл выполняет скрипты.
-->

---

# Хороший скилл: разбор <code>performance-check</code>

<div class="annotated wide">
<div class="file code-xxs wrap">
<div class="file-head"><span>.agents/skills/performance-check/SKILL.md</span><span>demo/agent-ready-v2</span></div>

```md {all|1-4|6-7|9-11|13-20|22-25}
---
name: performance-check
description: Выбирает и запускает проверки производительности после изменений фронтенда, которые могут задеть старт, бандл и загрузку, рендер, память DOM или рантайм микрофронтов. Не нужен для правок текста, стилей и документации.
---

# Проверка производительности
Инварианты описаны в docs/performance.md — здесь их не повторяем.

## 1. Определи, что может сломаться
Классы: startup, bundle, rendering, memory, microfrontend — может быть несколько.
Решай по тому, что заметит пользователь, а не по имени файла.

## 2. Выбери минимальный набор проверок
| Класс         | Проверки                                                              |
|---------------|-----------------------------------------------------------------------|
| bundle        | npm run check:bundle                                                  |
| memory        | npm run dev, затем MEMLAB_APP_BASE_URL=<url> npm run check:memory -- tests/memlab/<роут>.scenario.js |
| microfrontend | npm run check:architecture и npm run check:bundle                     |
| rendering     | lint, сборка и запись React Profiler для затронутого действия         |
| startup       | сборка и замер времени до рабочего UI (скрипта нет — запиши замер)    |

## 3. Чего не делать
- не подменяй сценарий MemLab сценарием другого роута
- не считай успешную сборку доказательством производительности
- не ослабляй baseline, чтобы проверка прошла: остановись и спроси @perf-guild
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Скилл — это процедура</b><p>Не знание о производительности, а порядок действий после правки: что проверить и как отчитаться.</p></div>
  <div v-click="[1, 2]" class="note"><b>description</b><p>Единственное, что агент видит всегда. По нему он решает, открывать ли скилл, поэтому написано и когда нужен, и когда нет.</p></div>
  <div v-click="[2, 3]" class="note"><b>Ссылка вместо копии</b><p>Инварианты живут в docs. Если скопировать их в скилл, через полгода будет две разные правды.</p></div>
  <div v-click="[3, 4]" class="note"><b>Сначала понять риск</b><p>По тому, что заметит пользователь, а не по имени файла. Иначе правка в hooks/ «не про производительность».</p></div>
  <div v-click="[4, 5]" class="note"><b>Минимальный набор</b><p>Слабая модель без таблицы гоняет либо всё подряд, либо ничего. С таблицей — ровно то, что нужно.</p></div>
  <div v-click="5" class="note"><b>Чего не делать</b><p>Каждая строка — реальный промах агента: чужой сценарий MemLab, «сборка прошла», ослабленный baseline. Ниже в файле — формат отчёта: команды, дельты, что упало, что не проверено.</p></div>
</div>
</div>

<!--
Время: 1:40.
У нас правило — SKILL.md короче 100 строк; длинные справочники — в references, детерминированная работа — в scripts.
-->

---

# <code>log-trace-analysis</code>: скрипт читает, модель думает

<div class="two-col">
  <div v-click class="file code-xs wrap">
  <div class="file-head"><span>.agents/skills/log-trace-analysis/SKILL.md</span></div>

```md
---
name: log-trace-analysis
description: Разбирает логи, HAR и трейсы длиннее 300 строк — находит первую ошибку, прослеживает её по сервисам и находит место в коде. Используй, когда в задаче есть лог стенда, вывод упавшей проверки или трейс.
---

1. Не читай сырой файл целиком. Запусти
   `node .agents/skills/log-trace-analysis/scripts/summarize.cjs <файл>`
2. Возьми самый ранний упавший traceId и запусти ещё раз
   с `--trace <id>` — получишь хронологию.
3. Сопоставь упавший URL с кодом: префикс API →
   manifest.json → роут сервера.
4. Ответ: первая ошибка, цепочка последствий, место в коде
   (file:line) и команда из CODEOWNERS, уверенность
   (высокая/средняя/низкая), чего лог НЕ показывает.
```

  </div>
  <div>
    <pre v-click class="repo-tree" style="font-size: 17px">$ node …/summarize.cjs fixtures/sample.log
68 lines · 3 error groups
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
Группировка, подсчёт и сортировка — детерминированная работа, её не нужно поручать рассуждению.
Вывод справа — настоящий запуск скрипта на fixtures/sample.log из демо-ветки, его можно повторить вживую.
-->

---

# Как не надо: скилл, который мешает

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>.agents/skills/frontend-helper/SKILL.md — антипример</span></div>

```md {all|1-4|6|8-11|13-14|16}
---
name: frontend-helper
description: Помогает с фронтендом
---

Ты опытный фронтенд-разработчик. Пиши быстрый код.

## Лучшие практики React
- Всегда используй useMemo и useCallback
- Компоненты должны быть маленькими
- … ещё 600 строк из статьи 2023 года

## Микрофронты
Используй Module Federation для обмена компонентами.

Проверь, что всё работает.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Типичный первый скилл</b><p>Кто-то собрал полезные советы в одну папку и назвал это скиллом.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Описание ни о чём</b><p>Под «помогает с фронтендом» подходит любая задача, и скилл грузится всегда — или никогда.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Роль вместо процедуры</b><p>Модели не нужно напоминать, кто она. Ей нужны шаги.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Знание вместо шагов</b><p>Это документация, причём устаревшая. «Всегда useMemo» — правило, которое вредит.</p></div>
  <div v-click="[4, 5]" class="note bad"><b>Противоречит архитектуре</b><p>Скилл спорит с документацией, и слабая модель выберет того, кто сказал последним.</p></div>
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
    <ul>
      <li v-click><b>Монорепозиторий:</b> скиллы лежат в <code>.agents/skills/</code>, каждая команда получает их вместе с кодом.</li>
      <li v-click><b>CODEOWNERS:</b> правка скилла — это MR, который аппрувит команда-владелец.</li>
      <li v-click><b>Реестр:</b> <code>.agents/skills/README.md</code> — что делает, когда брать, владелец, eval-кейс.</li>
      <li v-click><b>Изменение скилла</b> принимаем вместе с eval-кейсом и прогоном «до и после». Скиллы без кейса помечены «пробный» — в демо таких четыре из шести.</li>
    </ul>
  </div>
</div>

<!--
Время: 1:00.
Никакой отдельной платформы: скиллы — это код и живут по правилам кода.
[TODO: сверить имена команд-владельцев с реальной практикой.]
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: скиллы

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/d47ea390515c6ea773b585e7fdcdb041cddcd915" target="_blank">Шаг 4. Скиллы и их владельцы</a></div>

<div class="practice-files">
  <div><code>.agents/skills/performance-check/</code><br>разобрали на слайде — именно его возьмёт Run B после правки роута</div>
  <div><code>story-analysis/</code> и <code>safe-change/</code><br>разбор тикета до кода; отчёт о влиянии до правки общего кода</div>
  <div><code>.agents/skills/log-trace-analysis/</code><br>запустить скрипт на fixture вживую</div>
  <div><code>.agents/skills/README.md</code> и <code>.github/CODEOWNERS</code><br>реестр скиллов и их владельцы</div>
</div>

<!--
Время: 1:00.
Запускаю summarize на fixture — 68 строк лога превращаются в три группы.
-->

---
layout: center
---

<div class="eyebrow">Блок 5</div>

# Субагенты: отдельный контекст для шумной работы

<p class="muted" style="font-size: 26px">Разберём на кейсах, когда субагент помогает, а когда только мешает.</p>

<!--
Время: 0:15.
-->

---

# Интерактив: поможет ли субагент?

<table class="comparison quiz">
  <thead><tr><th>Задача</th><th>Ответ</th></tr></thead>
  <tbody>
    <tr><td>Лог MemLab на 40 МБ: найти, кто держит DOM</td><td><span v-click class="answer">Да. Шум остаётся у субагента, основной агент получает 20 строк сводки</span></td></tr>
    <tr><td>Кто использует id из manifest в 25 плагинах</td><td><span v-click class="answer">Да. Два-три explorer'а параллельно по разным частям репозитория</span></td></tr>
    <tr><td>Проверить diff перед словом «готово»</td><td><span v-click class="answer">Да. Ревьюер без контекста автора видит код, а не намерения</span></td></tr>
    <tr><td>Фича: один агент пишет API, второй UI, третий тесты — одновременно</td><td><span v-click class="answer no">Нет. Каждый примет свои неявные решения, и они разойдутся</span></td></tr>
    <tr><td>Переименовать prop в трёх файлах</td><td><span v-click class="answer no">Нет. Объяснить задачу дольше, чем сделать</span></td></tr>
  </tbody>
</table>

<p v-click style="margin-top: 1rem; font-size: 24px">Субагентам отдаём чтение и проверку, а код пишет один агент.</p>

<!--
Время: 1:40.
Опрашивать зал по строкам. Правило совпадает с опытом Anthropic и Cognition: параллельными делаем исследование и ревью,
а запись кода оставляем в одном потоке. Многоагентные системы тратят в разы больше токенов — на внутренней модели это время GPU.
-->

---

# Субагент <code>explorer</code> и как он потом используется

<div class="annotated">
<div class="file code-xs wrap">
<div class="file-head"><span>.agents/agents/explorer.md</span><span>demo/agent-ready-v2</span></div>

```md {all|1-5|6|8-12|14}
---
name: explorer
description: Исследует код, документацию и историю git только на чтение. Используй, чтобы ответить «как X сделано сейчас, что из этого канон и кто от этого зависит», не загружая файлы в основной контекст.
tools: Read, Grep, Glob, Bash   # Bash — только git log и git show
---
Ты исследуешь. Ты никогда не меняешь файлы.

Верни не больше 25 строк:
1. Ответ — 2–3 предложения.
2. Доказательства — file:line для каждого утверждения.
3. Канон или наследие — какие примеры совпадают с docs/architecture, какие нет.
4. Неизвестное — что не удалось подтвердить.

Не вставляй файлы целиком. Не предлагай реализацию.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Три способа вызова</b><p>Сам по description, когда задача совпадает с описанием. Из шага скилла или tasks.md: «поручи explorer». Явно по имени: «@explorer, кто использует manifest id?»</p></div>
  <div v-click="[1, 2]" class="note"><b>description решает, когда звать</b><p>Агент делегирует автоматически, если задача похожа на описание. Поэтому описание — про ситуацию, а не про роль.</p></div>
  <div v-click="[2, 3]" class="note"><b>Короткий список инструментов</b><p>Исследователь не должен «заодно поправить». Bash оставлен для git log и git show — это договорённость; в CLI с allowlist команд сузьте его там.</p></div>
  <div v-click="[3, 4]" class="note"><b>Контракт ответа</b><p>Лимит строк и file:line для каждого утверждения. Без этого вернётся простыня, и основной агент снова утонет.</p></div>
  <div v-click="4" class="note"><b>Норма или история</b><p>Explorer сразу отделяет эталон от архива — по документации, а не по тому, что выглядит свежее.</p></div>
</div>
</div>

<!--
Время: 1:30.
Формат frontmatter у разных агентных CLI немного отличается, суть одна: имя, когда звать, какие инструменты, что вернуть.
В демо explorer вызывается из tasks.md (шаг 2) и из скиллов safe-change и story-analysis. Рядом лежат reviewer и log-analyst.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: субагентов

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/a7e8ea4448cfd658a3f01fa2a15ebc79f6f1b06c" target="_blank">Шаг 5. Субагенты: explorer, reviewer, log-analyst</a></div>

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

# Проверки и ревью: «готово» доказывают командами

<p class="muted" style="font-size: 26px">Слабая модель не должна сама решать, что работа закончена. Это решают проверки и ревью.</p>

<!--
Время: 0:15.
-->

---

# Сообщение проверки — это следующий промпт для модели

<div class="two-col" style="align-items: start">
  <div>
    <div v-click class="flat-card bad"><h3>После такого слабая модель застрянет</h3></div>
    <div class="file wrap code-sm" style="margin-top: 12px">

```text
✖ Bundle check failed (code 3)
```

</div>

  </div>
  <div>
    <div v-click class="flat-card"><h3>А это она исправит сама</h3></div>
    <div class="file wrap code-xs" style="margin-top: 12px">

```text
✖ application-security-client: ленивые чанки (…)
  грузятся с publicPath "/", а shell проксирует
  для этого продукта только /application-security.js
  и /api/mf/application-security/*, поэтому через shell
  браузер получит index.html вместо чанка, и страница
  не откроется. Отдавай чанки через API-префикс продукта
  (например, publicPath "/api/mf/application-security/assets/")
  и меняй только файлы этого продукта — рецепт
  «Ленивые чанки через shell» в docs/architecture/microfrontends.md.
```

</div>

  </div>
</div>

<p v-click style="margin-top: 1rem; font-size: 25px">Модель читает вывод проверки буквально. Поэтому в сообщении должно быть, что нарушено, где, почему это плохо и куда смотреть. Хорошая ошибка заменяет абзац в инструкции.</p>

<!--
Время: 1:20.
Справа — сообщение check:bundle из демо-ветки, которое увидит Run B; сокращён только список чанков. Оно называет и причину, и разрешённый обход, и документ.
-->

---

# Ревью: агент в CI и отдельный ревьюер для критичного кода

<div class="annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>.agents/review/critical-paths.yml</span><span>demo/agent-ready-v2</span></div>

```yaml {all|1-2|3-6|7-9|10-12|13-15}
# Где одна строка может остановить работу всех команд.
# CI (scripts/select-reviewers.cjs) по изменённым путям добавляет отдельного ревьюера.
critical:
  - paths: [src/shell-app/server/lib/**, src/microfrontends/common/**]
    reviewer: platform-reviewer          # .agents/agents/platform-reviewer.md
    why: реестр, прокси и сборка всех продуктов — упадёт всё сразу
  - paths: ['src/microfrontends/*/manifest.json']
    reviewer: contract-reviewer
    why: id и routePath — публичный контракт, на них ссылки пользователей и MemLab
  - paths: [performance/**, scripts/check-*.cjs]
    reviewer: harness-reviewer
    why: ослабить проверку — значит выключить её для всех команд
default:
  reviewer: code-review                  # скилл .agents/skills/code-review
# Владельцев берём из CODEOWNERS. Агент комментирует и не аппрувит, мёрж — за человеком.
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro"><b>Каждый MR проходит агента-ревьюера</b><p>Сначала детерминированная check:architecture, потом скилл code-review. Для критичных путей CI добавляет отдельного ревьюера со своим чеклистом.</p></div>
  <div v-click="[1, 2]" class="note"><b>Зачем этот файл</b><p>В большом проекте есть места, где одна строка останавливает все команды. Их нужно назвать явно.</p></div>
  <div v-click="[2, 3]" class="note"><b>Реестр, прокси, общая сборка</b><p>Отдельный ревьюер знает, что здесь ломается молча: TTL, прокси, externals.</p></div>
  <div v-click="[3, 4]" class="note"><b>Публичные контракты</b><p>Переименованный id в manifest ломает ссылки пользователей и сценарии MemLab. Обычный ревьюер этого не заметит.</p></div>
  <div v-click="[4, 5]" class="note"><b>Сами проверки</b><p>Ослабленный baseline выключает защиту для всех. Правку проверок смотрит отдельный ревьюер и владелец.</p></div>
  <div v-click="5" class="note"><b>Решает человек</b><p>Агент комментирует со ссылкой на правило и не аппрувит. Мёрж остаётся за владельцем из CODEOWNERS.</p></div>
</div>
</div>

<!--
Время: 1:40.
Так устроены и коммерческие решения: пути в CodeRabbit, инструкции по путям в Copilot code review, специализированные агенты в Claude Code Review.
Мы делаем то же самое на внутренней модели: CI смотрит изменённые файлы, скрипт select-reviewers выбирает ревьюеров.
Правило против шума: нет ссылки на правило — нет комментария; мелочи не публикуем.
В публичном репозитории job выключен переменной AGENT_REVIEW_ENABLED: agent — наш внутренний CLI.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: проверки и ревью

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/081c1b9a5e766c66fc7faf32a73d13c6f350d6e7" target="_blank">Шаг 6. Проверки и агентное ревью</a></div>

<div class="practice-files">
  <div><code>scripts/check-architecture.cjs</code>, <code>check-bundle.cjs</code>, <code>check-memory.cjs</code><br>проверки с сообщениями, по которым можно исправить без человека</div>
  <div><code>.agents/review/critical-paths.yml</code> и <code>scripts/select-reviewers.cjs</code><br>какой ревьюер нужен для какого пути</div>
  <div><code>.agents/agents/platform-reviewer.md</code> и соседи<br>чеклисты для критичного кода</div>
  <div><code>.github/workflows/agent-review.yml</code> и <code>pull_request_template.md</code><br>как ревью запускается на каждом MR; к правке harness прикладываем прогон evals</div>
  <div><code>package.json</code>, <code>performance/bundle-baseline.json</code>, <code>tests/memlab/…</code><br>команды check:*, baseline бандла и сценарий памяти, на который опирается спека</div>
</div>

<!--
Время: 1:00.
Показать вживую: node scripts/select-reviewers.cjs src/shell-app/server/lib/registry.js src/microfrontends/users-and-roles/manifest.json README.md — обычный code-review плюс platform-reviewer и contract-reviewer; README.md ревьюера не добавляет.
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
      <li>если чанк не грузится — чинит в своём микрофронте, не трогая общий код</li>
    </ul>
  </div>
  <div v-click class="flat-card bad">
    <h3>Что ищем в трейсе Run A</h3>
    <ul>
      <li>какие проверки вообще запускал</li>
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

# Evals: как понять, что стало лучше, а не показалось

<p class="muted" style="font-size: 26px">Объясню с нуля: что это, зачем, как выглядит хороший и плохой eval и как завести их у себя.</p>

<!--
Время: 0:15.
-->

---

# Зачем вообще evals

<div class="two-col wide-left" style="align-items: start">
  <div>
    <p v-click style="font-size: 26px">Ситуация, которая случится у каждого. Кто-то поправил строку в AGENTS.md, или админы обновили внутреннюю модель до новой версии. Через неделю в чате: «по-моему, агент стал хуже». Кто-то согласен, кто-то нет — спорим на ощущениях.</p>
    <p v-click style="font-size: 26px">Eval — это автотест не для кода, а для агента вместе с вашей подготовкой проекта. Берём одну и ту же задачу, прогоняем агента несколько раз и считаем, сколько раз он справился. Было три из пяти, стало пять из пяти — значит, правка помогла.</p>
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
Anthropic пишет: команды без evals тратят недели на ручную проверку каждой новой модели, команды с evals переходят за дни.
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

<div class="two-col" style="margin-top: 1.3rem">
  <div v-click class="flat-card"><h3>Справился хоть раз</h3><p class="muted">pass@k — «вообще умеет». Растёт с числом попыток.</p></div>
  <div v-click class="flat-card"><h3>Справляется каждый раз</h3><p class="muted">pass^k — «можно доверять». Именно это нужно команде: при 75% за попытку три успеха подряд — всего 42%.</p></div>
</div>

<!--
Время: 1:10.
Терминология из статьи Anthropic «Demystifying evals for AI agents», 2026: task, trial, grader, outcome.
Главное: проверяем результат в репозитории, а не то, что агент написал «готово».
-->

---

# Как не надо: eval, который ничего не измеряет

<div class="annotated">
<div class="file code-sm bad">
<div class="file-head"><span>evals/cases/microfrontend.md — антипример</span></div>

```md {all|3-5|7-8|10-11|1}
# Кейс: микрофронт

## Задача
Добавь микрофронт. Используй common webpack helper и window
externals, не используй Module Federation.

## Проверка
Агент написал «готово», и сборка прошла.

## Прогоны
Один раз на моём ноутбуке — прошло ✅
```

</div>
<div class="notes">
  <div v-if="$clicks < 1" class="note intro bad"><b>Выглядит как eval</b><p>Задача, проверка, прогон — формально всё есть.</p></div>
  <div v-click="[1, 2]" class="note bad"><b>Ответ в задаче</b><p>Критерии отданы агенту. Мы проверяем, умеет ли он читать, а не справится ли без подсказки. В SWE-bench треть «решённых» задач содержала решение прямо в тексте.</p></div>
  <div v-click="[2, 3]" class="note bad"><b>Проверяем слова</b><p>«Готово» и зелёная сборка — не результат. Проверять нужно состояние репозитория.</p></div>
  <div v-click="[3, 4]" class="note bad"><b>Один прогон</b><p>Агент недетерминирован. Один успех может быть удачей.</p></div>
  <div v-click="4" class="note bad"><b>Кейс выдуман</b><p>Нет «откуда кейс» — значит, мы улучшаем то, что и так работало.</p></div>
</div>
</div>

<!--
Время: 1:00.
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
/audit-log) и зарегистрируй его в shell.

## Критерии          ← агент их не видит
- общий webpack helper и window externals на месте
- имена client/server и регистрации совпадают
- нет импортов соседей, второго рантайма и правок в common/
- в отчёте агента есть check:architecture

## Проверка
node evals/graders/add-microfrontend.cjs

## Откуда кейс
Агент скопировал webpack-конфиг соседа, в продукт
попал второй React (см. «Подводные камни»)
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
  <div v-click class="flat-card"><h3>Когда запускать</h3><p class="muted">MR в AGENTS.md, docs или скиллы — быстрый набор. Ночью — все кейсы. Новая версия внутренней модели — старая и новая рядом.</p></div>
  <div v-click class="flat-card"><h3>Сколько кейсов</h3><p class="muted">Anthropic советует начать с 20–50 задач из реальных промахов. Пять — уже лучше, чем ни одного.</p></div>
</div>

<!--
Время: 1:10.
Для внутренней модели это особенно важно: её обновляют админы, и без evals вы узнаете о регрессии от коллег через неделю.
-->

---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: evals

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/ee490d21755ea20e7148be5bd82baaca48b7bffb" target="_blank">Шаг 7. Evals: кейсы, grader и запуск</a></div>

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

<!--
Время: 0:15.
Переключиться в терминалы.
-->

---
class: compact-table
---

# Что смотрим в каждом прогоне

<table class="comparison">
  <thead><tr><th>Вопрос</th><th>Где смотреть</th><th>Что даёт подготовка в Run B</th></tr></thead>
  <tbody>
    <tr v-click><td>Какой рантайм выбрал</td><td>diff: webpack-конфиг, manifest</td><td>«Не копируй» в документации и check:architecture</td></tr>
    <tr v-click><td>Страница грузится лениво и открывается</td><td>check:bundle, страница через shell</td><td>сценарий в спеке, проверка бандла, разрешённый обход в своём микрофронте</td></tr>
    <tr v-click><td>Нет утечки после пагинации</td><td>MemLab-сценарий для своего роута</td><td>«готово» в спеке и performance-check</td></tr>
    <tr v-click><td>Не вышел за scope</td><td>список изменённых файлов</td><td>«вне scope» в спеке и safe-change для общего кода</td></tr>
    <tr v-click><td>Как рассуждал и на чём основано «готово»</td><td><code>agent-report.md</code> обоих прогонов</td><td>команды и их вывод вместо самооценки</td></tr>
  </tbody>
</table>

<!--
Время: 3:00.
Идти по строкам и открывать diff или вывод проверки обоих прогонов. Не утверждать заранее, что Run A ошибся.
Это демонстрация механизма, а не бенчмарк: для статистики есть evals.
-->

---

# Что поменялось между Run A и Run B

<div class="two-col">
  <pre v-click class="repo-tree">RUN A
задача в одну строку, без спеки
  ↓
соседний код и история PR
  ↓
модель угадывает норму
  ↓
«готово» = собралось</pre>

  <pre v-click class="repo-tree">RUN B
AGENTS.md → карта, запреты, что заденешь
  ↓
спека → сценарии, scope, «готово»
  ↓
docs → норма, что не копировать
  ↓
скиллы и explorer → порядок работы
  ↓
проверки и ревьюер → упал → исправил
  ↓
«готово» = вывод проверок</pre>
</div>

<p v-click style="margin-top: 1.3rem; font-size: 27px">Модель мы не меняли. Мы убрали то, что ей приходилось угадывать, и сделали её ошибки заметными до ревью человеком.</p>

<!--
Время: 1:00.
-->

---

# Итоги: что сделать на своём проекте

<div class="checklist">
  <div v-click>AGENTS.md до 60 строк: карта, запреты, «что заденешь», команды «готово»</div>
  <div v-click>Вложенные AGENTS.md там, где одна строка роняет всех</div>
  <div v-click>Документация с разделами «как правильно», «не копируй» и подводными камнями</div>
  <div v-click>Спека на каждое заметное изменение — прочитанная человеком до кода</div>
  <div v-click>Проверки с сообщениями, по которым модель исправит ошибку сама</div>
  <div v-click>Два-три скилла на повторяющуюся работу, у каждого есть владелец</div>
  <div v-click>Субагенты для исследования и ревью, а код пишет один агент</div>
  <div v-click>Агент-ревьюер в CI и отдельные ревьюеры для критичных путей</div>
  <div v-click>Пять eval-кейсов из реальных промахов и прогон при каждой правке</div>
</div>

<!--
Время: 1:20.
Слайд для фотографии. Всё показанное лежит в ветке demo/agent-ready-v2 — можно взять как шаблон.
-->

---
layout: center
---

<div class="huge">Это не модель делает фигню.<br><span class="green">Это проект не подготовлен.</span></div>

<p v-click class="muted" style="margin-top: 2.1rem; font-size: 1.25rem">Настройте проект — и даже внутренняя модель станет предсказуемой. Сильная модель поднимает потолок. А как часто вы до него дотягиваетесь, решает подготовка проекта.</p>

<p v-click style="margin-top: 1.4rem; font-size: 1.05rem">Demo: <code>github.com/spiderpoul/enterprise-app-optimization</code>, ветка <code>demo/agent-ready-v2</code></p>

<!--
Время: 0:40.
Вернуться к вопросу из начала: у кого есть внутренняя модель и кто ей не пользуется. Попробуйте один блок — хотя бы AGENTS.md и одну проверку.
Спасибо. Вопросы.
-->
