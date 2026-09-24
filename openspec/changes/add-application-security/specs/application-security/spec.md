# Application Security — спецификация

Изменение: add-application-security · Владелец: @platform-frontend · Владелец согласовал до начала работы.
Сначала прочитай: AGENTS.md, docs/architecture/microfrontends.md (Как сейчас правильно, Подводные камни),
docs/architecture/frontend.md, docs/performance.md. Спека говорит «что», документация — «как».
Ключевые слова OpenSpec (Requirement, Scenario, WHEN/THEN, SHALL) оставлены на английском.

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

## ADDED Requirements

### Requirement: Страница инвентаря Application Security
Shell SHALL показывать пункт «Application Security» в меню и открывать таблицу приложений
с пагинацией по адресу `/application-security`.

#### Scenario: открыть из меню
- WHEN пользователь нажимает «Application Security»
- THEN открывается таблица приложений с состояниями loading, empty и error
- AND код страницы скачивается только в этот момент (lazy-чанк)
- AND длинные идентификаторы не ломают вёрстку таблицы

#### Scenario: уйти после пагинации
- WHEN пользователь листает до последней страницы и уходит со страницы
- THEN код приложения не держит detached DOM-узлы

#### Scenario: открыть по ссылке
- WHEN пользователь перезагружает `/application-security` или открывает сохранённую ссылку
- THEN открывается та же страница, а не Not Found

#### Scenario: листать инвентарь
- WHEN пользователь переходит на следующую страницу
- THEN новые записи заменяют текущие, номер страницы виден

#### Scenario: ошибка API
- WHEN запрос инвентаря падает или возвращает не список
- THEN страница показывает ошибку с кнопкой «Повторить»
- AND остальной shell и другие продукты в меню продолжают работать

### Requirement: Стандартная архитектура микрофронта
Application Security SHALL быть новым микрофронтом в `src/microfrontends/application-security/`
по контракту из docs/architecture/microfrontends.md.

#### Scenario: архитектурная проверка
- WHEN запускается `npm run check:architecture`
- THEN она проходит для трёх микрофронтов

#### Scenario: без второго рантайма
- WHEN diff проходит ревью
- THEN в нём нет Module Federation, script-loader, своего реестра или механизма sharing
- AND React, React DOM, JSX-рантайм и React Router не попадают в бандл продукта
- AND ни один микрофронт не импортирует другой

### Requirement: Lazy-загрузка страницы
Регистрация продукта SHALL NOT добавлять код страницы в стартовый бандл shell.

#### Scenario: проверка бандла
- WHEN запускается `npm run check:bundle`
- THEN стартовый ассет shell укладывается в performance/bundle-baseline.json
- AND в `src/microfrontends/application-security/client/dist` есть lazy-чанк с именем продукта

#### Scenario: чанк грузится через shell
- WHEN пользователь открывает `/application-security` через shell
- THEN lazy-чанк приходит через shell как JavaScript, и страница отрисовывается

### Requirement: Жизненный цикл ресурсов
Ресурсы, которые страница захватила, SHALL освобождаться при размонтировании.

#### Scenario: уход со страницы
- WHEN пользователь уходит со страницы
- THEN таймеры, observer'ы, listener'ы, подписки и незавершённые запросы страницы освобождены

#### Scenario: проверка памяти
- WHEN запускается `npm run check:memory -- tests/memlab/application-security.scenario.js`
- THEN сценарий собран на базе tests/memlab/create-route-pagination-scenario.js, проверяет,
  что номер страницы сменился, и уходит со страницы; второй фреймворк для памяти не добавлен

### Requirement: Стоимость рендера
Пересчёт строк инвентаря SHALL выполняться только при изменении данных или номера страницы.

#### Scenario: посторонний рендер
- WHEN shell ререндерится по постороннему поводу (например, свернули меню)
- THEN строки инвентаря не пересчитываются, таблица не перемонтируется, текущая страница сохраняется

## Если lazy-чанк не работает
Можно менять конфиг только этого микрофронта (Babel, webpack, его сервер), пока чанк
не загрузится через shell и проверки не пройдут. Опиши обход в отчёте.
Рецепт: «Lazy-чанки через shell» в docs/architecture/microfrontends.md.

## Вне scope
- редактирование, фильтры, экспорт
- изменения в `src/microfrontends/common/`, shell или других продуктах

## Готово
npm run lint · npm run build · npm run check:architecture · npm run check:bundle
npm run check:memory -- tests/memlab/application-security.scenario.js
Сценарий памяти для этого роута — обязательный результат. Не подменяй его сценарием
другого роута и не выдавай «сборка прошла» за доказательство.
Запиши URL приложения, на котором гонял сценарий. Проверку, которую в этом окружении
не удалось запустить, отметь как непроверенную, а не как пройденную.
