# common/ — общий код всех микрофронтов
Изменение здесь сразу уходит во все продукты. Владелец: @platform-frontend.

- webpack/createMicrofrontendConfig.cjs объявляет window externals для React,
  JSX-рантайма и React Router. Убери `react` — каждый продукт соберёт свой React,
  в браузере будет «Invalid hook call», а сборка останется зелёной.
- server/index.js в production раздаёт client/dist каждого продукта с `/` —
  туда указывает entryPath в manifest. Сменишь путь — сломаешь все манифесты.
- bootstrap.js шлёт POST /api/microfrontends/ack каждые 30 с (TTL в shell — 90 с).
  Меняешь поля — меняй shell-app/server в том же PR.

Перед правкой — скилл safe-change, затем check:architecture и check:bundle. Они сверяют конфигурацию
статически; после правки server/index.js или bootstrap.js нужен ещё smoke из корневого AGENTS.md:
entry и роуты всех продуктов открываются через shell.
