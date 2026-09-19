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
Время: 0:45.
Открыть без длинного представления. Обещание доклада: покажу путь от обычного legacy-репозитория до проекта, с которым справляется не только флагманская модель.
-->

---
layout: center
---

<div class="meme-image meme-spider">
  <img src="/assets/1.jfif" alt="Мем с Питером Паркером и Тони Старком про зависимость от Claude" />
</div>

<!--
Время: 1:00.
Обыграть знакомый мем. Не спорить с качеством Claude Code. Тезис: процесс, который держится только на одном внешнем инструменте, плохо переносится в enterprise.
-->

---
layout: center
---

# Кому знакомо?

<div class="two-col" style="margin-top: 2rem">
  <div v-click class="flat-card bad">
    <h3>«Быстрее исправить самому»</h3>
    <p class="muted">Объяснение заняло дольше кода</p>
  </div>
  <div v-click class="flat-card bad">
    <h3>«Он опять полез не туда»</h3>
    <p class="muted">Исправил баг и создал ещё два</p>
  </div>
</div>

<div v-click class="statement" style="margin-top: 2.4rem">Возможно, проблема не только в модели</div>

<!--
Время: 1:30.
Попросить поднять руки. Это точка узнавания для middle/senior-разработчиков, которые уже пробовали агента и разочаровались.
-->

---
---

# Enterprise меняет правила игры

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Права</strong><span>Агент видит только часть проекта и инфраструктуры</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Данные</strong><span>Код и документацию нельзя отправлять наружу</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Надёжность</strong><span>Подписка и доступ не становятся SLA команды</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Масштаб</strong><span>Один workflow должны повторить десятки разработчиков</span></div>
</div>

<div v-click class="statement" style="margin-top: 2.1rem">Облачный инструмент полезен разработчику. Корпоративный процесс требует собственной опоры.</div>

<!--
Время: 2:30.
Не превращать блок в спор «облако против on-prem». Объяснить, почему крупная команда не может строить весь процесс вокруг личной подписки.
-->

---
---

# Внутренняя модель уже полезна

<div class="two-col">
  <div v-click class="flat-card">
    <h3 class="green">Хорошо получается</h3>
    <ul>
      <li>исследовать связи в коде;</li>
      <li>делать узкие изменения;</li>
      <li>добавлять тесты и документацию;</li>
      <li>исполнять повторяемую процедуру.</li>
    </ul>
  </div>
  <div v-click class="flat-card warn">
    <h3 class="yellow">Пока опасно отдавать целиком</h3>
    <ul>
      <li>неоднозначную архитектуру;</li>
      <li>большую миграцию без границ;</li>
      <li>решение с неизвестными критериями;</li>
      <li>ответственность за результат.</li>
    </ul>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.8rem">Качество нужно оценивать после подключения контекста, инструментов и проверок</div>

<!--
Время: 2:30.
Сказать честно: внутренняя модель слабее на длинном контексте и чаще ошибается. Но «голый промпт» не является честным тестом её пригодности.
-->

---
---

# Agent = Model + Harness

<div class="two-col wide-right">
  <div v-click>
    <div class="metric">Модель</div>
    <p>рассуждает и выбирает следующий шаг</p>
    <div class="metric" style="margin-top: 1.5rem">Harness</div>
    <p>даёт контекст, инструменты, ограничения и обратную связь</p>
  </div>
  <div>
    <div v-click class="image-frame"><img src="/assets/harness-anatomy.png" alt="Harness anatomy" /></div>
    <p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 7. Соотношение 10/90 является метафорой авторов.</p>
  </div>
</div>

<!--
Время: 3:00.
Не защищать буквальные 10/90. Использовать схему как карту того, что окружает модель. Центральная формулировка: модель определяет потолок, harness определяет воспроизводимость.
-->

---
layout: center
---

<div class="meme-image meme-rescue">
  <img src="/assets/3.png" alt="Мем: harness выносит модель из горящего legacy" />
</div>

<!--
Время: 0:45.
Короткая эмоциональная разрядка. Если будет исходная фотография с котом, заменить этот слайд ею, сохранив две подписи.
-->

---
layout: center
---

<div class="eyebrow">Плохой запрос</div>

<div v-click class="big-quote">«Добавь новый режим. Сделай так же, как в соседнем плагине»</div>

<div v-click class="muted" style="font-size: 1.4rem; margin-top: 2.2rem">Звучит конкретно. Для агента это ссылка на неопределённый объём legacy.</div>

<!--
Время: 1:30.
Это центральный конфликт доклада. Спросить аудиторию, сколько раз они сами давали такую постановку человеку или агенту.
-->

---
---

# Что агенту приходится сделать

<div class="flow">
  <div v-click class="step"><span class="n">01</span><strong>Обойти плагин</strong><span>Открыть десятки файлов и связей</span></div>
  <div v-click class="step"><span class="n">02</span><strong>Угадать образец</strong><span>Решить, что важно, а что случайно</span></div>
  <div v-click class="step"><span class="n">03</span><strong>Удержать шум</strong><span>Не потерять цель в длинном контексте</span></div>
  <div v-click class="step"><span class="n">04</span><strong>Скопировать</strong><span>Вместе с историческими ошибками</span></div>
</div>

<div v-click class="statement" style="margin-top: 2rem">Большое окно позволяет загрузить больше legacy. Оно не объясняет, что из него правильно.</div>

<!--
Время: 2:00.
Подчеркнуть двойную цену: токены и качество. Слабая модель запутается раньше, сильная может увереннее обобщить плохой паттерн.
-->

---
---

# Legacy тоже становится примером

<div class="two-col wide-left">
  <div v-click>

```tsx
export function OrdersTable({ orders }) {
  const rows = orders
    .filter(matchesActiveFilters)
    .sort(compareByPriority)

  return rows.map(order =>
    <OrderRow key={order.id} order={order} />
  )
}
```

  </div>
  <div>
    <div v-click class="flat-card bad">
      <h3>Что наследуется</h3>
      <p>Сортировка на каждом render</p>
      <p>Тысячи строк без virtualization</p>
      <p>Отсутствие performance-проверки</p>
    </div>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.5rem">Агент выполнил просьбу точно. Источник истины оказался плохим.</div>

<!--
Время: 2:30.
Связать с реальным демопроектом: там намеренно оставлены perf-ошибки. Не утверждать, что конкретный код всегда медленный. Проблема в неконтролируемом копировании паттерна и отсутствии проверяемого требования.
-->

---
layout: center
---

<div class="statement">Для одной задачи репозиторий работает как набор <span class="green">in-context примеров</span></div>

<div class="two-col" style="margin-top: 2.4rem">
  <div v-click class="flat-card"><h3>Golden path</h3><p class="muted">Ускоряет правильное решение</p></div>
  <div v-click class="flat-card bad"><h3>Legacy path</h3><p class="muted">Масштабирует старый технический долг</p></div>
</div>

<!--
Время: 1:30.
Уточнить: модель не переобучается на репозитории. Речь про примеры, которые она видит в контексте текущей задачи.
-->

---
---

# Пять шагов к agent-ready проекту

<div class="roadmap">
  <div v-click><b>01</b><strong>Точка входа</strong><span>Куда смотреть и как проверять</span></div>
  <div v-click><b>02</b><strong>Источники истины</strong><span>Что копировать и чего избегать</span></div>
  <div v-click><b>03</b><strong>Спецификация</strong><span>Что меняется и зачем</span></div>
  <div v-click><b>04</b><strong>Узкий контекст</strong><span>Rules, skills и инструменты</span></div>
  <div v-click><b>05</b><strong>Backpressure</strong><span>Среда проверяет результат</span></div>
</div>

<div v-click class="statement" style="margin-top: 2rem">Цель: сделать неправильный путь заметным до code review</div>

<!--
Время: 1:30.
Это карта оставшейся теории и будущего демо. На практике пройти те же шаги в том же порядке.
-->

---
---

# 1. AGENTS.md: карта, не энциклопедия

<div class="two-col wide-left">
  <div v-click>

```md
# Project guide

## Architecture
- boundaries: docs/architecture.md
- plugin rules: plugins/*/AGENTS.md

## Commands
- dev: pnpm dev
- check: pnpm check
- e2e: pnpm test:e2e

## Never
- edit generated API clients
- bypass workspace boundaries
```

  </div>
  <div v-click class="flat-card">
    <h3>В корне остаётся стабильное</h3>
    <p>Навигация</p>
    <p>Инварианты</p>
    <p>Команды проверки</p>
    <p>Условия остановки</p>
  </div>
</div>

<!--
Время: 2:30.
AGENTS.md не должен пересказывать всю архитектуру. Его задача: привести агента к локальному источнику истины и дать проверяемые команды.
-->

---
---

# Документация ближе к источнику

<div class="two-col">
  <pre v-click class="repo-tree">repo/
├─ AGENTS.md
├─ docs/
│  └─ architecture.md
├─ openspec/
│  └─ changes/
└─ plugins/
   ├─ orders/
   │  ├─ AGENTS.md
   │  ├─ decisions.md
   │  └─ src/
   └─ legacy-orders/
      └─ DEPRECATED.md</pre>
  <div>
    <div v-click class="flat-card"><h3>Что можно использовать</h3><p>1–3 выбранных компонента и причина выбора</p></div>
    <div v-click class="flat-card bad" style="margin-top: 1.5rem"><h3>Что нельзя копировать</h3><p>Deprecated-пути, perf-антипаттерны и исторические обходы</p></div>
  </div>
</div>

<!--
Время: 2:30.
Показать главное улучшение относительно «сделай как рядом»: команда заранее отделяет эталонный путь от legacy. Знание живёт рядом с местом, где оно меняется.
-->

---
---

# 2. OpenSpec: контракт изменения

<div class="two-col">
  <pre v-click class="repo-tree">openspec/changes/
└─ virtualize-orders/
   ├─ proposal.md
   ├─ spec.md
   └─ tasks.md</pre>
  <div v-click>
    <ul>
      <li><b>Цель:</b> какое поведение меняем</li>
      <li><b>Границы:</b> что не входит в change</li>
      <li><b>Сценарии:</b> happy path и edge cases</li>
      <li><b>Решения:</b> выбранные компоненты</li>
      <li><b>Проверки:</b> как принимаем результат</li>
    </ul>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.6rem">OpenSpec полезен циклом, а не названием папок</div>

<!--
Время: 3:00.
Не погружаться в синтаксис OpenSpec. Показать proposal, spec, tasks как минимальную карту change, которая версионируется вместе с кодом.
-->

---
layout: center
---

# В коде не должно появиться нового смысла

<div class="two-col" style="margin-top: 1.8rem">
  <div v-click class="flat-card">
    <h3 class="green">Spec знает</h3>
    <p>Что меняется</p>
    <p>Зачем это нужно</p>
    <p>Какие ограничения обязательны</p>
    <p>Как выглядит готовый результат</p>
  </div>
  <div v-click class="flat-card warn">
    <h3 class="yellow">Код решает</h3>
    <p>Как встроить изменение</p>
    <p>Какие локальные детали использовать</p>
    <p>Как пройти проверки</p>
  </div>
</div>

<!--
Время: 1:45.
Фраза не означает, что спецификация обязана перечислить каждую строку. Она фиксирует весь новый продуктовый и архитектурный смысл, чтобы агент не изобретал его при реализации.
-->

---
---

# 3. Контекст по запросу

<div class="two-col wide-right">
  <div v-click>
    <div class="statement">Не максимум данных. Нужный набор для текущего шага.</div>
    <ul>
      <li>стабильное загружается всегда;</li>
      <li>процедуры включаются по задаче;</li>
      <li>глубокие references читаются по необходимости.</li>
    </ul>
  </div>
  <div>
    <div v-click class="image-frame"><img src="/assets/context-static-dynamic.png" alt="Static and dynamic context" /></div>
    <p v-after class="source">Источник: The New SDLC with Vibe Coding, май 2026, figure 4.</p>
  </div>
</div>

<!--
Время: 2:30.
Связать с соседним плагином: исследование 50 файлов нужно один раз превратить в несколько выбранных фактов. Следующая сессия начинает с чистого контекста.
-->

---
---

# Rules, skills и MCP решают разные задачи

<table class="comparison">
  <thead><tr><th>Механизм</th><th>Вопрос</th><th>Пример</th></tr></thead>
<tbody>
    <tr v-click><td><b>Rules</b></td><td>Как здесь работают всегда?</td><td>Не нарушать границы Nx</td></tr>
    <tr v-click><td><b>Spec</b></td><td>Что меняется сейчас?</td><td>Виртуализация списка заказов</td></tr>
    <tr v-click><td><b>Skill</b></td><td>Как выполнить повторяемую процедуру?</td><td>Добавить новый plugin route</td></tr>
    <tr v-click><td><b>MCP / tools</b></td><td>Где взять данные и что выполнить?</td><td>Поиск по коду, docs, CI, Jira</td></tr>
  </tbody>
</table>

<div v-click class="statement" style="margin-top: 1.8rem">Инструмент даёт действие. Skill задаёт порядок и проверки.</div>

<!--
Время: 2:30.
Это база, которая убирает путаницу между папкой guidelines, rules, skills и MCP. Не превращать каждое правило в skill.
-->

---
---

# Как не вырастить зоопарк skills

<div class="flow">
  <div v-click class="step"><span class="n">ТРИГГЕР</span><strong>Реальная задача</strong><span>Skill начинается с повторяющегося сценария</span></div>
  <div v-click class="step"><span class="n">SCOPE</span><strong>Узкое описание</strong><span>Не перехватывает соседние запросы</span></div>
  <div v-click class="step"><span class="n">OWNER</span><strong>Владелец</strong><span>Кто обновляет и принимает изменения</span></div>
  <div v-click class="step"><span class="n">RETIRE</span><strong>Удаление</strong><span>Skill уходит, когда больше не даёт пользы</span></div>
</div>

<div class="two-col" style="margin-top: 1.8rem">
  <div v-click class="flat-card"><h3>Точная операция</h3><p class="muted">Скрипт, схема, шаблон</p></div>
  <div v-click class="flat-card"><h3>Инженерное решение</h3><p class="muted">Цель, ограничения, критерии</p></div>
</div>

<!--
Время: 2:30.
Упор на большую команду: общий versioned-каталог, review, CODEOWNERS и проверки ссылок. Личные папки каждого разработчика не масштабируются.
-->

---
---

# 4. Среда не позволяет соврать об успехе

<div class="roadmap">
  <div v-click><b>01</b><strong>Types</strong><span>Компилятор ловит несовместимость</span></div>
  <div v-click><b>02</b><strong>Lint</strong><span>Правила становятся исполняемыми</span></div>
  <div v-click><b>03</b><strong>Tests</strong><span>Проверяется наблюдаемое поведение</span></div>
  <div v-click><b>04</b><strong>Perf</strong><span>Budget ловит наследование ошибки</span></div>
  <div v-click><b>05</b><strong>Review</strong><span>Человек принимает риск и смысл</span></div>
</div>

<div v-click class="statement" style="margin-top: 2rem">Один хороший тест полезнее инструкции «будь внимателен»</div>

<!--
Время: 2:30.
Backpressure особенно важен для слабой модели. Короткий шаг, быстрый сигнал, ограниченное число повторов и явное условие остановки.
-->

---
---

# 5. Evals проверяют систему

<div class="two-col">
  <div v-click>
    <div class="metric">10–20</div>
    <p>реальных задач для первого набора</p>
    <ul>
      <li>успешные сценарии;</li>
      <li>production failures;</li>
      <li>негативные триггеры;</li>
      <li>несколько trials одной задачи.</li>
    </ul>
  </div>
  <div>
    <div v-click class="flat-card"><h3>Capability</h3><p>Можем ли мы решать этот класс задач?</p></div>
    <div v-click class="flat-card" style="margin-top: 1.4rem"><h3>Regression</h3><p>Не сломали ли уже достигнутое качество?</p></div>
    <div v-click class="flat-card warn" style="margin-top: 1.4rem"><h3>Ablation</h3><p>Стало ли лучше со skill, чем без него?</p></div>
  </div>
</div>

<!--
Время: 2:30.
Не читать лекцию по статистике. Evals здесь нужны как способ сравнить две версии harness на одинаковых задачах. Outcome важнее фразы агента «готово».
-->

---
---

# Harness живёт на уровне команды

<div class="two-col wide-left">
  <pre v-click class="repo-tree">agent-platform/
├─ rules/
├─ skills/
├─ templates/
├─ evals/
├─ scripts/
└─ owners.yaml</pre>
  <div v-click>
    <ul>
      <li>единые версии и release notes;</li>
      <li>владельцы доменных правил;</li>
      <li>CI проверяет структуру и ссылки;</li>
      <li>ошибка оставляет тест, eval или правило;</li>
      <li>метрики: rework, bugs, cycle time.</li>
    </ul>
  </div>
</div>

<div v-click class="statement" style="margin-top: 1.6rem">Команду убеждает снижение возвратов, а не красивое AI-demo</div>

<!--
Время: 2:30.
Это enterprise-акцент. Общий репозиторий может быть отдельным или частью монорепо, но изменения должны проходить тот же инженерный процесс, что и код.
-->

---
layout: center
---

# Нужно ли ещё уметь писать код?

<div v-click class="statement">Чем сильнее инженер, тем выше его <span class="green">мультипликатор от AI</span></div>

<div class="flow" style="grid-template-columns: repeat(3, 1fr)">
  <div v-click class="step"><strong>Отличить инвариант</strong><span>от случайности legacy</span></div>
  <div v-click class="step"><strong>Заметить риск</strong><span>до того, как он попадёт в PR</span></div>
  <div v-click class="step"><strong>Сохранить знание</strong><span>в тесте, spec, rule или skill</span></div>
</div>

<!--
Время: 2:00.
Ответ аудитории: синтаксиса руками может стать меньше, инженерного суждения требуется больше. AI масштабирует и экспертизу, и ошибки.
-->

---
layout: center
---

<div class="eyebrow">Практика · 15 минут</div>

<div v-click class="huge">Одна задача.<br><span class="green">Два запуска.</span></div>

<p v-click class="muted" style="font-size: 1.45rem; margin-top: 2rem">Сначала агент наследует legacy. Затем проект ограничивает пространство ошибки.</p>

<!--
Время: 0:45.
Переключиться в IDE. Слайд остаётся на экране, пока готовится окно демо.
-->

---
---

# Запуск 1: «сделай как рядом»

<div v-click>

```text
Добавь новый режим таблицы в plugins/orders-v2.
Сделай так же, как в plugins/legacy-orders.
Проверь, что всё работает.
```

</div>

<div class="two-col" style="margin-top: 1.5rem">
  <div v-click class="flat-card bad"><h3>Наблюдаем</h3><p>Сколько файлов открыл агент</p><p>Что он признал образцом</p><p>Какие проверки запустил</p></div>
  <div v-click class="flat-card warn"><h3>Ожидаем</h3><p>Лишний контекст</p><p>Копирование perf-антипаттерна</p><p>Уверенное «готово»</p></div>
</div>

<!--
Время: 4:00.
Показать trace или историю действий, а не ждать полный ответ в тишине. Если запуск нестабилен, иметь заранее сохранённый diff и transcript.
-->

---
---

# Между запусками добавляем harness

<div class="two-col">
  <pre v-click class="repo-tree">repo/
├─ AGENTS.md
├─ openspec/changes/
│  └─ virtualize-orders/
│     ├─ spec.md
│     └─ tasks.md
├─ plugins/orders/
│  └─ AGENTS.md
└─ tests/performance/
   └─ orders.spec.ts</pre>
  <div v-click>
    <ul>
      <li>выбираем golden component;</li>
      <li>фиксируем запрещённый паттерн;</li>
      <li>задаём критерий производительности;</li>
      <li>даём точные команды проверки;</li>
      <li>перезапускаем с чистым контекстом.</li>
    </ul>
  </div>
</div>

<!--
Время: 5:00.
Не генерировать идеальный AGENTS.md магически. Быстро показать, как агент предлагает черновик, а разработчик выкидывает шум и оставляет проверяемые правила. Затем показать spec и perf gate.
-->

---
class: compact-table
---

# Запуск 2: сравниваем систему

<table class="comparison">
  <thead><tr><th>Без harness</th><th>С harness</th></tr></thead>
<tbody>
    <tr v-click><td>Исследует весь соседний plugin</td><td>Читает выбранные источники</td></tr>
    <tr v-click><td>Сам определяет хороший паттерн</td><td>Получает golden path и ограничения</td></tr>
    <tr v-click><td>Копирует perf-ошибку</td><td>Performance gate отклоняет ошибку</td></tr>
    <tr v-click><td>Успех зависит от самооценки модели</td><td>Успех определяется проверками</td></tr>
  </tbody>
</table>

<div v-click class="statement" style="margin-top: 1.8rem">Мы не сделали модель умнее. Мы изменили среду, в которой она принимает решения.</div>

<!--
Время: 5:00.
Показать итоговый diff и одинаковые критерии приёмки. Не заявлять победу по одному запуску: этот кейс демонстрирует механизм, а устойчивость подтверждают повторные trials.
-->

---
---

# Agent-ready checklist

<div class="checklist">
  <div v-click>Есть короткая точка входа</div>
  <div v-click>Документация живёт рядом с кодом</div>
  <div v-click>Golden paths отделены от legacy</div>
  <div v-click>Change начинается со spec</div>
  <div v-click>Контекст загружается по запросу</div>
  <div v-click>Rules, skills и tools не смешаны</div>
  <div v-click>Результат проверяет среда</div>
  <div v-click>Ошибки становятся regression cases</div>
</div>

<div v-click class="muted" style="margin-top: 1.4rem; font-size: 1.05rem">Для большой команды добавьте owners, versioning, CI и метрики внедрения.</div>

<!--
Время: 1:30.
Это слайд, который аудитория фотографирует. Можно позже вынести checklist в отдельный репозиторий или QR-код.
-->

---
layout: center
---

<div class="statement">Хороший harness не делает модель умнее</div>

<div v-click class="huge green" style="margin-top: 1.5rem">Он превращает удачу<br>в инженерный процесс</div>

<p v-click class="muted" style="margin-top: 2.4rem; font-size: 1.25rem">Модель определяет потолок. Harness определяет воспроизводимость.</p>

<!--
Время: 1:00.
Финал. Вернуться к коту и пожарному: модель всё та же, но теперь вокруг неё есть дорога, правила движения и ограждения.
-->
