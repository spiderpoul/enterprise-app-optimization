---
theme: default
title: "Демо-сессия «Не Claude единым: агентная разработка в закрытом контуре большого фронтенда»"
info: |
  Облачных агентов в корпоративный репозиторий часто не пускают, а внутреннюю модель
  многие считают слишком слабой для настоящей разработки. Разбираем на реальном
  репозитории, что сделать с проектом, чтобы даже не самая сильная внутренняя модель
  работала предсказуемо: AGENTS.md, документация, спецификации, скиллы, субагенты,
  проверки и агентное ревью. В конце сравниваем два прогона одной модели —
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
class: contour-slide
---

# Риски использования облачных моделей

<div class="contour-scene">
  <div v-click="1" class="contour-risks">
    <div class="contour-label">Облако могут ограничить</div>
    <div class="contour-risk"><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="M12 8v4" /> <path d="M12 16h.01" /> </svg><div><b>Риск утечки</b><span>Код и клиентские данные<br>нельзя передавать наружу</span></div></div>
    <div class="contour-risk"><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="m16.5 16.5 5 5" /> <path d="M2 21a8 8 0 0 1 11.531-7.18" /> <path d="m21.5 16.5-5 5" /> <circle cx="10" cy="8" r="5" /> </svg><div><b>Потеря доступа</b><span>Блокировки аккаунтов<br>и недоступность сервисов</span></div></div>
    <div class="contour-risk"><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /> </svg><div><b>Vendor lock-in</b><span>Зависимость от условий<br>и решений поставщика</span></div></div>
  </div>
  <div v-click="2" class="contour-perimeter">
    <div class="contour-perimeter-label">Инфраструктура компании</div>
    <div class="contour-model"><svg aria-hidden="true" class="contour-icon contour-model-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect width="20" height="8" x="2" y="2" rx="2" ry="2" /> <rect width="20" height="8" x="2" y="14" rx="2" ry="2" /> <line x1="6" x2="6.01" y1="6" y2="6" /> <line x1="6" x2="6.01" y1="18" y2="18" /> </svg><div><b>Внутренняя модель</b><span>Рабочие данные остаются в контуре</span></div></div>
    <div class="contour-data">
      <div><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="m18 16 4-4-4-4" /> <path d="m6 8-4 4 4 4" /> <path d="m14.5 4-5 16" /> </svg><span>Исходники</span></div>
      <div><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3" /> <path d="M14 2v5a1 1 0 0 0 1 1h5" /> <path d="M9 17v-2a2 2 0 0 0-4 0v2" /> <rect width="8" height="5" x="3" y="17" rx="1" /> </svg><span>Чувствительные<br>данные</span></div>
      <div><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M3 5h1" /> <path d="M3 12h1" /> <path d="M3 19h1" /> <path d="M8 5h1" /> <path d="M8 12h1" /> <path d="M8 19h1" /> <path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" /> </svg><span>Логи c прода</span></div>
    </div>
    <p class="contour-control">Компания управляет доступом,<br>хранением запросов и выбором модели</p>
  </div>
</div>

<div v-click="3" class="contour-local"><svg aria-hidden="true" class="contour-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" /> <path d="M20.054 15.987H3.946" /> </svg><div><b>Некоторые модели можно запустить и на своей машине</b><span>Для ограниченных задач: проработанный план, нужный контекст и проверки результата</span></div></div>

<p v-click="4" class="contour-question">Как получить от доступной модели полезный результат?</p>

<!--
Время: 0:50.
Облачные сервисы в крупных компаниях часто ограничивают: в запросы попадают исходники, конфиденциальные данные и клиентские логи.
Ещё два риска — потерять доступ к сервису и зависеть от решений поставщика.
Внутренняя модель здесь означает модель, развёрнутую на инфраструктуре компании, а не обязательно обученную самой компанией.
Она позволяет обрабатывать рабочие данные внутри контура, управлять доступом и хранением запросов, выбирать модель и фиксировать её версию.
Это требует настройки всего пути данных, включая агентные инструменты и логи. Само размещение модели внутри не исключает утечки и не устраняет все зависимости.
Некоторые модели можно запускать на своей машине, если хватает памяти. Для ограниченных задач с проработанным планом, контекстом и проверками этого уже может быть достаточно.
Локальный запуск: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html .
Качество зависит от задачи и модели, поэтому не обещаем, что одного плана достаточно для любого проекта.
Переход: мы выбрали внутреннюю модель. Какие претензии к ней обычно возникают?
-->

<!--
Icons: lucide-static v1.52.0, https://lucide.dev . License notice for the inline icons:
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.


The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->

---

# Что часто слышу про внутренние модели
<div class="grid-4">
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Не тянет, с Claude/Codex не сравнить»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Галлюцинирует: может напридумывать своего. Не хочу возиться с AI слопом»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Для тестиков сойдёт, но код писать не доверю»</h3></div>
  <div v-click class="flat-card bad"><h3 style="font-size: 26px">«Быстрее самому написать, чем полчаса объяснять»</h3></div>
</div>

<p v-click style="margin-top: 1.7rem; font-size: 29px">Напишите - пользуетесь ли вы внутренними/локальными моделями и можете ли вы доверить им написание кода?</p>

<!--
Время: 1:00.
Все четыре фразы я говорил сам. Дальше покажу ошибки, которые возникают из-за неподходящих примеров, противоречивых инструкций и отсутствующих проверок,
и что с ними делать, если сильной облачной модели нет и не будет.
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

<div class="grid-4 reasons reason-canvas">
  <div v-click class="flat-card warn"><svg aria-hidden="true" class="design-icon reason-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <circle cx="6" cy="19" r="3" /> <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /> <circle cx="18" cy="5" r="3" /> </svg><div class="reason-copy">
    <h3>Не знает, какой пример правильный</h3>
    <p class="muted">Рядом лежат актуальный и устаревший подходы. Оба работают — по коду их не отличить.</p></div>
  </div>
  <div v-click class="flat-card warn"><svg aria-hidden="true" class="design-icon reason-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /> </svg><div class="reason-copy">
    <h3>Не видит неявных контрактов</h3>
    <p class="muted">На идентификаторы, роуты и форматы API опираются другие системы. В коде это не помечено.</p></div>
  </div>
  <div v-click class="flat-card warn"><svg aria-hidden="true" class="design-icon reason-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M15 6a9 9 0 0 0-9 9V3" /> <circle cx="18" cy="6" r="3" /> <circle cx="6" cy="18" r="3" /> </svg><div class="reason-copy">
    <h3>Не знает, кого ещё заденет правка</h3>
    <p class="muted">Общий модуль используют десятки команд. По самому файлу этого не видно.</p></div>
  </div>
  <div v-click class="flat-card warn"><svg aria-hidden="true" class="design-icon reason-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" /> </svg><div class="reason-copy">
    <h3>Не знает, когда работа закончена</h3>
    <p class="muted">Сборка и тесты зелёные, а пользователь видит медленную или сломанную страницу.</p></div>
  </div>
</div>

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
<div class="hx" :class="{ dimming: $clicks >= 1 && $clicks <= 6 }">
  <div class="hx-ring hx-outer" :class="{ focus: $clicks === 6 }">
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
</div>
<div class="harness-split" :class="{ shown: $clicks >= 7 }">
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
  <div v-click="[6, 7]" class="note intro"><b>Платформа</b><p>CLI и IDE, рантайм, сессии, логи и трейсы.</p></div>
  <div v-click="7" class="note good"><b>10% модель, 90% harness</b><p>Модель — часть системы. От нас зависит, какие инструкции, инструменты и проверки она получит.</p></div>
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

<div class="eyebrow">Практический пример</div>

# Наш демопроект

<div class="two-col wide-left" style="align-items: center; gap: 72px">
  <div>
    <p style="font-size: 28px"><strong>Enterprise App Optimization</strong> — мини-версия нашего проекта.</p>
    <p class="muted" style="margin-top: 26px">Микрофронты работают как отдельные приложения. <strong class="green">Shell</strong> загружает их и встраивает в общий интерфейс.</p>
    <p style="margin-top: 26px">В приложении намеренно заложены <span class="green">ошибки производительности</span>.</p>
    <p style="margin-top: 28px; font-size: 20px"><a href="https://github.com/spiderpoul/enterprise-app-optimization" target="_blank"><code>github.com/spiderpoul/<wbr>enterprise-app-optimization</code></a></p>
  </div>
  <div v-click style="text-align: center">
    <a href="https://www.youtube.com/watch?v=8mAXrTd2eMc&amp;t=18s" target="_blank" aria-label="Открыть видео об оптимизации приложения с 18-й секунды"><img src="/assets/performance-video-qr.svg" alt="QR-код на видео, в котором мы улучшали производительность приложения" style="display: block; width: 270px; height: 270px; margin: 0 auto 24px; border-radius: 14px" /></a>
    <p style="font-size: 24px; margin-bottom: 10px">Web-perf: как выжать максимум из enterprise-проектов</p>
    <p class="muted" style="font-size: 20px; margin-bottom: 0">Видео с HolyJS</p>
  </div>
</div>

<!--
Время: 0:40.
Перед запуском двух сессий показать, с каким проектом будем работать.
Это мини-версия нашего проекта: отдельные микрофронты и shell-приложение, которое загружает их в общий интерфейс. В коде намеренно заложены ошибки производительности.
В видео мы разбирали и улучшали производительность самого приложения. Сейчас используем этот проект для разбора того, как подготовка репозитория влияет на работу агента.
Ссылка для QR-кода, предоставленная автором: https://www.youtube.com/watch?v=8mAXrTd2eMc&t=18s
-->

---
layout: center
---

<div class="eyebrow">Live · старт</div>

# Одна задача, одна модель, два репозитория

<div class="two-col demo-run-comparison" style="margin-top: 1rem">
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
Run A — не пустой репозиторий. В ветке demo-before «всё есть», но сделано так, как делать не надо. Эту ветку показываем как специально усложнённый вариант настройки; её содержимое не выдаём за типичный рабочий репозиторий.
Оба получают одну и ту же спеку с контрактами и сценариями — ту, что разберём в блоке про спеки; spec.md и proposal.md в ветках совпадают. Так нельзя сказать «B просто получил промпт лучше».
Сравниваем два варианта настройки вокруг одной модели. Run A специально собран как антипример; по двум прогонам не делаем вывод о частоте успеха.
В подготовленной ветке есть небольшая инструментальная правка для сценария памяти — атрибут data-page. Поэтому не утверждаем, что весь код продукта совпадает.
Какими командами проверить требования спеки, агент должен узнать из репозитория — в этом и разница.
Отчёт в конце — одинаковая просьба для обоих: в финале сравним и код, и рассуждения.
Если live-модель недоступна — дальше используем сохранённые трейсы и диффы репетиции.
Дальше после каждого блока переключаемся в репозиторий и смотрим, каким коммитом мы это добавили.
-->

---
layout: center
---

<div class="section-feature section-3d">
  <div class="section-copy">
    <div class="eyebrow">Блок 1</div>

# AGENTS.md: точка входа в проект

<p class="muted" style="font-size: 26px">Что агенту нужно знать сразу и куда идти за подробностями.</p>
  </div>
  <div class="section-art" aria-hidden="true" data-block="01"><img src="/assets/agents-entry-3d.png" alt="" class="section-3d-art" /></div>
</div>

<div class="chapter-route" aria-hidden="true"><span class="current"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6Z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16M3 3h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v16h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 14 3 3 5-6"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3Z"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 20 6v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></svg></span></div>

<!--
Время: 0:15.
Файлы в демо написаны по-русски, чтобы их было удобно читать со сцены. В рабочем проекте это компромисс:
английский дешевле по токенам и модели следуют ему стабильнее, а русский удобнее команде, которая читает ту же документацию.
Мы держим AGENTS.md и скиллы на английском, а docs — на языке команды.
В используемом клиенте нужно проверить загрузку корневого и вложенных AGENTS.md. Само наличие файла не гарантирует одинакового поведения всех CLI.
-->

---

# <code>AGENTS.md</code>: карта проекта и границы

<div class="walkthrough-linked annotated wide">
<div class="file code-xxs">
<div class="file-head"><span>AGENTS.md</span><span>пример для крупного монорепозитория</span></div>

```md {all|1-2|4-8|10-13|15-18}
# Frontend workspace
Shell и независимо выпускаемые React-микрофронты. Node 22+.

## Навигация
- Код продукта и его тесты: src/microfrontends/<name>/
- Общая платформа: src/shell-app/ и src/microfrontends/common/
- Архитектура и контракты: docs/architecture/README.md
- Проверки и запуск: docs/development.md; ограничения: docs/performance.md

## Перед изменением
- Прочитай локальный AGENTS.md, код области и связанные тесты.
- Для нового кода используй актуальный пример из docs; legacy помечен отдельно.
- Если правило расходится с кодом, проверь причину и актуальность документа.

## Границы
- Микрофронты не импортируют код друг друга; интеграция через публичный контракт.
- Изменение общего API или сборки требует проверки потребителей и ревью владельца.
- Не меняй тестовые ожидания и бюджеты ради зелёной проверки.
```

</div>
<div class="notes">
<div class="walkthrough-steps" aria-hidden="true"><i :class="{ active: $clicks === 0, passed: $clicks > 0 }"></i><i :class="{ active: $clicks === 1, passed: $clicks > 1 }"></i><i :class="{ active: $clicks === 2, passed: $clicks > 2 }"></i><i :class="{ active: $clicks === 3, passed: $clicks > 3 }"></i><i :class="{ active: $clicks === 4, passed: $clicks > 4 }"></i></div>
  <div v-if="$clicks < 1" class="note intro"><b>Короткий вход в проект</b><p>То, что нужно в большинстве задач: где искать код, какие правила прочитать и где проходят границы.</p></div>
  <div v-click="[1, 2]" class="note"><b>Контекст проекта</b><p>Кратко объясняет устройство репозитория. Версии и подробную архитектуру можно найти по ссылкам.</p></div>
  <div v-click="[2, 3]" class="note"><b>Навигация по коду</b><p>Пути ведут к ответственности, тестам и документации. Полное дерево файлов быстро устаревает и здесь не нужно.</p></div>
  <div v-click="[3, 4]" class="note"><b>Актуальный образец</b><p>Рабочий код может сохранять старый подход. Документация объясняет, какой пример брать для новых изменений.</p></div>
  <div v-click="4" class="note"><b>Границы команд</b><p>Общий контракт затрагивает потребителей. Это повод проверить влияние и привлечь владельца области.</p></div>
</div>
</div>

<img src="/assets/project-navigation-3d.png" alt="" aria-hidden="true" class="practical-example-art" />

<!--
Время: 1:40.
Это иллюстративный пример для крупного монорепозитория, а не дословный файл из демо. Пути и команды в рабочем проекте должны существовать и проверяться.
Корень содержит общие правила. Детали области находятся во вложенных AGENTS.md и docs. Загрузка вложенных правил зависит от клиента, поэтому её проверяем в своём CLI.
При расхождении документа и кода сначала выясняем актуальность решения. Существенную неоднозначность контракта согласуем с владельцем, рутинный выбор реализации решаем самостоятельно.
Источники: OpenAI, https://openai.com/index/harness-engineering/ — короткий файл входа и база знаний в репозитории; https://developers.openai.com/codex/guides/agents-md — область действия вложенных инструкций.
Addy Osmani, https://github.com/addyosmani/agent-skills/blob/main/skills/context-engineering/SKILL.md — контекст по задаче, чтение связанных файлов и явные границы.
-->


---

# <code>AGENTS.md</code>: cross-zone и Validation checks

<div class="walkthrough-linked annotated wide">
<div class="file md-view">
<div class="file-head"><span>AGENTS.md (продолжение)</span><span>пример для крупного монорепозитория</span></div>
<div class="md-body">
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

## Cross-zone: проверка влияния

| Меняешь | Кто зависит | Что проверить |
|---|---|---|
| Публичный API или маршрут | клиенты, интеграции, сохранённые ссылки | совместимость и сценарии потребителей |
| Общий UI-компонент | продукты, которые его используют | тесты компонента и затронутые экраны |
| Общую сборку или зависимость | все пакеты с этой конфигурацией | сборку потребителей и размер бандлов |

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Validation checks

- Базовая проверка репозитория: `npm run check`.
- Проверки затронутой области: её README или `docs/development.md`.
- Новый сценарий: тест либо повторяемые шаги в браузере.
- Общее изменение: сначала найди потребителей; проверки одного пакета недостаточно.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Definition of Done

Для каждого критерия приёмки укажи проверку и результат. В отчёте сохрани команды, условия запуска и непроверенные сценарии. Успешная сборка подтверждает только сборку.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 4 }">

## Ревью общего изменения

Укажи затронутые зоны и владельцев из CODEOWNERS. Изменение публичного контракта или выход за согласованный scope обсуди до реализации.

</div>
</div>
</div>
<div class="notes">
<div class="walkthrough-steps" aria-hidden="true"><i :class="{ active: $clicks === 0, passed: $clicks > 0 }"></i><i :class="{ active: $clicks === 1, passed: $clicks > 1 }"></i><i :class="{ active: $clicks === 2, passed: $clicks > 2 }"></i><i :class="{ active: $clicks === 3, passed: $clicks > 3 }"></i><i :class="{ active: $clicks === 4, passed: $clicks > 4 }"></i></div>
  <div v-if="$clicks < 1" class="note intro"><b>Как закончить изменение</b><p>Отдельно проверяем саму задачу и влияние на другие области проекта.</p></div>
  <div v-click="[1, 2]" class="note"><b>Cross-zone</b><p>Связываем общий код с его потребителями. Подробные сценарии остаются в документации области.</p></div>
  <div v-click="[2, 3]" class="note"><b>Validation checks</b><p>Команды должны запускаться в нашем окружении. Для каждой проверки понятно, какое свойство она подтверждает.</p></div>
  <div v-click="[3, 4]" class="note"><b>Проверяемое завершение</b><p>Критерий приёмки связан с доказательством. Недоступный стенд или пропущенный тест остаются явно непроверенными.</p></div>
  <div v-click="4" class="note"><b>Владельцы и scope</b><p>Ревью общего изменения включает команды-потребители. CODEOWNERS помогает найти ответственных.</p></div>
</div>
</div>

<!--
Время: 1:20.
Cross-zone — наша практика для большого проекта: меняем общий код, определяем потребителей и проверяем последствия. Это не название обязательного раздела из стандарта.
Таблица намеренно короткая. Полная матрица проверок живёт рядом с областью кода; корень даёт навигацию.
В реальном файле ссылка на проверки ведёт к точным командам и условиям окружения. Здесь npm run check соответствует существующей базовой команде демо.
Источник: Anthropic, https://code.claude.com/docs/en/best-practices — критерии проверки и подтверждение результата. OpenAI, https://openai.com/index/harness-engineering/ — ограничения архитектуры, проверяемые инструментами.
-->


---

# AGENTS.md: что убрать из корня

<img src="/assets/instructions-folder-3d.png" alt="" aria-hidden="true" class="guidance-accent-3d" />

<div class="guidance-head" aria-hidden="true"><span>Что мешает</span><span></span><span>Рабочий подход</span></div>
<div class="guidance-lines guidance-pairs">
  <div v-click class="guidance-row"><h3>Вся архитектура в одном файле</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Оставляем карту кода и ссылки. Устройство системы и объяснения решений живут в docs.</p></div>
  <div v-click class="guidance-row"><h3>Соглашения, уже заданные линтером</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Формат и стиль проверяет линтер. В AGENTS.md указываем команду и особые ограничения проекта.</p></div>
  <div v-click class="guidance-row"><h3>Процедуры на любой случай</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Локальные ограничения переносим в AGENTS.md области, подробные процедуры читаем по задаче.</p></div>
  <div v-click class="guidance-row"><h3>Дубли и устаревшие команды</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Одна версия каждого правила. Проверяем команды и обновляем инструкции вместе с изменением кода.</p></div>
</div>

<!--
Время: 1:20.
Это частые способы накопить лишний контекст, без выдуманного вредного файла. Не задаём универсальный лимит строк: смотрим, помогает ли каждая инструкция принять решение.
Корень сохраняет базовые команды, навигацию и важные ограничения. Если линтер проверяет правило, агенту достаточно знать, как запустить проверку. Вложенные инструкции не должны противоречить общим.
Источники: OpenAI, https://openai.com/index/harness-engineering/; Anthropic, https://code.claude.com/docs/en/best-practices.
-->


---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы изменили: AGENTS.md

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/e3b6c55b7a71dcabd90aeb42a4bfb61bc2519cf6" target="_blank">Шаг 1. AGENTS.md: карта проекта, запреты и cross-zone-зависимости</a></div>

<div class="practice-files artifact-files">
  <div><code>AGENTS.md</code><br>карта, источник истины, запреты, таблица cross-zone, Definition of Done</div>
  <div><code>src/shell-app/server/AGENTS.md</code><br>вложенный файл для реестра и прокси: что уже ломалось и как это проверить</div>
  <div><code>src/microfrontends/common/AGENTS.md</code><br>вложенный файл для общей сборки: какие правки задевают все микрофронты</div>
</div>

<!--
Время: 1:30.
До этого разобрали обобщённый пример, теперь открываем реальный файл демо. Открыть коммит на GitHub или в IDE. Пройти три файла, для каждого — одна фраза.
Показать, что корневой файл короткий, а подробности — во вложенных. Не каждый CLI подхватывает вложенные файлы сам, поэтому корневой AGENTS.md перечисляет их явно.
Историю с реестром рассказать подробно: это коммит 64f408a «drop stale microfrontends and isolate failed entries». Теперь в файле записано, как устроен реестр и почему нельзя отключать TTL.
Команды check:*, на которые ссылается AGENTS.md, появятся в шаге 6.
Формат «что поменял → что сломается → как это проявится» и есть самое ценное во вложенных файлах.
Ссылки на восемь шагов — снимки на момент шага. Уточнения после ревью лежат отдельными коммитами «Полировка …» поверх ветки: актуальные файлы — на HEAD demo/agent-ready-v2.
-->

---
layout: center
---

<div class="section-feature section-3d">
  <div class="section-copy">
    <div class="eyebrow">Блок 2</div>

# Документация: как в проекте принято и почему

<p class="muted" style="font-size: 26px">Как описать действующее решение, отметить legacy и связать подводные камни с проверками.</p>
  </div>
  <div class="section-art" aria-hidden="true" data-block="02"><img src="/assets/documentation-book-3d.png" alt="" class="section-3d-art" /></div>
</div>

<div class="chapter-route" aria-hidden="true"><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6Z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg></span><span class="current"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16M3 3h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v16h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 14 3 3 5-6"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3Z"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 20 6v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></svg></span></div>

<!--
Время: 0:15.
-->

---

# Документация рядом с кодом

<div class="walkthrough-linked annotated wide docs-example-layout">
<div class="file md-view">
<div class="file-head"><span>docs/architecture/microfrontends.md</span><span>пример документа команды</span></div>
<div class="md-body">

# Подключение микрофронта

<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

Владелец: platform-frontend. Обновляем вместе с контрактом.
Код: `src/shell-app/`; пример: `src/microfrontends/operations-reports/`.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Текущий подход

Shell читает маршрут и entry из manifest. Микрофронт выпускается отдельно. Для нового продукта используй публичный контракт, указанный пример и его тесты.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Устаревший подход

Прямые импорты между микрофронтами связывают релизы. В новом коде используй контракт. Совместимость legacy сохраняй до отдельной миграции.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 4 }">

## Подводные камни и проверка

| Риск | Проверка |
|---|---|
| Сломалась старая ссылка | прямой URL и переход из меню |
| Dev скрывает ошибку путей к чанкам | страница в production-сборке через shell |
| Общий контракт сломал соседний продукт | сценарии затронутых потребителей |

</div>
</div>
</div>
<div class="notes">
<div class="walkthrough-steps" aria-hidden="true"><i :class="{ active: $clicks === 0, passed: $clicks > 0 }"></i><i :class="{ active: $clicks === 1, passed: $clicks > 1 }"></i><i :class="{ active: $clicks === 2, passed: $clicks > 2 }"></i><i :class="{ active: $clicks === 3, passed: $clicks > 3 }"></i><i :class="{ active: $clicks === 4, passed: $clicks > 4 }"></i><i :class="{ active: $clicks === 5, passed: $clicks > 5 }"></i></div>
  <div v-if="$clicks < 1" class="note intro"><b>Общий документ команды</b><p>Одна версия для людей и агента. Проходит ревью вместе с кодом.</p></div>
  <div v-click="[1, 2]" class="note"><b>Код и владелец</b><p>Ссылки на код, образец и тесты. Владелец следит за актуальностью.</p></div>
  <div v-click="[2, 3]" class="note"><b>Какое решение применять</b><p>Действующее решение, границы и образец. Агенту не нужно угадывать по соседнему коду.</p></div>
  <div v-click="[3, 4]" class="note"><b>Что не переносить в новый код</b><p>Почему старый подход не копируем и как его мигрировать.</p></div>
  <div v-click="4" class="note"><b>Подводные камни</b><p>Для каждого риска есть способ проверки. Зелёной сборки недостаточно.</p></div>
</div>
</div>

<p v-click="5" class="docs-takeaway">Для типовой задачи должно хватать промпта «<code>%work item link%</code> сделай»: результат корректен и проходит ваше ревью.<br><span>Если результат не устраивает, дорабатывайте контекст проекта.</span></p>

<!--
Время: 1:40.
Иллюстративный документ на основе архитектуры демопроекта. Он не утверждает, что в указанном operations-reports реализованы все перечисленные автоматические тесты.
«Рядом с кодом» — доступна в том же репозитории и меняется в том же PR. Общая архитектура может жить в docs/, локальное решение — в README области. Не нужно складывать всё в папку каждого компонента.
Пометка legacy должна указывать конкретное место, причину и статус миграции в рабочем документе. Здесь показан типовой риск, без выдуманной истории инцидента или неподтверждённых чисел замера.
Источники: OpenAI, https://openai.com/index/harness-engineering/ — версия знаний в репозитории и навигация. Addy Osmani, https://github.com/addyosmani/agent-skills/blob/main/skills/context-engineering/SKILL.md — релевантные примеры и связанные тесты.
Пятый клик — вывод про типовую задачу. Это ориентир для повторяемых задач с понятными требованиями в work item, а не обещание для любой новой или неоднозначной работы. Промпт даёт ссылку и действие, правила и образцы агент получает из контекста проекта. Если результат не проходит ревью, уточняем документы, инструкции и примеры.
-->


---

# Документация: что мешает ей работать

<img src="/assets/documentation-search-3d.png" alt="" aria-hidden="true" class="guidance-accent-3d" />

<div class="guidance-head" aria-hidden="true"><span>Что мешает</span><span></span><span>Рабочий подход</span></div>
<div class="guidance-lines guidance-pairs">
  <div v-click class="guidance-row"><h3>Решение осталось в чате или wiki</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Фиксируем действующее решение в репозитории. Внешний источник связываем с кодом и версией контракта.</p></div>
  <div v-click class="guidance-row"><h3>Две копии одного правила</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Люди и агент читают один документ. В AGENTS.md и скилле даём ссылку на него.</p></div>
  <div v-click class="guidance-row"><h3>Рабочий legacy выглядит образцом</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Явно показываем актуальное решение, устаревший подход и причину, почему его не переносим.</p></div>
  <div v-click class="guidance-row"><h3>Совет без границ и проверки</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Описываем, где он применим, какие есть подводные камни и чем проверить результат.</p></div>
</div>

<!--
Время: 1:00.
Документация рядом с кодом меняется в том же PR и доступна в среде агента. Не требуется переносить весь корпоративный wiki: нужны действующие решения и ссылки, которыми реально пользуется команда.
Например, «используйте общий компонент таблицы» выглядит разумно. Но без ссылки на актуальный вариант агент может выбрать устаревшую обёртку. Это обычный пробел в навигации, а не специально вредная инструкция.
Владельцы документа и кода согласуют изменения контрактов; устаревшие примеры получают пометку и путь миграции.
Источники: OpenAI, https://openai.com/index/harness-engineering/; Addy Osmani, https://github.com/addyosmani/agent-skills/blob/main/skills/context-engineering/SKILL.md.
-->


---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: документацию

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/0b53e27b99c852c2051a3203a25dbd8c4969e165" target="_blank">Шаг 2. Документация: текущие правила, что не копировать, подводные камни</a></div>

<div class="practice-files artifact-files">
  <div><code>docs/architecture/microfrontends.md</code><br>контракт интеграции, актуальные примеры, legacy и проверка загрузки через shell</div>
  <div><code>docs/architecture/frontend.md</code><br>правила рендера, жизненного цикла и lazy-загрузки</div>
  <div><code>docs/performance.md</code><br>правила, устаревшие подходы и проверка рисков производительности</div>
  <div><span class="muted">Показать</span><br>раздел «Lazy-чанки через shell» — обход проверили руками на users-and-roles, а в ветке оставили только описание</div>
</div>

<!--
Время: 1:00.
В учебном примере показали структуру документа, здесь открываем её реализацию для демо. Смотрите: «Не копируй» с номерами PR. Если агент полезет в историю и найдёт эти PR, документация заранее говорит, что от этих подходов отказались.
Раздел «Проверка» честно называет покрытие: поиск импортов соседей — строковая эвристика, а не граф зависимостей; лишний чанк в dist — не доказательство загрузки страницы.
Ссылка ведёт на снимок шага 2. Уточнения после шагов — в коммитах полировки на HEAD ветки demo/agent-ready-v2.
-->

---
layout: center
---

<div class="section-feature section-3d">
  <div class="section-copy">
    <div class="eyebrow">Блок 3</div>

# Спецификация: договориться о задаче до кода

<p class="muted" style="font-size: 26px">Как внедрить spec-driven development (SDD) в legacy, что включить в спеку и как избежать неоднозначности.</p>
  </div>
  <div class="section-art" aria-hidden="true" data-block="03"><img src="/assets/specification-checklist-3d.png" alt="" class="section-3d-art" /></div>
</div>

<div class="chapter-route" aria-hidden="true"><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6Z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16M3 3h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v16h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg></span><span class="current"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 14 3 3 5-6"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3Z"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 20 6v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></svg></span></div>

<!--
Время: 0:15.
-->

---

# Какой должна быть спека

<div class="two-col spec-outline">
  <div>
    <div v-click class="flat-card"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <circle cx="12" cy="12" r="1" /> <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" /> </svg><div><h3>1 · Поведение и ограничения</h3><p class="muted">Что должно измениться для пользователя и какие технические контракты нужно сохранить. Детали реализации — в рамках этих ограничений.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" /> <path d="m3 17 2 2 4-4" /> <path d="m3 7 2 2 4-4" /> </svg><div><h3>2 · Сценарии WHEN / THEN</h3><p class="muted">Каждый можно проверить руками или тестом.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> </svg><div><h3>3 · Scope и разрешения</h3><p class="muted">Что не трогаем и что можно поменять, если упёрлись: например, конфиг своего микрофронта.</p></div></div>
  </div>
  <div>
    <div v-click class="flat-card"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /> </svg><div><h3>4 · Контракты legacy</h3><p class="muted">id, роуты, API, которые нельзя сломать. Их не видно в коде соседей.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> <path d="m9 14 2 2 4-4" /> </svg><div><h3>5 · Проверяемое «готово»</h3><p class="muted">Критерии приёмки и способ проверки: команда, тест или конкретный сценарий в браузере.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" /> </svg><div><h3>6 · Прочитана человеком</h3><p class="muted">Существенные вопросы закрыты до кода. Это договорённость, а не автоматическая проверка. Большое изменение разбиваем на части.</p></div></div>
  </div>
</div>

<!--
Время: 1:00.
Это совпадает с тем, что советуют OpenSpec (сценарии WHEN/THEN), Kiro (требования в нотации EARS: WHEN … THE SYSTEM SHALL …)
и Addy Osmani (границы «всегда / спроси / никогда», небольшой объём). Если хотя бы одного пункта нет — спека возвращается на доработку, как код на ревью.
-->

---

# Пример спеки

<div class="walkthrough-linked annotated wide">
<div class="file md-view">
<div class="file-head"><span>spec.md · страница списка приложений</span><span>пример изменения в существующем продукте</span></div>
<div class="md-body">
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 1 }">

## Цель и границы

Пользователь видит список приложений и переходит между страницами. Редактирование, фильтры и экспорт в это изменение не входят.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

## Контракты

Маршрут `/application-security` открывается из меню и по прямой ссылке. Формат ответа API, правила доступа и интеграция с shell соответствуют действующему контракту. Их изменение требует отдельного решения.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## Сценарии приёмки

- WHEN запрос выполняется, THEN виден индикатор загрузки.
- WHEN список пуст, THEN видно пустое состояние, без ошибки.
- WHEN запрос завершился ошибкой, THEN доступны сообщение и «Повторить».
- WHEN пользователь меняет страницу, THEN показаны данные выбранной страницы.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 4 }">

## Ошибка и восстановление

После ошибки пользователь может повторить запрос. При успешном ответе сообщение об ошибке исчезает и таблица показывает данные.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 5 }">

## Validation

Сценарии подтверждены тестами или повторяемыми шагами в браузере. Отдельно проверены прямой URL, доступ и загрузка через shell. Общие проверки выполняются по AGENTS.md.

</div>
</div>
</div>
<div class="notes">
<div class="walkthrough-steps" aria-hidden="true"><i :class="{ active: $clicks === 0, passed: $clicks > 0 }"></i><i :class="{ active: $clicks === 1, passed: $clicks > 1 }"></i><i :class="{ active: $clicks === 2, passed: $clicks > 2 }"></i><i :class="{ active: $clicks === 3, passed: $clicks > 3 }"></i><i :class="{ active: $clicks === 4, passed: $clicks > 4 }"></i><i :class="{ active: $clicks === 5, passed: $clicks > 5 }"></i></div>
  <div v-if="$clicks < 1" class="note intro"><b>Обычная продуктовая задача</b><p>Список с пагинацией: понятно, что меняем, что сохраняем и как принять результат.</p></div>
  <div v-click="[1, 2]" class="note"><b>Scope</b><p>Одна полезная возможность. Соседние функции не становятся частью задачи по ходу реализации.</p></div>
  <div v-click="[2, 3]" class="note"><b>Совместимость</b><p>В рабочей спеке есть ссылка на действующий API и правила доступа. Сохраняем контракт или согласуем его изменение.</p></div>
  <div v-click="[3, 4]" class="note"><b>Наблюдаемое поведение</b><p>Loading, пустой список, ошибка и пагинация описаны отдельно. Каждый сценарий можно воспроизвести.</p></div>
  <div v-click="[4, 5]" class="note"><b>Не только успешный ответ</b><p>Важен путь восстановления: что увидит пользователь после ошибки и успешной повторной попытки.</p></div>
  <div v-click="5" class="note"><b>Доказательство результата</b><p>Спека задаёт критерии приёмки. План реализации связывает их с конкретными тестами и командами проекта.</p></div>
</div>
</div>

<img src="/assets/specification-target-3d.png" alt="" aria-hidden="true" class="practical-example-art" />

<!--
Время: 1:40.
Это сокращённый учебный пример той же продуктовой задачи, а не копия полной спеки демо. Блок live продолжает использовать одинаковый реальный spec.md в обоих прогонах.
В полной спеке вместо фразы «действующий контракт» должны быть ссылка на его версию, значимые ограничения доступа и согласованные поля данных. Здесь детали опущены для чтения со сцены.
Когда реализация имеет значение для совместимости или обязательной проверки, это тоже фиксируем. Спека не запрещает технические решения, но не должна превращаться в копию будущего кода.
Источники: Addy Osmani, https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md — цель, scope, ограничения и измеримая приёмка. Anthropic, https://code.claude.com/docs/en/best-practices — критерии проверки результата.
-->


---

# Спека: что уточнить до реализации

<img src="/assets/specification-puzzle-3d.png" alt="" aria-hidden="true" class="guidance-accent-3d" />

<div class="guidance-head" aria-hidden="true"><span>Что мешает</span><span></span><span>Рабочий подход</span></div>
<div class="guidance-lines guidance-pairs">
  <div v-click class="guidance-row"><h3>«Сделать как в соседнем разделе»</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Указываем актуальный образец и значимые отличия: данные, доступ, состояния и поведение.</p></div>
  <div v-click class="guidance-row"><h3>Описан только успешный сценарий</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Добавляем пустой ответ, ошибку и восстановление. Фиксируем важные ограничения совместимости.</p></div>
  <div v-click class="guidance-row"><h3>Реализация занимает всю спеку</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Отделяем цель и приёмку от плана кода. Обязательные технические ограничения сохраняем явно.</p></div>
  <div v-click class="guidance-row"><h3>«Проверить, что всё работает»</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Для каждого критерия выбираем проверку. Неясные продуктовые решения закрываем с владельцем до кода.</p></div>
</div>

<!--
Время: 1:10.
Примеры слева — безобидные сокращения из обычных задач. Они требуют уточнения, но не означают, что автор специально дал неверный совет.
Объём зависит от риска: для опечатки достаточно задачи, для общего API нужна совместимость и миграция. Большую возможность делим на самостоятельно проверяемые изменения.
План может меняться при реализации; согласованные требования обновляем вместе с решением. Спека не заменяет тесты и ревью.
В live оба агента по-прежнему получают один реальный spec.md; этот слайд не подменяет входные данные прогона.
Источники: Addy Osmani, https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md; Anthropic, https://code.claude.com/docs/en/best-practices.
-->


---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: спецификацию

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/6a0f3e664ed6a97a6af3c00f8e5fee88ea8e014a" target="_blank">Шаг 3. Спецификация Application Security</a></div>

<div class="practice-files artifact-files">
  <div><code>…/add-application-security/specs/application-security/spec.md</code><br>полная спека демо: контракт, состояния страницы, границы и приёмка</div>
  <div><code>proposal.md</code> и <code>tasks.md</code><br>зачем это изменение, шаги со скиллами и субагентами и приёмка: «retry → остановить сервер, «Повторить» после запуска → скриншот таблицы»</div>
  <div><code>openspec/README.md</code><br>как мы работаем со спеками в legacy</div>
  <div><span class="muted">Показать</span><br>этот файл получают оба прогона — в <code>demo-before</code> он такой же</div>
</div>

<!--
Время: 1:00.
Слайд с примером выше сокращает обычную продуктовую задачу. Здесь открываем полную спеку демо. Спека одна на оба прогона. tasks.md есть только в Run B: это уже harness — связка спеки со скиллами и субагентами, их покажу дальше.
В tasks.md — чек-лист `- [ ]` и таблица «требование → проверка → результат»: loading, empty, error, malformed, retry, пагинация, прямой URL, посторонний render. Где команда свойство не подтверждает — повторяемый сценарий в браузере через MCP.
OpenSpec CLI в репозитории не подключён: validate и archive не показываем как работающие.
Равенство spec.md и proposal.md в demo-before и demo/agent-ready-v2 проверено git diff после полировки.
-->

---
layout: center
---

<div class="section-feature section-3d">
  <div class="section-copy">
    <div class="eyebrow">Блок 4</div>

# Скиллы: как делать повторяющуюся работу

<p class="muted" style="font-size: 26px">Какие скиллы у нас есть, как устроена процедура скилла, как делимся ими между командами и где брать идеи.</p>
  </div>
  <div class="section-art" aria-hidden="true" data-block="04"><img src="/assets/repeatable-skills-3d.png" alt="" class="section-3d-art" /></div>
</div>

<div class="chapter-route" aria-hidden="true"><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6Z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16M3 3h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v16h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 14 3 3 5-6"/></svg></span><span class="current"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3Z"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 20 6v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></svg></span></div>

<!--
Время: 0:15.
-->

---

# Где скилл помогает команде

<div class="two-col skills-catalog" style="align-items: start">
  <div>
    <div v-click class="flat-card"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" /> <path d="M8 16h.01" /> </svg><div><h3>story-analysis</h3><p class="muted">Из тикета и кода собирает вопросы, scope и критерии приёмки. Существенные решения остаются за владельцем задачи.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="m12 14 4-4" /> <path d="M3.34 19a10 10 0 1 1 17.32 0" /> </svg><div><h3>performance-check</h3><p class="muted">По изменению выбирает сценарий и замер. Возвращает результаты и риски, которые ещё не проверены.</p></div></div>
  </div>
  <div>
    <div v-click class="flat-card"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" /> </svg><div><h3>security-check</h3><p class="muted">Проверяет diff: авторизацию, обработку внешних данных и секреты. Каждая находка содержит место в коде, путь данных и объяснение риска.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M15 12h-5" /> <path d="M15 8h-5" /> <path d="M19 17V5a2 2 0 0 0-2-2H4" /> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" /> </svg><div><h3>log-trace-analysis</h3><p class="muted">Скриптом сокращает лог, связывает события с кодом и отделяет подтверждённую причину от гипотезы.</p></div></div>
  </div>
</div>

<p v-after class="source">Это примеры повторяемых задач. Набор скиллов выбираем по тому, где они помогают нашей модели и команде.</p>

<!--
Время: 1:20.
Не универсальный стартовый набор: сначала смотрим, где агент испытывает трудности, и проверяем пользу процедуры. В демо существуют дополнительные скиллы для UI, ревью и общего кода; их не нужно устанавливать в каждом проекте.
security-check показывает подтверждённые риски и непроверенные области. В демо при blocker-находке исправление согласует владелец: это правило процедуры ревью, а не повод менять scope задачи самостоятельно.
Источники: Anthropic, https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills — начинать с затруднений на реальных задачах; OpenAI, https://developers.openai.com/codex/skills — фокус на одной работе.
-->


---

# Скилл <code>performance-check</code>: разбор

<div class="walkthrough-linked annotated wide">
<div class="file md-view tight">
<div class="file-head"><span>.agents/skills/performance-check/SKILL.md</span><span>пример процедуры команды</span></div>
<div class="md-body">
<div class="sec frontmatter" :class="{ dim: $clicks > 0 && $clicks !== 1 }">
  <div><span>name</span><code>performance-check</code></div>
  <div><span>description</span><p>Проверяет влияние изменения на производительность фронтенда. Применяется при изменении загрузки, рендера, подписок или общих зависимостей. Возвращает замеры, вывод и непроверенные риски.</p></div>
</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 2 }">

Вход: diff и пользовательский сценарий. Бюджеты, команды и условия замера: `docs/performance.md`.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 3 }">

## 1. Определи риск и baseline

По diff выбери затронутые сценарии и потребителей общего кода. Зафиксируй исходный коммит, данные, сборку и условия запуска.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks !== 4 }">

## 2. Проверь до и после

| Изменение | Проверка по документации проекта |
|---|---|
| Загрузка или зависимость | размер бандла и загрузка страницы |
| Рендер или обработчик | профиль затронутого действия |
| Подписка или жизненный цикл | повторный вход и выход, проверка памяти |

Повтори замер в одинаковых условиях. Разбери регрессии; неподтверждённый эффект не называй улучшением.

</div>
<div class="sec" :class="{ dim: $clicks > 0 && $clicks < 5 }">

## 3. Готово, когда

- Для выбранных рисков сохранены команды, замеры и вывод.
- Пройдены обязательные проверки; незапущенные названы явно.
- Бюджеты и сценарии не ослаблены ради результата.

</div>
</div>
</div>
<div class="notes">
<div class="walkthrough-steps" aria-hidden="true"><i :class="{ active: $clicks === 0, passed: $clicks > 0 }"></i><i :class="{ active: $clicks === 1, passed: $clicks > 1 }"></i><i :class="{ active: $clicks === 2, passed: $clicks > 2 }"></i><i :class="{ active: $clicks === 3, passed: $clicks > 3 }"></i><i :class="{ active: $clicks === 4, passed: $clicks > 4 }"></i><i :class="{ active: $clicks === 5, passed: $clicks > 5 }"></i></div>
  <div v-if="$clicks < 1" class="note intro"><b>Повторяемая работа</b><p>Скилл помогает выбрать замер, выполнить его и подготовить понятный результат.</p></div>
  <div v-click="[1, 2]" class="note"><b>Условия применения</b><p>Из описания понятно, когда скилл нужен и что вернёт. Правка текста не требует perf-процедуры.</p></div>
  <div v-click="[2, 3]" class="note"><b>Вход и справочник</b><p>Diff и сценарий задают работу. Бюджеты и команды остаются в одной документации проекта.</p></div>
  <div v-click="[3, 4]" class="note"><b>Риск и потребители</b><p>Проверяем влияние на пользователя и соседние области, а не только изменённый файл.</p></div>
  <div v-click="[4, 5]" class="note"><b>Сопоставимый замер</b><p>Одинаковая сборка, данные и условия запуска. Шумный результат перепроверяем перед выводом.</p></div>
  <div v-click="5" class="note"><b>Выход и завершение</b><p>В отчёте видно, что проверено и на чём основан вывод. Пропущенная проверка остаётся открытым риском.</p></div>
</div>
</div>

<img src="/assets/performance-gauge-3d.png" alt="" aria-hidden="true" class="practical-example-art" />

<!--
Время: 1:40.
Иллюстративная процедура для большого проекта. В рабочем скилле ссылки ведут к точным командам и среде проекта; критерии завершения учитывают применимость проверок.
Для оптимизации сравниваем до и после. Для обычной feature-правки ищем регрессию и проверяем бюджет; не обещаем ускорение в каждой задаче.
Детерминированные операции выносим в scripts/, большие справочники — в references/ или общую документацию. В SKILL.md остаются порядок работы и прямые ссылки.
Источники: Addy Osmani, https://github.com/addyosmani/agent-skills/blob/main/skills/performance-optimization/SKILL.md — baseline, сопоставимые замеры и проверка результата. Anthropic, https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices — ясный description, компактная инструкция, проверка на используемых моделях.
-->


---

# <code>log-trace-analysis</code>: разбор сбоя

<div class="two-col">
  <div v-click class="file code-xs wrap">
  <div class="file-head"><span>.agents/skills/log-trace-analysis/SKILL.md</span></div>

```md
---
name: log-trace-analysis
description: Разбирает логи, HAR и трейсы при расследовании сбоя. Возвращает цепочку событий, ссылки на код и проверяемую гипотезу. Применяется к логу стенда, выводу упавшей проверки или трейсу.
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

# Рекомендуемые скиллы

<div class="two-col resource-catalog" style="align-items: start">
  <div>
    <div v-click class="flat-card"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /> <path d="M14 2v5a1 1 0 0 0 1 1h5" /> <path d="M10 12.5 8 15l2 2.5" /> <path d="m14 12.5 2 2.5-2 2.5" /> </svg><div><h3><a href="https://github.com/obra/superpowers" target="_blank">Superpowers</a></h3><p class="muted"><a href="https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md" target="_blank"><code>systematic-debugging</code></a> — поиск причины сбоя.<br><a href="https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md" target="_blank"><code>verification-before-completion</code></a> — проверка перед «готово».</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 5v16" /> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" /> </svg><div><h3><a href="https://github.com/addyosmani/agent-skills" target="_blank">Addy Osmani</a></h3><p class="muted"><a href="https://github.com/addyosmani/agent-skills/blob/main/skills/context-engineering/SKILL.md" target="_blank"><code>context-engineering</code></a> — нужный контекст.<br><a href="https://github.com/addyosmani/agent-skills/blob/main/skills/spec-driven-development/SKILL.md" target="_blank"><code>spec-driven-development</code></a> — спека до кода.<br><a href="https://github.com/addyosmani/agent-skills/blob/main/skills/performance-optimization/SKILL.md" target="_blank"><code>performance-optimization</code></a> — замер до правки.</p></div></div>
  </div>
  <div>
    <div v-click class="flat-card"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect width="8" height="8" x="3" y="3" rx="2" /> <path d="M7 11v4a2 2 0 0 0 2 2h4" /> <rect width="8" height="8" x="13" y="13" rx="2" /> </svg><div><h3><a href="https://github.com/vercel-labs/agent-skills" target="_blank">Vercel Agent Skills</a></h3><p class="muted"><a href="https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices" target="_blank"><code>react-best-practices</code></a> — загрузка данных, бандл и рендеры.<br><a href="https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines" target="_blank"><code>web-design-guidelines</code></a> — доступность и UX.</p></div></div>
    <div v-click class="flat-card" style="margin-top: 0.8rem"><svg aria-hidden="true" class="design-icon catalog-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" /> </svg><div><h3><a href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices" target="_blank">Anthropic: как писать скиллы</a></h3><p class="muted">Ясный description, короткая процедура и подробности по ссылкам. Проверка скилла на той модели, с которой работает команда.</p></div></div>
  </div>
</div>

<p v-after class="source">Берём отдельные процедуры под задачи команды. Читаем инструкции и скрипты, адаптируем к своему проекту.</p>

<!--
Время: 1:00.
Источники проверены 05.10.2026. Ссылки ведут на исходные репозитории и конкретные скиллы. Берём подходящие процедуры, а не весь набор.
Superpowers: https://github.com/obra/superpowers — systematic-debugging, verification-before-completion. Ещё можно посмотреть brainstorming и writing-plans для уточнения задачи и плана до кода.
Addy Osmani: https://github.com/addyosmani/agent-skills — context-engineering, spec-driven-development, performance-optimization.
Vercel Agent Skills: https://github.com/vercel-labs/agent-skills — react-best-practices и web-design-guidelines. Правила Next.js выбираем только там, где они применимы к нашему стеку.
Anthropic: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices — описание, загрузка деталей по необходимости, проверка на используемых моделях.
-->

---

# Как делимся скиллами между командами

<div class="two-col skill-sharing-layout">
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
```

  </div>
  <div>
    <ul class="team-skill-list" style="font-size: 23px">
      <li v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z" /> <path d="M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1" /> </svg><span><b>Монорепозиторий:</b> скиллы лежат в <code>.agents/skills/</code>, каждая команда получает их вместе с кодом.</span></li>
      <li v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" /> </svg><span><b>CODEOWNERS</b> назначает владельца для ревью. Обязательный аппрув включаем в настройках защищённой ветки.</span></li>
      <li v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" /> <path d="m3 17 2 2 4-4" /> <path d="m3 7 2 2 4-4" /> </svg><span><b>Реестр:</b> <code>.agents/skills/README.md</code> — что делает, когда брать, владелец, пример применения.</span></li>
      <li v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" /> <path d="M6.453 15h11.094" /> <path d="M8.5 2h7" /> </svg><span><b>Изменение скилла</b> — проверяем на реальной задаче и прикладываем результат к ревью.</span></li>
    </ul>
  </div>
</div>

<div v-click class="skill-sharing-caution"><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" /> </svg><span><b>Чужие скиллы</b> — только как идеи: у 13% из 3&nbsp;984 публичных скиллов Snyk нашёл критичные проблемы. Читаем, адаптируем, кладём копию к себе.</span></div>


<!--
Время: 1:00.
Никакой отдельной платформы: скиллы — это код и живут по правилам кода.
Запись в CODEOWNERS сама по себе не запрещает мёрж. Кроме того, владельцы в демо — пример структуры ответственности, а не подтверждение настроек публичного репозитория.
[TODO: сверить имена команд-владельцев с реальной практикой.]
-->

---

# Скиллы: без зоопарка

<img src="/assets/skills-toolbox-3d.png" alt="" aria-hidden="true" class="guidance-accent-3d" />

<div class="guidance-head" aria-hidden="true"><span>Что мешает</span><span></span><span>Рабочий подход</span></div>
<div class="guidance-lines guidance-pairs">
  <div v-click class="guidance-row"><h3>Скилл на каждое действие</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Добавляем скилл под повторяемую работу, где агенту не хватает контекста или он регулярно ошибается.</p></div>
  <div v-click class="guidance-row"><h3>Копия общей документации</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Общие правила и устройство проекта оставляем в docs. Скилл связывает нужные знания с конкретной задачей.</p></div>
  <div v-click class="guidance-row"><h3>Несколько скиллов про одно и то же</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Разводим условия применения или объединяем. У каждого понятны вход, результат и владелец.</p></div>
  <div v-click class="guidance-row"><h3>Скилл есть, пользы не видно</h3><span class="guidance-arrow" aria-hidden="true">→</span><p>Сравниваем на реальных задачах с ним и без него. Если агент справляется так же хорошо, скилл удаляем.</p></div>
</div>

<!--
Время: 1:10.
Правило про удаление скилла без пользы — наша практика, а не дословное требование OpenAI или Anthropic. Сравниваем качество, затраты и ручные исправления на нескольких репрезентативных задачах.
Скиллы могут быть и справочными: это допустимо, когда специальные знания нужны только под определённую задачу и их загрузка помогает. Не нужно превращать всю документацию проекта в набор скиллов.
Description объясняет, что делает скилл и когда его применять. Для процедуры задаём вход, шаги, проверяемый выход и условие завершения. Длинные материалы читаем по ссылке, повторяемые вычисления выполняем скриптом.
Источники: Anthropic, https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills; https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices; OpenAI, https://developers.openai.com/codex/skills.
-->


---
layout: center
---

<div class="practice-head">Переключаемся в репозиторий</div>

# Что мы добавили: скиллы

<div class="practice-commit"><a href="https://github.com/spiderpoul/enterprise-app-optimization/commit/d1ace245c78a3ea111d82d1a12cfcc7f42af393d" target="_blank">Шаг 4. Скиллы и их владельцы</a></div>

<div class="practice-files artifact-files">
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

<div class="section-feature section-3d">
  <div class="section-copy">
    <div class="eyebrow">Блок 5</div>

# Субагенты: исследование в отдельном контексте

<p class="muted" style="font-size: 26px">В этом демо субагенты исследуют код, разбирают логи и проверяют diff. Изменения вносит основной агент.</p>
  </div>
  <div class="section-art" aria-hidden="true" data-block="05"><img src="/assets/subagent-modules-3d.png" alt="" class="section-3d-art" /></div>
</div>

<div class="chapter-route" aria-hidden="true"><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6Z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16M3 3h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v16h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 14 3 3 5-6"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3Z"/></svg></span><span class="current"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></svg></span><span class="upcoming"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 20 6v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></svg></span></div>

<!--
Время: 0:30.
Правило совпадает с опытом Anthropic и Cognition: параллельными делаем исследование и ревью, а запись кода оставляем в одном потоке.
Если параллельно пишут несколько агентов, каждый принимает свои неявные решения, и они расходятся. Многоагентные системы тратят в разы больше токенов — на внутренней модели это время GPU.
Это простой вариант для связанного legacy-кода. Несколько пишущих агентов тоже возможны — при независимых задачах и изоляции изменений.
-->

---

# Субагент <code>explorer</code>

<div class="walkthrough-linked annotated">
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
<div class="walkthrough-steps" aria-hidden="true"><i :class="{ active: $clicks === 0, passed: $clicks > 0 }"></i><i :class="{ active: $clicks === 1, passed: $clicks > 1 }"></i><i :class="{ active: $clicks === 2, passed: $clicks > 2 }"></i><i :class="{ active: $clicks === 3, passed: $clicks > 3 }"></i><i :class="{ active: $clicks === 4, passed: $clicks > 4 }"></i></div>
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

<div class="practice-files artifact-files">
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

<div class="section-feature section-security">
  <div class="section-copy">
    <div class="eyebrow">Блок 6</div>

# Проверки и ревью

<p class="muted" style="font-size: 26px">Агент завершает задачу по согласованным критериям. Проверки подтверждают результат, а непроверенное остаётся явно отмеченным.</p>
  </div>
  <div class="section-art" aria-hidden="true" data-block="06"><img src="/assets/security-review-3d.png" alt="" class="section-security-art" /></div>
</div>

<div class="chapter-route" aria-hidden="true"><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H6Z"/><path d="M14 2v6h6M9 13h7M9 17h5"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16M3 3h4a6 6 0 0 1 5 2 6 6 0 0 1 5-2h4v16h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 14 3 3 5-6"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3Z"/></svg></span><span class="complete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></svg></span><span class="current"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 20 6v7c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></svg></span></div>

<!--
Время: 0:15.
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
Идти по кликам слева направо. Это карта того, что добавили в демо-ветку: правила, проверки, ревью и решение владельца.
Правила: Definition of Done в AGENTS.md и в спеке.
Скрипты: check:architecture (статическая сверка manifest, регистрации, externals), check:bundle (размер стартовых ассетов против baseline, lazy-чанк демо-фичи), check:memory (сценарий MemLab роута; результат — строка «MemLab found N leak(s)»), check:web-vitals (LCP и CLS через Chrome DevTools MCP).
Ревью: скилл code-review на каждый diff, профильные ревьюеры по critical-paths.yml — platform (реестр, прокси, общая сборка), security (внешние данные, MCP, workflow), contract (manifest), checks (сами проверки). Замечание подтверждается правилом, упавшей проверкой или воспроизведением; агент никогда не аппрувит.
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

<div class="practice-files artifact-files artifact-files-compact">
  <div><code>scripts/check-architecture.cjs</code>, <code>check-bundle.cjs</code>, <code>check-memory.cjs</code><br>проверки с сообщениями, которые помогают найти причину; у каждой указано, что она проверяет и что остаётся непроверенным</div>
  <div><code>.agents/review/critical-paths.yml</code> и <code>scripts/select-reviewers.cjs</code><br>какой ревьюер нужен для какого пути</div>
  <div><code>.agents/agents/security-reviewer.md</code> и соседи<br>чеклисты для критичного кода: платформа, безопасность, контракты и сами проверки</div>
  <div><code>.github/workflows/agent-review.yml</code> и <code>pull_request_template.md</code><br>шаблон запуска ревью через внутренний CLI; к правке прикладываем результаты проверок</div>
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

<div class="practice-files artifact-files">
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
layout: center
---

<div class="eyebrow result-opening-label">Live · результат</div>

# Возвращаемся к прогонам

<p class="muted result-opening-copy" style="font-size: 26px">Обе сессии закончили работу. Сравним, что получилось у Run A и Run B.</p>

<div class="result-opening-orbits" aria-hidden="true"><i></i><i></i></div>

<!--
Время: 0:15.
Переключиться в терминалы.
-->

---

# Run A и Run B: что получилось

<div class="ab-grid aligned-results">
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

<p v-click class="ab-statement result-thesis">Модель одна, спека одна. Разница — в том, что вокруг модели.</p>

<!--
Время: 2:00.
Перед докладом сверить формулировки с фактическими agent-report.md обоих прогонов и поправить, если прогон пошёл иначе. Ничего не утверждать сверх того, что видно в отчётах и диффах.
Если есть время — открыть оба agent-report.md рядом: раздел 1 (решения и откуда правило) и раздел 7 (метрики).
Что смотрим, если спросят: отдельный lazy-чанк и загрузка через shell; ES-модули и размер entry; пересчёт таблицы при сворачивании меню (React Profiler); правки вне продукта; на чём основано «готово».
Это демонстрация механизма, а не статистический бенчмарк. Разница — эффект всего комплекта инструкций, инструментов и проверок, а не одного скилла.
-->
---

# Итоги: чек-лист агентной разработки

<div class="checklist designed-checklist">
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /> <path d="M14 2v5a1 1 0 0 0 1 1h5" /> <path d="M10 12.5 8 15l2 2.5" /> <path d="m14 12.5 2 2.5-2 2.5" /> </svg><span>Короткий AGENTS.md: карта, запреты, cross-zone-зависимости, Definition of Done</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z" /> <path d="M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1" /> </svg><span>Вложенные AGENTS.md для критичных мест: реестр, прокси, общая сборка</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M12 5v16" /> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" /> </svg><span>Общая документация: текущие правила, «не копируй», подводные камни</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> <path d="m9 14 2 2 4-4" /> </svg><span>Спека на каждое заметное изменение — прочитанная человеком до кода</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /> <path d="m9 12 2 2 4-4" /> </svg><span>Проверки с понятными сообщениями; изменение самих проверок и бюджетов требует согласования</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" /> </svg><span>Инструменты запуска и диагностики: в демо — Chrome DevTools MCP и замеры Web Vitals</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect width="8" height="8" x="3" y="3" rx="2" /> <path d="M7 11v4a2 2 0 0 0 2 2h4" /> <rect width="8" height="8" x="13" y="13" rx="2" /> </svg><span>Скиллы на повторяющуюся работу, у каждого есть владелец</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <rect x="16" y="16" width="6" height="6" rx="1" /> <rect x="2" y="16" width="6" height="6" rx="1" /> <rect x="9" y="2" width="6" height="6" rx="1" /> <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /> <path d="M12 12V8" /> </svg><span>Начните с субагентов для исследования и ревью; в нашем демо код меняет основной агент</span></div>
  <div v-click><svg aria-hidden="true" class="design-icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" > <circle cx="18" cy="18" r="3" /> <circle cx="6" cy="6" r="3" /> <path d="M13 6h3a2 2 0 0 1 2 2v7" /> <line x1="6" x2="6" y1="9" y2="21" /> </svg><span>Агентное ревью по политике команды; для критичных путей — профильные проверки</span></div>
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
    <div class="thanks-resources">
      <a class="thanks-repo" href="https://github.com/spiderpoul/skills" target="_blank" rel="noopener noreferrer">
        <img class="thanks-qr" src="/assets/ai-ready-check-qr.svg" alt="QR-код: скилл ai-ready-check и инструкция установки" />
        <div>
          <p class="green">ai-ready-check</p>
          <p class="muted">Проверьте свой проект<br>по практикам доклада</p>
          <p><code>github.com/spiderpoul/skills</code></p>
        </div>
      </a>
      <a class="thanks-repo" href="https://github.com/spiderpoul/enterprise-app-optimization" target="_blank" rel="noopener noreferrer">
        <img class="thanks-qr" src="/assets/repo-qr.png" alt="QR-код со ссылкой на репозиторий spiderpoul/enterprise-app-optimization" />
        <div>
          <p class="muted">Репозиторий с примерами<br><span class="thanks-pr-hint">Смотрите Pull Requests</span></p>
          <p><code>github.com/spiderpoul/<wbr />enterprise-app-optimization</code></p>
        </div>
      </a>
    </div>
  </div>
  <div class="meme-image meme-thanks">
    <img src="/assets/1.jfif" alt="Мем: «Я ничто без Claude» — «Если ты ничто без Claude, значит, ты его не заслуживаешь»" />
  </div>
</div>

<!--
Время: 0:30.
Спасибо. Вопросы. Первый QR-код ведёт в github.com/spiderpoul/skills: там переносимый ai-ready-check и инструкция установки. Он проверяет проект по практикам доклада и возвращает доказанные пробелы с планом улучшений.
Второй QR-код ведёт в репозиторий с примерами: ветки demo/agent-ready-v2 (подготовленный проект) и demo-before (антипример).
Примеры и история добавления файлов — в Pull Requests. Мем оставляем без дополнительной подписи.
-->
