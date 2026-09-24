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
- `import()` в продукте превращается в `require()`: корневой `babel.config.cjs` задаёт
  `modules: 'cjs'`, чанк не создаётся, и check:bundle падает с «lazy-чанк не собран».
  Оставь ES-модули в собственном `client/babel.config.cjs` продукта (`modules: false`, как в
  `src/shell-app/client/babel.config.cjs`). Корневой конфиг компилирует все проекты — не меняй его
  ради одного продукта.
- `lazy` в `RouteObject` никогда не вызывается: shell рисует роуты через `useRoutes` внутри
  `<BrowserRouter>`, а это не data router. Используй `React.lazy` + `<Suspense>` внутри компонента роута.
- Lazy-чанк продукта запрашивается с origin shell (`publicPath: '/'`), а shell проксирует только
  `entryPath` и `api.prefix` каждого продукта (`src/shell-app/server/lib/microfrontend-proxy.js`).
  По адресу чанка в production приходит `index.html` shell (в dev — 404), и страница не грузится.
  check:bundle падает на таком `publicPath`. Чини внутри продукта — см. «Lazy-чанки через shell»
  ниже; не меняй ради этого `common/`, shell и другие продукты.
- Shell оборачивает роут каждого продукта в `MicrofrontendBoundary`: если падает рендер или
  lazy-чанк, ошибку показывает только этот роут. Лоадер, пустой список и ошибка внутри страницы —
  по-прежнему на продукте (fallback у `<Suspense>`, error state с кнопкой «Повторить»).

## Lazy-чанки через shell
Пока shell не проксирует ассеты продуктов, продукт, которому нужен lazy-чанк роута,
может поправить свой конфиг — только файлы в `src/microfrontends/<name>/`:
1. `client/babel.config.cjs` — оставь ES-модули (`modules: false` для `@babel/preset-env`),
   иначе `import()` станет `require()`, и чанк не соберётся.
2. `client/webpack.config.cjs` — поправь объект, который вернул `createMicrofrontendConfig`:
   `output.publicPath = '<api.prefix>/assets/'`, `output.chunkFilename = '<name>.[name].[contenthash:8].js'`,
   `devServer.devMiddleware.publicPath = '/'` (dev-сервер оставляет entry в `/`, куда указывает manifest).
3. `server/server.js` — до `registerClientAssetHandling` раздай `/api/assets` из `client/dist`
   в production и проксируй его на dev-сервер клиента (отрезая `/api/assets`) в development.
   Shell пересылает `<api.prefix>/assets/*` на `/api/assets/*` продукта.
4. Код роута — `React.lazy` + `<Suspense>` внутри элемента роута; `route.lazy` здесь игнорируется.

Проверено на users-and-roles в production и development: `/api/mf/users-and-roles/assets/<chunk>.js`
через shell отдаёт JavaScript, и страница отрисовывается. `npm run check:bundle` проверяет `publicPath`;
что страница реально рендерится, покажет только smoke или MemLab-сценарий роута. Опиши обход в отчёте.
Проксировать ассеты продуктов в shell — это уже изменение платформы, под него нужна отдельная спека.

## Как работает рантайм
- Сервер каждого продукта собирает дескриптор из своего manifest через `common/bootstrap.js`,
  каждые 30 с шлёт в shell heartbeat (`POST /api/microfrontends/ack`) и снимает регистрацию
  на SIGINT/SIGTERM. Сервер shell держит реестр, сохраняет его на диск, выкидывает записи без
  heartbeat дольше `MICROFRONTEND_TTL_MS` (по умолчанию 90 с) и отдаёт реестр на `/api/microfrontends`.
- Сервер продукта использует `common/bootstrap.js` и `common/server/index.js`, как эталон.
  Ни один микрофронт не импортирует другой.
- Клиент shell (`src/shell-app/client/microfrontends/useMicrofrontends.ts`) при старте импортирует entry
  каждого продукта через runtime `import()` (`Promise.allSettled`: продукт, который не загрузился,
  пропускается с предупреждением), берёт экспортированный `RouteObject` (`routeConfig` или default
  export) и добавляет его в дерево роутов. Пункт меню строится из `path` роута, `menuLabel` и `id`
  из manifest; `id` становится `data-testid` пункта.
- Сервер shell проксирует `entryPath` и `api.prefix` каждого продукта на публичный URL продукта
  (`src/shell-app/server/lib/microfrontend-proxy.js`). В production сервер продукта раздаёт свой
  `client/dist` через `common/server/index.js`; в development entry отдаёт dev-сервер клиента.
- Shell владеет React, React DOM, JSX-рантаймами, React Router и React Router DOM и публикует их
  в `window` (`src/shell-app/client/main.tsx`); общий helper объявляет их как `window` externals.
  Продукт не должен собирать свою копию или заводить свой механизм sharing.
- Shell публикует ещё `window.antd` и `window.moment`, но это не externals: каждый продукт собирает
  свои. Библиотеки конкретного продукта можно собирать внутрь. Сделать пакет общим external для всего
  приложения — изменение архитектуры: нужна совместимая поставка из shell и проверки architecture/bundle
  (открытый PR #52 предлагает это для antd и moment; он не смёржен).
- Discovery не пускает код продуктов в стартовый бандл shell, но entry каждого продукта скачивается
  при старте shell. Держи entry маленьким, а страницу выноси в lazy-чанк.

## Blast radius
| Меняешь | Заденешь | Проверка |
|---|---|---|
| `common/webpack/createMicrofrontendConfig.cjs` | сборку всех продуктов; externals, через которые продукты делят React shell | `npm run check:architecture`, `npm run check:bundle` |
| `common/server/index.js` | как сервер каждого продукта раздаёт `client/dist`, то есть все `entryPath` | smoke в production-режиме |
| `common/bootstrap.js` | дескриптор каждого продукта: `entryUrl`, `assetPath`, `apiProxy`; heartbeat | smoke, `curl http://localhost:4300/api/microfrontends` |
| `id` в manifest | ключ реестра, `data-testid` пункта меню (селекторы MemLab) | `npm run check:architecture`; обнови сценарий |
| `routePath` в manifest / экспортированный `path` | URL страницы, сохранённые ссылки, fallback-роут | smoke: перезагрузи URL страницы |
| `entryPath` в manifest / `outputFileName` клиента | загрузится ли entry; при 404 продукт пропадает из меню | `npm run check:bundle`, smoke |
| `api.prefix` в manifest | API-прокси shell и адреса запросов продукта | smoke |
| `src/shell-app/client/microfrontends/useMicrofrontends.ts` | загрузку всех продуктов, время старта | `npm run check:bundle`, smoke |
| `src/shell-app/server/lib/microfrontend-proxy.js`, `registry.js` | проксирование ассетов и API всех продуктов, TTL реестра | smoke |
| `src/shell-app/client/main.tsx` (глобальные объекты `window`) | рантайм, который каждый продукт получает через externals | `npm run check:architecture`, smoke |
| корневой `babel.config.cjs` | транспиляцию всех проектов (targets, `modules: 'cjs'`) | `npm run build`, `npm run check:bundle` |
| версию React / React Router | все продукты сразу (window externals) | `npm run check` |

## Проверка
- `npm run check:architecture` — общий helper и window externals; в manifest есть `id`, `routePath` и
  `entryPath`, `id` и `routePath` уникальны; регистрация в Nx и workspaces; нет `ModuleFederationPlugin`;
  нет импортов соседей.
- `npm run check:bundle` — собирает все клиенты, сравнивает стартовые ассеты с
  `performance/bundle-baseline.json`, требует lazy-чанк с `application-security` в имени, когда этот
  продукт появится, и падает, если lazy-чанки продукта грузятся с `publicPath`, который shell не проксирует.
- `npm run check` — architecture, lint и полная сборка.
- Smoke (скрипта пока нет): `npm run dev`, открой http://localhost:4300, открой каждый продукт из меню
  и перезагрузи URL каждого продукта; `curl http://localhost:4300/api/microfrontends` перечисляет все продукты.
  Как в production: то же самое против `npm run compose:run -- --version local --mode prod` (Docker).
- Ни одна проверка не сверяет `routePath` с экспортированным `path` и `entryPath` с `outputFileName`,
  а check:bundle смотрит только, откуда грузятся lazy-чанки, но не то, отрисовалась ли страница. Это
  видно только на smoke или в MemLab-сценарии роута.

## История
- PR #23 заставил shell импортировать entry каждого продукта при старте вместо одного `React.lazy` на продукт.
- PR #25 добавил sharing через Module Federation; PR #26 его откатил.
- PR #27 и PR #29 расширили singleton/eager-маппинги общих модулей.
- PR #31 перевёл продукты на `window` externals — основу текущего рантайма.
- PR #33 грузил entry через script-теги и реестр `window.microfrontends`; PR #34 его откатил.
- Открытые PR #52 (корневой Babel с `modules: false`, externals для antd/moment) и #53 (роуты через
  `React.lazy`) — несмёрженные предложения, а не контракт.

Откат — решение для своего контекста, а не вечный запрет. И наоборот: если старый код дожил до наших
дней в соседнем продукте или в истории, нормой он от этого не становится. Хочешь поменять контракт —
сначала предложи правку в этом документе и в том же MR обнови check:architecture.
