# shell-app/server — реестр и прокси для всех микрофронтов
Через этот сервер shell узнаёт о каждом продукте и проксирует его entry и API.
Ошибка здесь роняет сразу все продукты. Владелец: @platform-frontend.

- lib/registry.js сохраняет реестр в dist/data/microfrontends.json; после рестарта
  продукты возвращаются со следующим heartbeat. Запись без heartbeat дольше
  MICROFRONTEND_TTL_MS удаляется. Не отключай TTL в общих конфигах: мёртвая запись
  останется, и каждый клиент на старте будет ждать её entry.
- POST /api/microfrontends/ack — контракт со всеми продуктами. Меняешь поля —
  меняй common/bootstrap.js в том же PR, иначе продукты перестанут регистрироваться.
- lib/microfrontend-proxy.js проксирует только entryPath и api.prefix продукта.
  Любой другой путь в production shell отдаёт как index.html (в dev — 404),
  так ломаются lazy-чанки.

Перед правкой — скилл safe-change. После: npm run check:architecture, подними shell
и два продукта, открой оба из меню, останови один — второй должен работать дальше.
