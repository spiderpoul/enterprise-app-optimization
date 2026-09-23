---
theme: default
title: "Демо-сессия «Не Claude единым: агентная разработка в закрытом контуре большого фронтенда»"
info: |
  Что делать, если Claude Code и Codex нельзя подключить к корпоративному репозиторию,
  а доступная внутренняя модель заметно чаще ошибается и галлюцинирует?

  Разбираем на реальном репозитории, что положить вокруг модели: AGENTS.md,
  документацию, спеки, skills, субагентов, проверки, агентное код-ревью и evals.
  Каждую часть показываем файлом из demo-ветки, в конце сравниваем два прогона
  одной модели — без обвязки и с ней.
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
Сегодня почти не будет абстракций. Всё, о чём говорю, покажу файлом из репозитория,
а в конце сравним, что сделала одна и та же модель в двух версиях этого репозитория.
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
Я Павел, Software Expert в Kaspersky. Девять с лишним лет в enterprise-разработке,
больше двухсот собеседований. Когда у нас появилась агентная разработка, я поставил себе
челлендж — перестать писать код руками. Пока держусь, но честно скажу: руками пишу меньше,
а думать приходится не меньше, а местами больше.
-->

---

# Кому знакомо?

<div class="grid-4">
  <div v-click class="flat-card bad">
    <h3 style="font-size: 29px">«Да самому быстрее сделать»</h3>
  </div>
  <div v-click class="flat-card bad">
    <h3 style="font-size: 29px">«Не хочу ревьюить AI-slop»</h3>
  </div>
  <div v-click class="flat-card bad">
    <h3 style="font-size: 27px">«Я полчаса объяснял — за 15 минут уже написал бы»</h3>
  </div>
  <div v-click class="flat-card bad">
    <h3 style="font-size: 26px">«Он вроде починил баг, но теперь я не понимаю, что он сломал»</h3>
  </div>
</div>

<p v-click style="margin-top: 1.8rem; font-size: 28px">У меня все четыре были в первый же месяц. Первая реакция — «модель слабая». Вторая, более полезная — «а что я ей вообще дал, кроме репозитория на миллион строк?»</p>

<!--
Время: 1:00.
Попросить поднять руки, кому знакома хотя бы пара фраз.
Дальше весь доклад — ответ на вопрос «что дать агенту, кроме репозитория».
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
Время: 1:00.
Это живой продукт, а не игрушечный репозиторий. Важна не цифра, а следствие:
в коде рядом лежат решения разных лет, и по коду не видно, какое из них актуальное.
Для агента «посмотри, как сделано рядом» — это лотерея.
-->

---

# Почему не просто взять облачную модель

<div class="two-col">
  <div>
    <div v-click class="flat-card"><h3>Код и логи нельзя вынести</h3><p class="muted">Исходники, логи и трейсы заказчиков — это policy, а не наше желание.</p></div>
    <div v-click class="flat-card" style="margin-top: 1rem"><h3>Внутренние системы за стеной</h3><p class="muted">Code search, Confluence, CI, трекер — облачный агент их не увидит.</p></div>
  </div>
  <div class="benchmark-strip" style="grid-template-columns: repeat(2, 1fr)">
    <div v-click class="benchmark"><b>45</b><span>GLM-5.3</span></div>
    <div v-click class="benchmark"><b>45</b><span>Claude Opus 5<br/>medium effort</span></div>
    <div v-click class="benchmark"><b>40</b><span>DeepSeek V4.1 Flash<br/>reasoning max</span></div>
    <div v-click class="benchmark"><b>38</b><span>Claude Sonnet 5<br/>max effort</span></div>
  </div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 27px">Модели, которые можно поднять у себя, уже на уровне топовых облачных. Разница в интеллекте перестала быть главной — главным стало то, что модель знает про ваш проект.</p>

<p v-after class="source">Artificial Analysis Intelligence Index, сентябрь 2026. Общий уровень модели; проверять всё равно нужно на своём репозитории.</p>

<!--
Время: 1:30.
Не говорю «облако плохое». Если Claude у вас разрешён и видит внутренние системы — отлично,
всё, что покажу дальше, работает и с ним. Но у нас так нельзя.
Цифры — баллы индекса Artificial Analysis, не проценты. Это не «внутренняя модель победила»,
а «она уже достаточно сильная, чтобы упираться не в интеллект, а в контекст».
-->

---

# Модель — только часть системы

<div v-click class="image-frame harness-hero-frame">
  <img src="/assets/harness-anatomy.png" alt="Harness anatomy" />
</div>

<div class="harness-legend">
  <div v-click><b>Модель</b><span>рассуждает и пишет код</span></div>
  <div v-click><b>Harness</b><span>всё, что лежит вокруг: инструкции, доки, спеки, skills, проверки, ревью</span></div>
</div>

<p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 7. Соотношение 10/90 — метафора авторов, не измерение.</p>

<!--
Время: 1:00.
Harness — обвязка вокруг модели. Дальше я разберу её по частям, и каждую покажу файлом.
-->

---

# План: запускаем сейчас, смотрим в конце

<div class="click-flow">
  <div v-click class="click-node"><b>Старт</b><span>два прогона одной модели</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>AGENTS.md и доки</b><span>что агент читает первым</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Spec и skills</b><span>что делать и как</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Субагенты, проверки, ревью</b><span>как не утонуть и не соврать</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Evals и результат</b><span>что получилось у каждого прогона</span></div>
</div>

<p v-click style="margin-top: 1.8rem; font-size: 27px">Каждый блок — одна идея, один файл из репозитория, что делать и что не делать. Пока я рассказываю, агенты работают.</p>

<!--
Время: 0:50.
Структура: небольшой кусок теории, сразу файл из репозитория, потом антипаттерны.
Агенты работают долго, поэтому запускаю их прямо сейчас, а результат смотрим в конце.
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
    <p class="muted">Обычный репозиторий: код, README, история PR.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B · <code>demo/agent-ready-v2</code></h3>
    <p>«Implement <code>openspec/changes/add-application-security/</code>»</p>
    <p class="muted">Тот же код + AGENTS.md, доки, spec, skills, субагенты, проверки.</p>
  </div>
</div>

<div v-click class="flat-card warn" style="margin-top: 1rem; padding: 18px 26px">
  <h3 style="font-size: 23px; margin-bottom: 6px">Оба промпта заканчиваются одинаково</h3>
  <p style="font-size: 20px">«When you are done, write a short report in Russian to <code>agent-report.md</code>: what you did, which checks you ran and their results, and your reasoning — key decisions, alternatives you rejected, doubts.»</p>
</div>

<p v-click style="margin-top: 1rem; font-size: 24px">Модель, настройки и продуктовая задача одинаковые. Отличается только то, что лежит в репозитории.</p>

<!--
Время: 1:30.
Переключиться в терминал, запустить обе сессии и вернуться к слайдам.
Одинаковые model settings. Run A не подсказываю ничего.
Честно проговорить: spec у Run B — тоже часть harness. Это не нечестное преимущество,
а ровно то, что мы и предлагаем делать: задача приходит к агенту уже разобранной.
Отчёт в конце — одинаковая просьба для обоих: в финале сравним не только диффы, но и то, как каждый рассуждал.
Если live-модель недоступна — дальше по тем же слайдам использую сохранённые трейсы и диффы репетиции.
-->

---
layout: center
---

<div v-click class="meme-kicker">Примерно так выглядела модель, когда я впервые сказал ей: «Пройдись по нашему репозиторию и найди баг»</div>

<div v-click class="meme-image meme-rescue">
  <img src="/assets/3.png" alt="Мем: испуганная модель в большом legacy-репозитории" />
</div>

<!--
Время: 0:40.
Первый запуск реально так и выглядел: агент бегал по проекту, открыл полсотни файлов
и уверенно починил не то.
-->

---

# Почему умная модель выбирает не тот пример

<div class="two-col wide-left">
  <div>
    <div v-click class="big-quote" style="font-size: 40px">Код — это архив решений за 9 лет, а не инструкция «как правильно сегодня».</div>
    <div v-click class="flat-card" style="margin-top: 1.15rem">
      <h3>В этом репозитории, например</h3>
      <p class="muted">Module Federation (PR #25, откачен в #26), eager-sharing (#27, #29), script-loader (#33, откачен в #34) и текущий вариант на window externals (#31). Все четыре выглядят рабочими.</p>
    </div>
  </div>
  <div v-click class="meme-image">
    <img src="/assets/office-legacy-patterns.jpg" alt="Офисный мем о выборе устаревшего паттерна" style="height: 430px; max-height: 49vh;" />
  </div>
</div>

<p v-click style="margin-top: 1.2rem; font-size: 26px">Пока никто явно не написал, какой вариант текущий, агент выбирает самый убедительный. Это не галлюцинация, это нормальное поведение на неоднозначных данных.</p>

<!--
Время: 1:30.
Это ровно то, во что попадает Run A: он найдёт в истории несколько «соседних реализаций».
Какую возьмёт — вопрос удачи. Дальше смотрим, как это снимается файлами.
-->

---
layout: center
---

<div class="eyebrow">Блок 1</div>

# AGENTS.md — первое, что читает агент

<p class="muted" style="font-size: 26px">Что в нём должно быть · файл из demo-ветки · вложенный AGENTS.md · антипример</p>

<!--
Время: 0:15.
-->

---

# Что должно быть в AGENTS.md

<div class="flow" style="grid-template-columns: repeat(5, 1fr)">
  <div v-click class="step"><span class="n">01</span><strong>Карта</strong><span>где что лежит и куда идти за подробностями</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Источник истины</strong><span>что делать, если код и доки расходятся</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Never</strong><span>3–5 жёстких запретов, которые дорого нарушить</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Что заденет</strong><span>кросс-зависимости: меняешь X — ломаешь Y</span></div>
  <div v-click class="step"><span class="n">05</span><strong>Done и stop</strong><span>какие команды доказывают готовность, когда остановиться и спросить</span></div>
</div>

<p v-click style="margin-top: 1.5rem; font-size: 27px">AGENTS.md грузится в каждую задачу. Каждая лишняя строка стоит контекста каждый раз — поэтому здесь только то, что нужно почти всегда. В demo-репозитории — около 50 строк.</p>

<!--
Время: 1:20.
Пять разделов. Четвёртый — то, чего чаще всего нет: карта кросс-зависимостей.
В продукте мы указываем кросс-зависимости и подводные камни и в AGENTS.md, и в доках каждой области. Сейчас покажу файл.
-->

---

# Файл: <code>AGENTS.md</code>

<div class="file code-sm">
<div class="file-head"><span>AGENTS.md</span><span>demo/agent-ready-v2</span></div>

```md {1-2|4-9|11-14|16-20|all}
# Enterprise App Optimization
Nx monorepo: shell + independently hosted React microfrontends. Node 22+.

## Where to look
- Shell, discovery, proxy → `src/shell-app/`
- Products → `src/microfrontends/<name>/` (client, server, manifest.json)
- Shared build/runtime → `src/microfrontends/common/` (has its own AGENTS.md)
- Architecture → `docs/architecture/` · Performance → `docs/performance.md`
- Current change → `openspec/changes/<id>/` · Skills → `.agents/skills/`

## Source of truth
Docs beat neighbouring code. History has Module Federation, script loaders
and eager sharing — all rejected (see docs/architecture/microfrontends.md).
If code and docs disagree, follow the docs and say so in your report.

## Never
- import one microfrontend from another
- bundle React / React Router into a microfrontend
- add a second loader, registry or federation runtime
- loosen a baseline in `performance/` to get a green check
```

</div>

<!--
Время: 1:30.
Идти по кликам.
Карта — только пути, без пересказа архитектуры. Детали по ссылке.
Источник истины — одна фраза, которая снимает главную неоднозначность legacy: доки важнее соседнего кода.
Never — четыре запрета. Не «пиши хороший код», а конкретные вещи, нарушение которых дорого стоит.
[TODO: один реальный пример из KSC, что ломалось при нарушении такого правила.]
-->

---

# <code>AGENTS.md</code>: что заденет и Done

<div class="file code-sm">
<div class="file-head"><span>AGENTS.md (продолжение)</span><span>demo/agent-ready-v2</span></div>

```md {1-8|10-13|all}
## What else you touch
| You change                           | It also affects                              | Run                  |
|--------------------------------------|----------------------------------------------|----------------------|
| common/webpack/createMicrofrontend…  | every product build, shared React runtime    | architecture, bundle |
| manifest.json id or routePath        | shell menu, saved links, MemLab selectors    | architecture         |
| shell useMicrofrontends.ts           | loading of all products, startup time        | bundle + smoke       |
| React / router version               | all products at once (window externals)      | npm run check        |
| paginated table or list              | detached DOM after navigation                | memory for the route |

## Done
Run the checks listed in the active spec; without a spec — `npm run check`.
Report: commands, results, what you did not verify and why.
Stop and ask before: a new shared dependency, a manifest id/route change, edits in common/.
```

</div>

<!--
Время: 1:20.
Таблица «что заденет»: в продукте такие указания о кросс-зависимостях у нас есть и в AGENTS.md, и в доках.
Агент видит не только файл, который правит, но и кого это касается и чем проверить.
В доке каждой области — полная таблица, в AGENTS.md — только самые опасные строки.
Done — это команды, а не «убедись, что всё работает». Stop — когда агент должен спросить человека.
-->

---

# Документация ближе к коду: вложенный AGENTS.md

<div class="two-col wide-right">
  <pre v-click class="repo-tree" style="font-size: 20px">AGENTS.md         ← весь репо
src/
└─ microfrontends/
   ├─ common/
   │  ├─ AGENTS.md ← common/
   │  ├─ webpack/
   │  └─ server/
   ├─ users-and-roles/
   └─ operations-reports/</pre>

  <div v-click class="file code-sm">
  <div class="file-head"><span>src/microfrontends/common/AGENTS.md</span></div>

```md
# common/ — shared by every microfrontend
Changes here ship to all products at once.
Owner: @platform-frontend (see CODEOWNERS).

- webpack/createMicrofrontendConfig.cjs declares window
  externals for React, JSX runtimes and React Router.
  Drop `react` → each product bundles its own React →
  "Invalid hook call" at runtime, the build stays green.
- server/index.js serves each product's client/dist at `/`
  in production — where the manifest `entryPath` points.
  Changing the static path breaks all manifests.

Before editing: use the safe-change skill,
run check:architecture and check:bundle.
```

  </div>
</div>

<!--
Время: 1:20.
Агент подхватывает вложенный AGENTS.md, когда работает в этой папке.
Локальные подводные камни живут рядом с кодом и не раздувают корневой файл.
Обратите внимание на формат: «что поменял → что сломается → как это проявится».
Фраза «сборка останется зелёной» — важная: это ровно та ошибка, которую агент сам не заметит.
-->

---

# Как не надо: AGENTS.md, который мешает

<div class="two-col wide-left">
  <div v-click class="file code-sm bad">
  <div class="file-head"><span>AGENTS.md — антипример</span></div>

```md
You are a senior React developer with 20 years
of experience. Always write clean, maintainable,
high-quality code. Be careful with performance!!!
Think step by step.

## React best practices
- Use functional components and hooks.
- Use useMemo and useCallback where appropriate.
  … 400 lines copied from Confluence (2023)

## Commands
- yarn test:unit        # removed in 2024
```

  </div>
  <div>
    <div v-click class="flat-card bad"><h3>Роль и «будь внимателен»</h3><p class="muted">Ноль информации. Модель и так старается.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Учебник по React</h3><p class="muted">Модель это знает. Не знает она ваших решений.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Протухшие команды</h3><p class="muted">Агент их запускает, падает и тратит полчаса на обход.</p></div>
  </div>
</div>

<p v-click style="margin-top: 0.9rem; font-size: 23px">Проверка простая: если строку можно вставить в AGENTS.md любого другого проекта — её там быть не должно.</p>

<!--
Время: 1:30.
[TODO: если было — пример из своей первой версии AGENTS.md.]
Про протухшие команды: лечится простой CI-проверкой, что каждая команда из AGENTS.md есть в package.json.
-->

---

# Live: что агенты прочитали первым

<div class="two-col">
  <div v-click class="flat-card bad">
    <h3>Run A</h3>
    <p class="muted">Ищем в трейсе: сколько файлов открыл до первой правки, какой микрофронт взял за образец, заглядывал ли в историю PR.</p>
  </div>
  <div v-click class="flat-card">
    <h3>Run B</h3>
    <p class="muted">Ищем: AGENTS.md → spec → docs/architecture → один эталонный микрофронт. Запустил ли explorer-субагента.</p>
  </div>
</div>

<p v-click style="margin-top: 1.5rem; font-size: 26px">Заглядываем на минуту и возвращаемся. Итог разберём в конце.</p>

<!--
Время: 1:00.
Переключиться в терминалы. Показать первые шаги каждого прогона.
Не комментировать качество Run A — просто показать, с чего он начал.
-->

---
layout: center
---

<div class="eyebrow">Блок 2</div>

# Документация, которая полезна агенту

<p class="muted" style="font-size: 26px">Что делает док полезным · файл из репо · плохо и хорошо</p>

<!--
Время: 0:15.
-->

---

# Какая документация реально помогает

<div class="checklist">
  <div v-click>Текущая норма — пошагово и с эталонным примером в коде</div>
  <div v-click>Почему так — одна-две фразы, иначе агент «улучшит»</div>
  <div v-click>Не копируй — исторические варианты, где их найти и чем плохи</div>
  <div v-click>Подводные камни — что ломается молча, без красной сборки</div>
  <div v-click>Что заденет — кто зависит от этой области</div>
  <div v-click>Как проверить — команда, а не «убедитесь»</div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 26px">Плюс шапка: owner, дата последнего ревью, связанная проверка. Док без владельца протухает первым.</p>

<!--
Время: 1:20.
Главное отличие дока «для агента» от обычного: он явно называет плохие примеры.
Человек помнит, что Module Federation откатили. Агент видит только код.
-->

---

# Файл: <code>microfrontends.md</code>

<div class="file code-xs">
<div class="file-head"><span>docs/architecture/microfrontends.md</span><span>фрагмент</span></div>

```md {1|3-9|11-16|18-24|all}
Owner: @platform-frontend · Reviewed: 2026-09 · Check: `npm run check:architecture`

## Current contract (do this)
1. Declare the product in `src/microfrontends/<name>/manifest.json`.
2. Build with `common/webpack/createMicrofrontendConfig.cjs` — never a local copy.
3. Export a React Router `RouteObject`; keep the page behind a dynamic import.
4. Register `<name>-client` / `<name>-server` in nx.json and root workspaces.
Reference implementation: `src/microfrontends/users-and-roles/`
(except step 3: its pages are still imported statically — read Pitfalls before step 3).

## Do not copy (looks valid, is not)
| Pattern                  | Where you will see it     | Why not                                 |
|--------------------------|---------------------------|-----------------------------------------|
| Module Federation        | PR #25, reverted in #26   | second runtime, duplicated React        |
| eager singleton sharing  | PR #27, #29               | each product bundles its own React      |
| script-tag registry      | PR #33, reverted in #34   | second registry beside the manifest     |

## Pitfalls
- A copied webpack config loses the window externals. The build passes, the page
  fails with "Invalid hook call". check:architecture catches it.
- manifest `routePath` must equal the exported route. Menu and router use the exported
  `path`, so the menu works but links to `routePath` show Not Found.
- `entryPath` must equal the client's `outputFileName`. Rename the output file alone →
  its entry 404s and the shell drops every product from the menu (one `Promise.all`).
```

</div>

<!--
Время: 1:30.
Идти по кликам: шапка с владельцем → текущий контракт с эталоном → «не копируй» с номерами PR → подводные камни.
Подводные камни написаны в формате «что сделал → что увидишь → чем поймать».
Именно этот раздел Run A взять неоткуда.
-->

---

# Одна и та же мысль — плохо и хорошо

<div class="two-col">
  <div v-click class="flat-card bad">
    <h3>Так агенту бесполезно</h3>
    <p>«Микрофронтенды должны следовать лучшим практикам и корректно использовать общие зависимости. Избегайте дублирования.»</p>
    <p class="muted">Какие практики? Какие зависимости? Как понять, что дублирование есть?</p>
  </div>
  <div v-click class="flat-card">
    <h3>Так работает</h3>
    <p>«Webpack-конфиг микрофронта создаётся только через <code>common/webpack</code>. Скопированный конфиг теряет externals: сборка зелёная, в рантайме “Invalid hook call”. Ловит <code>npm run check:architecture</code>.»</p>
  </div>
</div>

<div class="pattern-pair" style="margin-top: 1.4rem">
  <div v-click class="pattern-good"><b>✓ Конкретно</b><span>файл · последствие · симптом · команда проверки</span></div>
  <div v-click class="pattern-bad"><b>✕ Абстрактно</b><span>«лучшие практики», «корректно», «избегайте», «по возможности»</span></div>
</div>

<!--
Время: 1:20.
Правило, которое мы используем при ревью доков: в абзаце должен быть хотя бы один путь к файлу
или команда. Нет ни того, ни другого — скорее всего, это вода.
-->

---
layout: center
---

<div class="eyebrow">Блок 3</div>

# Spec: что именно делаем

<p class="muted" style="font-size: 26px">SDD в legacy · требования к spec · файл · антипаттерны</p>

<!--
Время: 0:15.
-->

---

# SDD в legacy: spec на один change, а не на весь продукт

<div class="click-flow">
  <div v-click class="click-node"><b>Задача</b><span>понятная бизнес-цель, ограниченный scope</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Draft</b><span>агент собирает факты из кода и тестов</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Ревью человеком</b><span>владелец области правит норму и scope</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Реализация</b><span>агент + проверки + ревью</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Архив</b><span>spec остаётся рядом с изменением</span></div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 26px">Мы не документируем 9 лет продукта. Каждое новое изменение оставляет после себя явную норму — и legacy постепенно становится понятнее.</p>

<p v-click class="muted" style="font-size: 22px">Формат не принципиален: OpenSpec, Spec Kit или просто Markdown. В demo — OpenSpec.</p>

<!--
Время: 1:10.
Draft может написать агент — по коду, тестам и тикету. Но spec, которую никто из людей не прочитал,
это не spec, а ещё один сгенерированный текст. Ревью человеком — обязательный шаг.
-->

---

# Какие требования мы предъявляем к spec

<div class="two-col">
  <div>
    <div v-click class="flat-card"><h3>1 · Поведение, а не реализация</h3><p class="muted">Что увидит пользователь. Как — решает агент в рамках доков.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>2 · Сценарии WHEN / THEN</h3><p class="muted">Каждый можно проверить руками или тестом.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>3 · Scope и разрешения</h3><p class="muted">Что не трогаем — и что можно менять, если упёрлись: например, конфиг своего микрофронта.</p></div>
  </div>
  <div>
    <div v-click class="flat-card"><h3>4 · Ссылки на доки</h3><p class="muted">Не пересказываем архитектуру — ссылаемся.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>5 · Done — это команды</h3><p class="muted">Конкретные проверки, включая сценарий для этого роута.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>6 · Открытых вопросов нет</h3><p class="muted">Вопросы закрываем до кода. Размер — 1–2 экрана, больше — режем change.</p></div>
  </div>
</div>

<!--
Время: 1:20.
Шесть требований. Если хотя бы одного нет — spec возвращается на доработку, так же как код на ревью.
Самые частые проблемы: нет out of scope и Done в стиле «протестировать».
[TODO: какие требования к spec реально проверяются у вас на ревью.]
-->

---

# Файл: <code>spec.md</code> для Application Security

<div class="file code-xxs">
<div class="file-head"><span>openspec/changes/add-application-security/spec.md</span><span>фрагмент</span></div>

```md {1-3|5-8|10-12|14-17|19-21|23-27|all}
### Requirement: Application Security inventory page
The shell SHALL show "Application Security" in navigation and open a paginated
inventory at `/application-security`.

#### Scenario: open from the menu
- WHEN the user clicks "Application Security"
- THEN a table of applications is shown, with loading, empty and error states
- AND the page code is downloaded only at this moment (lazy chunk)

#### Scenario: leave after paging
- WHEN the user pages to the last page and navigates away
- THEN no detached DOM is retained by application code

## If the lazy chunk does not work
You may change this microfrontend's own config (Babel, webpack, its server) until the
chunk loads through the shell and the checks pass. Describe the workaround in the report.
Recipe: "Lazy chunks through the shell" in docs/architecture/microfrontends.md.

## Out of scope
- editing, filters, export
- changes in `src/microfrontends/common/`, the shell or other products

## Done
npm run lint · npm run build · npm run check:architecture · npm run check:bundle
npm run check:memory -- tests/memlab/application-security.scenario.js
The memory scenario for this route is a deliverable. Do not substitute another
route's scenario or report "build passed" as evidence.
```

</div>

<!--
Время: 1:30.
Раздел «If the lazy chunk does not work» — разрешение: если упёрся в платформу, можно менять конфиг
только своего микрофронта, и где лежит рецепт. Без него агент либо сдаётся, либо лезет чинить общий код.
Обратите внимание на последние строки: мы заранее закрываем «дешёвые» способы объявить успех.
Такие фразы появляются после прогонов, где агент именно так и поступил: подменил сценарий или отчитался сборкой.
-->

---

# Как не надо писать spec

<div class="grid-4" style="grid-template-columns: repeat(2, 1fr)">
  <div v-click class="flat-card bad"><h3>«Сделать страницу, как у соседей, красиво и быстро»</h3><p class="muted">Нет сценариев, нет Done. Агент придумает всё сам.</p></div>
  <div v-click class="flat-card bad"><h3>20 страниц с кодом внутри</h3><p class="muted">Spec превратилась в реализацию, причём устаревшую к моменту старта.</p></div>
  <div v-click class="flat-card bad"><h3>Spec сгенерирована и никем не прочитана</h3><p class="muted">Агент реализует гипотезы другого агента.</p></div>
  <div v-click class="flat-card bad"><h3>Done: «проверить, что всё работает»</h3><p class="muted">Агент проверит, что собралось. И напишет «готово».</p></div>
</div>

<!--
Время: 1:00.
Коротко пройтись. Четвёртый пункт — самый частый.
-->

---
layout: center
---

<div class="eyebrow">Блок 4</div>

# Skills: как делать повторяющуюся работу

<p class="muted" style="font-size: 26px">Что куда класть · наши skills · два SKILL.md · зоопарк · как шарим</p>

<!--
Время: 0:15.
-->

---

# Что куда класть

<table class="comparison">
  <thead><tr><th>Что это</th><th>Куда</th><th>Пример из репо</th></tr></thead>
  <tbody>
    <tr v-click><td>Знание: как устроено и почему</td><td>docs рядом с кодом</td><td><code>docs/architecture/microfrontends.md</code></td></tr>
    <tr v-click><td>Короткое правило «всегда / никогда»</td><td>AGENTS.md</td><td>«не импортировать микрофронты друг из друга»</td></tr>
    <tr v-click><td>Правило, которое можно проверить машиной</td><td>script / CI gate</td><td><code>scripts/check-architecture.cjs</code></td></tr>
    <tr v-click><td>Процедура из нескольких шагов</td><td>skill</td><td><code>.agents/skills/safe-change/</code></td></tr>
    <tr v-click><td>Доступ к внешней системе</td><td>tool / MCP</td><td>code search, трекер, логи стендов</td></tr>
  </tbody>
</table>

<p v-click style="margin-top: 1.3rem; font-size: 26px">Skill — это «как делать», а не «что знать». Если в skill пересказана архитектура — её место в доке.</p>

<!--
Время: 1:20.
Эту таблицу я показываю каждой команде, которая начинает писать skills.
Самая частая ошибка — делать skill из знания: react-best-practices, webpack-rules.
-->

---

# Skills, которые мы используем

<div class="skill-grid">
  <div v-click class="flat-card"><h3>log-trace-analysis</h3><p class="muted">Разбор больших логов и трейсов: скрипт группирует ошибки по traceId, модель объясняет причину и находит код.</p></div>
  <div v-click class="flat-card"><h3>safe-change</h3><p class="muted">Безопасное внедрение правок в общий код: impact-отчёт до правки, аддитивный rollout, план отката.</p></div>
  <div v-click class="flat-card"><h3>ui-form</h3><p class="muted">Формы по нашему UI-kit: эталонная форма, валидация, состояния, доступность.</p></div>
  <div v-click class="flat-card"><h3>performance-check</h3><p class="muted">По типу изменения выбирает нужные проверки: bundle, memory, render.</p></div>
  <div v-click class="flat-card"><h3>code-review</h3><p class="muted">Тот же чеклист, что гоняет агент-ревьюер в CI. Можно запустить локально до MR.</p></div>
  <div v-click class="flat-card warn"><h3>С чего начать</h3><p class="muted">Найдите задачу, которую делаете каждую неделю и каждый раз объясняете агенту заново. Это первый skill.</p></div>
</div>

<!--
Время: 1:20.
Разбор логов экономит контекст:
логи на сотни мегабайт агент не читает, их читает скрипт. Второй — страховка для общего кода,
где ошибка бьёт по всем 25 плагинам.
ui-form — форм в продукте много, и без skill каждая получается чуть по-своему.
[TODO: какой skill у вас оказался самым полезным и почему — одна живая история.]
-->

---

# Анатомия skill

<div class="two-col wide-right">
  <pre v-click class="repo-tree">.agents/skills/
├─ README.md            ← реестр
├─ log-trace-analysis/
│  ├─ SKILL.md
│  └─ scripts/
│     └─ summarize.cjs
├─ safe-change/
│  └─ SKILL.md
├─ ui-form/
│  ├─ SKILL.md
│  └─ references/
│     └─ form-checklist.md
├─ performance-check/
└─ code-review/</pre>
  <div>
    <div v-click class="flat-card"><h3>description</h3><p class="muted">Единственное, что агент видит всегда. По нему он решает, открывать ли skill. Пишем: когда использовать и когда нет.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>SKILL.md</h3><p class="muted">Шаги, stop conditions, формат результата. До 100 строк.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>scripts / references</h3><p class="muted">Всё детерминированное — в скрипт. Длинные справочники — в references, читаются по необходимости.</p></div>
  </div>
</div>

<!--
Время: 1:20.
Progressive disclosure: description всегда в контексте, SKILL.md — когда skill выбран,
references и scripts — только когда реально понадобились.
-->

---

# Файл: skill <code>safe-change</code>

<div class="file code-xs">
<div class="file-head"><span>.agents/skills/safe-change/SKILL.md</span><span>demo/agent-ready-v2</span></div>

```md {1-6|8-11|12-13|14-15|16-19|all}
---
name: safe-change
description: 'Use before changing shared code or public contracts — anything in the
  AGENTS.md "What else you touch" table: common/, manifests, shell discovery, shared
  dependencies. Not needed for changes inside a single product.'
---

1. Name the contract you touch and start from the "What else you touch" table and the
   "Blast radius" section of the matching doc.
2. Find real consumers with search (imports, manifest ids, route paths). If more than one
   product is affected, delegate to the `explorer` subagent. List consumers as file:line.
3. Prefer an additive rollout: add new → migrate consumers → remove old in a separate
   change. Never rename a manifest id or route in place.
4. Write the impact report BEFORE editing. Stop and ask the owner from CODEOWNERS if a
   consumer may live outside this repo or a baseline would have to be loosened.
5. Implement. Run the checks for every affected area, not only for the file you edited.
6. Report: impact table, checks with results, rollback step.

| Changed | Consumers (file:line) | Risk | Check | Rollback |
```

</div>

<!--
Время: 1:30.
Смысл skill — порядок: сначала понять, кого задену, потом писать код. Агент по умолчанию делает наоборот.
Шаг 4 — stop condition. Без него агент будет «героически» доводить опасную правку до конца.
-->

---

# <code>log-trace-analysis</code>: скрипт читает, модель думает

<div class="two-col">
  <div v-click class="file code-xs">
  <div class="file-head"><span>.agents/skills/log-trace-analysis/SKILL.md</span></div>

```md
---
name: log-trace-analysis
description: Use when a task includes logs, HAR
  files or traces longer than a few hundred lines —
  to find the first failure, follow it across
  services and name the owning code.
---
1. Never read the raw file. Run
   `node .agents/skills/log-trace-analysis/
    scripts/summarize.cjs <file>`
2. Take the earliest failing traceId, re-run
   with `--trace <id>` for its timeline.
3. Map the failing URL to code: API prefix →
   manifest.json → server route.
4. Answer: first failure, chain of consequences,
   owning code (file:line), confidence, and what
   the log does NOT show.
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
    <p v-click style="margin-top: 1rem; font-size: 23px">Сколько бы строк ни было в логе, в контекст модели попадает только сводка. Решение о причине — всё ещё за моделью.</p>
  </div>
</div>

<!--
Время: 1:20.
Группировка, подсчёт, сортировка по времени — детерминированная работа, её не нужно поручать рассуждению.
Модель подключается там, где нужна интерпретация: какая ошибка первопричина, а какая следствие.
Вывод справа — реальный запуск скрипта на fixtures/sample.log из demo-ветки, его можно повторить вживую.
[TODO: реальный эффект skill в KSC — например, сколько времени занимал разбор инцидента до и после.]
-->

---

# Как не надо: зоопарк skills

<div class="two-col">
  <pre v-click class="repo-tree">❌ .agents/skills/
├─ react-best-practices/
├─ webpack-rules/
├─ microfrontend-rules/
├─ typescript-tips/
├─ hooks/
├─ optimization/
└─ do-everything/      ← 900 строк</pre>
  <div>
    <div v-click class="flat-card bad"><h3>Знание вместо процедуры</h3><p class="muted">«rules» и «best-practices» — это доки. Как skill они дублируют и расходятся.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Размытый description</h3><p class="muted">«Helps with frontend» — агент открывает его на каждую задачу или никогда.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Skill без проверки пользы</h3><p class="muted">Если без него задача решается так же — он не нужен.</p></div>
  </div>
</div>

<!--
Время: 1:10.
Такой зоопарк быстро вырастает, если skills пишет каждый для себя. Лишние видно по evals — о них дальше.
[TODO: если было у вас — сколько skills удалили.]
-->

---

# Как мы шарим skills между командами

<div class="two-col">
  <div v-click class="file code-sm">
  <div class="file-head"><span>.github/CODEOWNERS</span></div>

```text
# Harness is code: every rule has an owner
/AGENTS.md                           @platform-frontend
/docs/architecture/                  @platform-frontend
/docs/performance.md                 @perf-guild
/src/microfrontends/common/          @platform-frontend

/.agents/skills/safe-change/         @platform-frontend
/.agents/skills/performance-check/   @perf-guild
/.agents/skills/log-trace-analysis/  @observability
/.agents/skills/ui-form/             @design-system
/.agents/skills/code-review/         @platform-frontend
/.agents/agents/                     @platform-frontend
/evals/                              @platform-frontend
```

  </div>
  <div>
    <ul>
      <li v-click><b>Монорепо:</b> skills лежат в <code>.agents/skills/</code>, каждая команда получает их с <code>git pull</code>.</li>
      <li v-click><b>CODEOWNERS:</b> правка skill — это MR, который аппрувит команда-владелец.</li>
      <li v-click><b>Реестр:</b> <code>.agents/skills/README.md</code> — что делает, когда брать, owner, eval-кейс.</li>
      <li v-click><b>Вход нового skill:</b> только вместе с eval-кейсом и прогоном «до / после».</li>
      <li v-click><b>Личные эксперименты:</b> локально у себя; в общий <code>.agents/</code> — только через MR.</li>
    </ul>
  </div>
</div>

<!--
Время: 1:20.
Никакой отдельной платформы: skills — это код, и живут они по правилам кода.
Владелец отвечает за актуальность и ревьюит правки. Если у skill нет владельца — это чей-то личный промпт.
Например, ui-form может вести команда дизайн-системы, а пользоваться — все.
[TODO: сверить имена команд-владельцев и пункты про реестр/анонс с реальной практикой.]
-->

---
layout: center
---

<div class="eyebrow">Блок 5</div>

# Субагенты: изолируем контекст

<p class="muted" style="font-size: 26px">Когда нужны · файл субагента · «команда агентов» как антипаттерн</p>

<!--
Время: 0:15.
-->

---

# Зачем субагенты и когда они не нужны

<div class="subagent-flow">
  <div v-click class="sub-root"><b>Root agent</b><span>держит цель, spec и решение. Пишет код.</span></div>
  <div class="sub-branches" style="grid-template-columns: repeat(4, minmax(0, 1fr))">
    <div v-click class="sub-card"><b>explorer</b><span>«как устроен users-and-roles» · read-only</span></div>
    <div v-click class="sub-card"><b>explorer</b><span>«кто зависит от регистрации роутов» · read-only</span></div>
    <div v-click class="sub-card"><b>log-analyst</b><span>разбор логов упавшей проверки</span></div>
    <div v-click class="sub-card"><b>reviewer</b><span>свежий взгляд на diff перед «готово»</span></div>
  </div>
  <div v-click class="sub-result"><b>Возвращают 20–25 строк с file:line</b><span>вместо 50 открытых файлов в контексте root-агента</span></div>
</div>

<div class="pattern-pair" style="margin-top: 1.2rem">
  <div v-click class="pattern-good"><b>✓ Да</b><span>независимые вопросы, большой шумный ввод (логи, история), независимое ревью</span></div>
  <div v-click class="pattern-bad"><b>✕ Нет</b><span>правка одного файла, последовательная задача, общий изменяемый state</span></div>
</div>

<!--
Время: 1:20.
Главная ценность субагента — не параллельность, а чистый контекст.
Explorer прочитал 40 файлов, а root получил 20 строк с доказательствами.
Reviewer не видел рассуждений автора, поэтому смотрит на diff, а не на намерения.
-->

---

# Файл: субагент <code>explorer</code>

<div class="two-col wide-left">
  <div v-click class="file code-sm">
  <div class="file-head"><span>.agents/agents/explorer.md</span></div>

```md {1-7|8|10-15|17|all}
---
name: explorer
description: Read-only research of code, docs and git
  history. Use to answer "how is X done now, what is
  canonical, who depends on it".
tools: read, grep, glob, git log, git show
---
You investigate. You never edit files.

Return at most 25 lines:
1. Answer — 2–3 sentences.
2. Evidence — file:line for every claim.
3. Canonical vs historical — which examples match
   docs/architecture, which do not.
4. Unknowns — what you could not confirm.

Do not paste whole files. Do not propose an implementation.
```

  </div>
  <div>
    <div v-click class="flat-card"><h3>Права</h3><p class="muted">Только чтение. Исследователь не должен «заодно поправить».</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>Контракт ответа</h3><p class="muted">Лимит строк и обязательные доказательства. Без этого вернётся простыня.</p></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><h3>Canonical vs historical</h3><p class="muted">Explorer сразу отделяет норму от архива — по докам, а не по «выглядит свежее».</p></div>
  </div>
</div>

<!--
Время: 1:20.
Формат frontmatter зависит от вашего агента — у разных CLI он немного разный, суть та же:
имя, когда звать, какие инструменты разрешены, что вернуть.
Рядом лежат reviewer.md и log-analyst.md, устроены так же.
-->

---

# Как не надо: «команда агентов»

<div class="two-col">
  <div>
    <div v-click class="flat-card bad"><h3>PM → архитектор → разработчик → QA</h3><p class="muted">Четыре пересказа одной задачи. Каждый теряет детали, а исправить их некому.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Два субагента правят одни файлы</h3><p class="muted">Конфликты, которые потом разбирает человек.</p></div>
  </div>
  <div>
    <div v-click class="flat-card bad"><h3>Весь контекст «на всякий случай»</h3><p class="muted">Изоляция потеряна, субагент тонет так же, как root.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Ревью тем же агентом в том же контексте</h3><p class="muted">Он проверяет свои рассуждения, а не код.</p></div>
  </div>
</div>

<p v-click style="margin-top: 1.4rem; font-size: 26px">Субагент — это вызов функции: узкий вход, понятный выход. Не сотрудник с должностью.</p>

<!--
Время: 1:10.
Ролевые «команды агентов» красиво выглядят на демо и плохо работают в большом проекте.
-->

---
layout: center
---

<div v-click class="meme-image">
  <img src="/assets/2.jfif" alt="Мем про наблюдение за работой нескольких агентов" style="height: 570px; max-height: 64vh;" />
</div>

<div v-click class="meme-caption" style="margin-top: 1rem">А потом сидим и смотрим, как всё крутится</div>

<!--
Время: 0:30.
Короткая пауза. Можно заглянуть в терминал Run B — видно ли, что он запускал explorer.
-->

---
layout: center
---

<div class="eyebrow">Блок 6</div>

# Проверки и код-ревью: среда не даёт соврать

<p class="muted" style="font-size: 26px">Ошибки как промпт · агент-ревьюер в CI · как не надо</p>

<!--
Время: 0:15.
-->

---

# Текст ошибки проверки — это промпт для агента

<div class="two-col">
  <div v-click>
    <div class="flat-card bad"><h3>Агент не поймёт, что делать</h3></div>

```text
✖ Architecture check failed (code 3)
```

  </div>
  <div v-click>
    <div class="flat-card"><h3>Агент исправит сам</h3></div>

```text
src/microfrontends/application-security/
client/webpack.config.cjs bypasses the common
microfrontend webpack configuration.
Expected ../../common/webpack/
createMicrofrontendConfig.cjs.
```

  </div>
</div>

<div class="roadmap" style="margin-top: 1.3rem; grid-template-columns: repeat(4, 1fr)">
  <div v-click><b>что</b><span>какое правило нарушено</span></div>
  <div v-click><b>где</b><span>файл, а лучше строка</span></div>
  <div v-click><b>почему</b><span>чем это плохо</span></div>
  <div v-click><b>куда</b><span>правильный путь или док</span></div>
</div>

<!--
Время: 1:20.
Правое сообщение — реальный вывод scripts/check-architecture.cjs из demo-ветки.
Ещё пример в demo-ветке — check:bundle: «lazy chunks … load from publicPath "/", but the shell proxies only …
Serve chunks through the product's API prefix … see "Lazy chunks through the shell"». Сообщение само называет обход.
Один хороший gate с понятной ошибкой полезнее десяти строк «будь внимателен» в инструкциях.
И ещё: агент не решает сам, что он закончил. Это решают проверки из Done в spec.
-->

---

# Live: упал ли Run B на проверке

<div class="two-col" style="align-items: start">
  <div v-click class="flat-card">
    <h3>Что ищем в трейсе Run B</h3>
    <ul>
      <li>какая проверка упала первой</li>
      <li>прочитал ли он сообщение и док по ссылке</li>
      <li>исправил код или попытался ослабить проверку</li>
      <li>если чанк не грузится — чинит в своём микрофронте, не трогая common/ и shell</li>
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
Если Run B прошёл всё с первого раза — показать сохранённый fail → fix из репетиции.
Сам цикл «упал → прочитал → исправил» важнее, чем то, случился ли он сегодня.
-->

---

# Код-ревью: агент в CI на каждый MR

<div class="click-flow">
  <div v-click class="click-node"><b>MR открыт</b><span>diff + spec, если есть</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Сначала факты</b><span>lint, build, architecture, bundle</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Агент-ревьюер</b><span>skill code-review, читает только доки затронутых областей</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Комментарии</b><span>blocker / risk, каждый со ссылкой на правило</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Человек решает</b><span>агент не аппрувит и не пушит</span></div>
</div>

<p v-click style="margin-top: 1.6rem; font-size: 26px">Агент снимает с ревьюера механическую часть: контракты, scope, забытые проверки. Человек смотрит на смысл и риски.</p>

<p v-click class="muted" style="font-size: 22px">Каждый комментарий размечается «полезно / мимо». Пропущенные баги и ложные срабатывания становятся eval-кейсами для skill code-review.</p>

<!--
Время: 1:20.
Порядок важен: сначала детерминированные проверки. Нет смысла тратить модель на то, что ловит линтер.
Агент ревьюит тем же skill, который разработчик может запустить локально до MR —
поэтому сюрпризов в CI меньше.
-->

---

# Файлы: skill <code>code-review</code> и CI job

<div class="two-col">
  <div v-click class="file code-xs">
  <div class="file-head"><span>.agents/skills/code-review/SKILL.md</span></div>

```md
---
name: code-review
description: Review a merge request diff against this
  repository's contracts. Used by CI and locally.
---
1. Read AGENTS.md, then only the docs for areas the
   diff touches.
2. Check in order: contracts and "What else you
   touch" → spec and scope → performance → were the
   spec's checks run.
3. Every comment cites a rule (doc + section) or a
   failing check. No rule — no comment.
4. Severity: blocker | risk. Nits are not posted.
5. At most 10 comments; summarise the rest.
6. Never approve, never push.
```

  </div>
  <div v-click class="file code-xs">
  <div class="file-head"><span>.github/workflows/agent-review.yml</span></div>

```yaml
on: pull_request
jobs:
  agent-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: npm ci
      - run: npm run check:architecture
      - run: git diff "origin/$BASE...HEAD" > mr.diff
        env: { BASE: "${{ github.base_ref }}" }
      # internal agent CLI, model inside our perimeter
      - run: agent review --skill code-review
             --diff mr.diff --out review.json
      - run: node scripts/post-review.cjs review.json
```

  </div>
</div>

<!--
Время: 1:30.
В demo-репозитории это GitHub Actions; в GitLab CI устроено так же.
[TODO: как это называется и где запускается у вас.]
Права job: только чтение кода и запись комментариев. Никаких push и approve.
Правило «нет ссылки на правило — нет комментария» — главный фильтр шума.
-->

---

# Как не надо: агентное ревью, которое выключат через неделю

<div class="two-col">
  <div>
    <div v-click class="flat-card bad"><h3>40 комментариев про стиль</h3><p class="muted">Через неделю их перестают читать — вместе с важными.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Ревью без контекста проекта</h3><p class="muted">«Consider adding error handling» — generic советы, которые верны для любого кода.</p></div>
  </div>
  <div>
    <div v-click class="flat-card bad"><h3>Агент аппрувит сам</h3><p class="muted">Ответственность за мёрж размыта. Это решение человека.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Нет обратной связи</h3><p class="muted">Ложные срабатывания не собираются — ревьюер не становится лучше.</p></div>
  </div>
</div>

<!--
Время: 1:00.
Самый частый — первый: шумный ревьюер быстро приучает людей не читать его комментарии.
-->

---
layout: center
---

<div class="eyebrow">Блок 7</div>

# Evals: помогло ли то, что мы поменяли

<p class="muted" style="font-size: 26px">Test vs skill vs eval · цикл на практике · кейс и grader · правило для MR</p>

<!--
Время: 0:15.
-->

---

# Test, skill и eval — три разных вопроса

<div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px">
  <div v-click class="flat-card">
    <h3>Test / gate</h3>
    <p>Этот код проходит требование?</p>
    <p class="muted">lazy chunk есть · bundle в бюджете · утечки нет</p>
  </div>
  <div v-click class="flat-card">
    <h3>Skill / doc / rule</h3>
    <p>Гипотеза: «с этим агент справится лучше»</p>
    <p class="muted">добавили таблицу «что заденет», переписали description</p>
  </div>
  <div v-click class="flat-card">
    <h3>Eval</h3>
    <p>Гипотеза подтвердилась?</p>
    <p class="muted">одна задача · фиксированный коммит · тот же grader · несколько прогонов до и после</p>
  </div>
</div>

<p v-click style="margin-top: 1.5rem; font-size: 26px">Без evals любая правка AGENTS.md — это вкусовщина. С ними — эксперимент с результатом.</p>

<!--
Время: 1:10.
Eval проверяет не код, а обвязку: стали ли агенты чаще справляться после нашей правки.
-->

---

# Как это выглядит на практике

<div class="click-flow eval-flow">
  <div v-click class="click-node"><b>Промах</b><span>агент в MR скопировал webpack-конфиг соседа</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Кейс</b><span>задача из MR + коммит до правки</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Grader</b><span>скрипт: проверки + «common helper использован»</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Baseline</b><span>5 прогонов на текущем harness</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Правка</b><span>pitfall в доке / строка в AGENTS.md</span></div>
  <div v-click class="click-arrow">→</div>
  <div v-click class="click-node"><b>Ещё 5 прогонов</b><span>стало лучше — мёржим, кейс остаётся</span></div>
</div>

<div class="two-col" style="margin-top: 1.3rem">
  <div v-click class="flat-card"><h3>Когда гонять</h3><p class="muted">Каждый MR, который меняет AGENTS.md, docs/architecture, <code>.agents/</code>. Плюс ночной прогон всего набора — ловит деградацию при обновлении модели.</p></div>
  <div v-click class="flat-card"><h3>С чего начать</h3><p class="muted">Один реальный промах, один скрипт-grader, 3–5 прогонов. Без LLM-судьи, дашбордов и платформы.</p></div>
</div>

<!--
Время: 1:20.
Ночной прогон особенно полезен, когда обновляется внутренняя модель: сразу видно, какие кейсы просели.
Пять прогонов — не статистика, но достаточно, чтобы отличить «помогло» от «повезло один раз».
[TODO: если есть — заменить пример промаха на реальный случай из KSC.]
-->

---

# Файлы: eval-кейс и grader

<div class="two-col">
  <div v-click class="file code-xs">
  <div class="file-head"><span>evals/cases/add-microfrontend.md</span></div>

```md
# Add microfrontend
Start commit: f9dbc81

## Task            ← only this goes to the agent
Add a product microfrontend and register it
with the shell using the current contracts.

## Oracle          ← hidden from the agent
- common webpack helper and window externals kept
- client/server names and registrations aligned
- no sibling imports, no second runtime

## Grader
node evals/graders/add-microfrontend.cjs

## Came from
MR where the agent copied a sibling's webpack
config (see Pitfalls in microfrontends.md)
```

  </div>
  <div v-click class="file code-xs">
  <div class="file-head"><span>evals/graders/add-microfrontend.cjs</span></div>

```js
const checks = {
  architecture: () => run('npm run check:architecture'),
  bundle:       () => run('npm run check:bundle'),
  lint:         () => run('npm run lint'),
  noFederation: () => !grep('ModuleFederationPlugin', 'src'),
  inScope:      () => changedFiles().every(
    (f) => !f.startsWith('src/microfrontends/common/')),
  reportedChecks: () => /check:architecture/
    .test(readAgentReport()),
};

// prints one JSON line per run:
// {"case":"add-microfrontend","pass":false,
//  "failed":["bundle","inScope"]}
```

  </div>
</div>

<!--
Время: 1:30.
Задача короткая и отдаётся агенту как есть. Oracle агент не видит — иначе мы проверяем,
умеет ли он читать ответы. Grader — обычный скрипт, никакой LLM-оценки.
Последняя проверка смотрит в отчёт агента: сказал ли он, что запускал.
Раздел «Came from» — чтобы через полгода было понятно, зачем этот кейс вообще нужен.
-->

---

# Меняешь harness — прикладываешь прогон

<div class="two-col wide-left" style="align-items: start">
  <div v-click class="file code-sm">
  <div class="file-head"><span>.github/pull_request_template.md</span><span>фрагмент</span></div>

```md
## Harness change (AGENTS.md, docs/architecture, .agents/)

Hypothesis: what should agents do better?

| Case              | Before (main) | After (this MR) |
|-------------------|---------------|-----------------|
| add-microfrontend |  ? / 5        |  ? / 5          |
| add-lazy-route    |  ? / 5        |  ? / 5          |

Model / settings:
Failures that remain:
```

  </div>
  <div>
    <div v-click class="flat-card"><h3>Стало лучше</h3><p class="muted">Мёржим. Кейс остаётся в наборе как защита от регрессии.</p></div>
    <div v-click class="flat-card warn" style="margin-top: 0.8rem"><h3>Без изменений</h3><p class="muted">Не мёржим. Лишняя инструкция — это стоимость контекста без пользы.</p></div>
    <div v-click class="flat-card bad" style="margin-top: 0.8rem"><h3>Стало хуже в другом кейсе</h3><p class="muted">Так тоже бывает: новая строка перетянула внимание. Ищем формулировку.</p></div>
  </div>
</div>

<!--
Время: 1:30.
Так skills перестают размножаться: без прогона правку в .agents не принимают.
Про «стало хуже в другом кейсе»: например, слишком жёсткое правило про memory может заставить агента
гонять MemLab на каждую правку текста. [TODO: если был — свой реальный пример.]
-->

---

# Как не надо делать evals

<div class="grid-4" style="grid-template-columns: repeat(2, 1fr)">
  <div v-click class="flat-card bad"><h3>Один прогон «до» и один «после»</h3><p class="muted">Агент недетерминирован. Один успех — это может быть удача.</p></div>
  <div v-click class="flat-card bad"><h3>Oracle в задаче</h3><p class="muted">Агенту отдали критерии — проверяем чтение, а не поведение.</p></div>
  <div v-click class="flat-card bad"><h3>Начать с LLM-судьи и дашборда</h3><p class="muted">Месяц на платформу, ноль кейсов. Скрипт с exit code работает с первого дня.</p></div>
  <div v-click class="flat-card bad"><h3>Выдуманные кейсы</h3><p class="muted">Кейс должен прийти из реального промаха, иначе улучшаем то, что и так работало.</p></div>
</div>

<!--
Время: 1:00.
-->

---
layout: center
---

<div class="eyebrow">Live · результат</div>

# Возвращаемся к прогонам

<!--
Время: 0:15.
Переключиться в IDE / терминал.
-->

---
class: compact-table
---

# Что смотрим в каждом прогоне

<table class="comparison">
  <thead><tr><th>Вопрос</th><th>Где смотреть</th><th>Что даёт harness в Run B</th></tr></thead>
  <tbody>
    <tr v-click><td>Какой runtime выбрал</td><td>diff: webpack-конфиг, manifest</td><td>«Do not copy» в доке + check:architecture</td></tr>
    <tr v-click><td>Страница грузится лениво и открывается</td><td>check:bundle, страница через shell</td><td>сценарий в spec, bundle gate, разрешённый обход в своём микрофронте</td></tr>
    <tr v-click><td>Нет утечки после пагинации</td><td>MemLab-сценарий для своего роута</td><td>Done в spec + performance-check</td></tr>
    <tr v-click><td>Не вышел за scope</td><td>список изменённых файлов</td><td>Out of scope + safe-change для common/</td></tr>
    <tr v-click><td>Как рассуждал и на чём основано «готово»</td><td><code>agent-report.md</code> обоих прогонов</td><td>команды и их вывод вместо самооценки</td></tr>
  </tbody>
</table>

<!--
Время: 3:30.
Пройтись по строкам, для каждой открыть diff или вывод проверки обоих прогонов.
Не утверждать заранее, что Run A ошибся: показываем то, что есть в диффе.
Если live не успел — сохранённые трейсы, диффы и выводы проверок из репетиции.
Это демонстрация механизма, а не бенчмарк модели: один прогон ничего не доказывает, для этого есть evals.
-->

---

# Что поменялось между Run A и Run B

<div class="two-col">
  <pre v-click class="repo-tree">RUN A
задача в одну строку
  ↓
соседний код + история PR
  ↓
агент сам угадывает норму
  ↓
«готово» = собралось</pre>

  <pre v-click class="repo-tree">RUN B
AGENTS.md → карта, never, что заденет
  ↓
spec → сценарии, scope, Done
  ↓
docs → норма, не копируй, pitfalls
  ↓
skills + explorer → порядок работы
  ↓
checks + reviewer → fail → fix
  ↓
«готово» = вывод проверок</pre>
</div>

<p v-click style="margin-top: 1.3rem; font-size: 27px">Модель мы не меняли. Мы уменьшили количество вещей, которые ей приходится угадывать, и сделали ошибки заметными.</p>

<!--
Время: 1:30.
Harness не гарантирует идеальный результат. Он делает ошибку видимой и исправимой до ревью человеком.
-->

---

# С чего начать в понедельник

<div class="flow" style="grid-template-columns: repeat(4, 1fr)">
  <div v-click class="step"><span class="n">НЕДЕЛЯ 1</span><strong>AGENTS.md</strong><span>до 60 строк: карта, never, «что заденет», команды Done</span></div>
  <div v-click class="step"><span class="n">НЕДЕЛЯ 2</span><strong>Один док</strong><span>самая больная область: норма, эталон, «не копируй», pitfalls</span></div>
  <div v-click class="step"><span class="n">НЕДЕЛЯ 3</span><strong>Один gate</strong><span>скрипт с понятной ошибкой: что, где, почему, куда</span></div>
  <div v-click class="step"><span class="n">НЕДЕЛЯ 4</span><strong>Skill + eval</strong><span>одна повторяющаяся задача и один кейс из реального промаха</span></div>
</div>

<p v-click style="margin-top: 1.5rem; font-size: 26px">Дальше — агентное ревью в CI и правило «каждый промах агента становится кейсом».</p>

<!--
Время: 1:20.
Слайд для фотографии. Всё, что показано сегодня, лежит в ветке demo/agent-ready-v2 — можно взять как шаблон.
-->

---
layout: center
---

# Так нужно ли ещё уметь писать код?

<div class="flow engineer-multiplier" style="grid-template-columns: repeat(3, 1fr)">
  <div v-click class="step"><strong>Отличить норму</strong><span>от случайности legacy — и записать это в док</span></div>
  <div v-click class="step"><strong>Поставить границы</strong><span>scope, out of scope, Done — в spec</span></div>
  <div v-click class="step"><strong>Принять результат</strong><span>понять diff и риск, а не поверить отчёту</span></div>
</div>

<p v-click style="margin-top: 1.8rem; font-size: 28px">Всё, что мы сегодня видели, пишет и поддерживает инженер, который понимает код. AI умножает это понимание, а не заменяет его.</p>

<!--
Время: 1:00.
Возвращаюсь к вопросу из начала и к собеседованиям: если без агента человек не может объяснить решение,
агент ему не поможет — он не сможет ни поставить задачу, ни принять результат.
-->

---
layout: center
---

<div class="huge">Сначала сделайте проект<br><span class="green">понятным агенту</span></div>

<p v-click class="muted" style="margin-top: 2.1rem; font-size: 1.25rem">Модель определяет потолок. Harness определяет, как часто вы до него дотягиваетесь.</p>

<p v-click style="margin-top: 1.4rem; font-size: 1.05rem">Demo: <code>github.com/spiderpoul/enterprise-app-optimization</code>, ветка <code>demo/agent-ready-v2</code></p>

<!--
Время: 0:40.
Спасибо. Вопросы.
-->
