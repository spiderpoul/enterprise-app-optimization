---
name: code-review
description: Ревью diff в MR на соответствие контрактам этого репозитория. Используется
  в CI и локально перед MR.
---
1. Прочитай AGENTS.md, затем только документацию по областям, которые задевает diff.
2. Проверяй по порядку: контракты и «Cross-zone» → спека и scope → производительность →
   запущены ли проверки из спеки.
3. Замечание подтверждается правилом или контрактом (документ + раздел), упавшей проверкой
   или воспроизводимым дефектом. Без этого — не замечание.
4. Severity: blocker | risk. Nitpick'и не публикуем.
5. Не больше 10 замечаний; остальное — в сводку.
6. Никогда не одобряй, никогда не пушь.

## Критичные пути
Этот скилл — обычное ревью каждого diff. Если diff задевает критичный путь из
`.agents/review/critical-paths.yml` (реестр и прокси shell, `common/`, manifest, проверки и baseline),
к нему добавляется отдельный ревьюер: `platform-reviewer`, `security-reviewer`, `contract-reviewer` или `checks-reviewer`
из `.agents/agents/`. Список печатает `node scripts/select-reviewers.cjs <файлы>`; CI запускает их сам.
Локально перед MR по таким путям позови нужного ревьюера явно.

## Вход
- CI: `mr.diff` из `.github/workflows/agent-review.yml`; ревьюеры критичных путей получают тот же diff.
- Локально: `git diff --merge-base origin/main` плюс `git status --short` для неотслеживаемых файлов.
- Спека, если она есть у изменения: `openspec/changes/<id>/`.

## Результат
CI пишет `review-<ревьюер>.json`, который `scripts/post-review.cjs` публикует одним ревью без одобрения
(у каждого ревьюера — своё):

```json
{
  "summary": "2 blocker, 1 risk. Проверки из спеки: не указан check:memory.",
  "comments": [
    {
      "path": "src/microfrontends/application-security/client/webpack.config.cjs",
      "line": 1,
      "severity": "blocker",
      "rule": "docs/architecture/microfrontends.md#подводные-камни",
      "body": "Скопирован webpack-конфиг: нет window externals, React собран внутрь. Используй createMicrofrontendConfig."
    },
    {
      "path": "src/microfrontends/application-security/client/routes/Inventory.tsx",
      "line": 42,
      "severity": "blocker",
      "evidence": "Открыть /application-security, нажать «Повторить» после ошибки API: запрос не уходит.",
      "body": "Кнопка «Повторить» не вызывает загрузку повторно."
    }
  ]
}
```

`line` — строка нового файла, которая входит в diff. Обоснование — `rule` (правило или контракт), `evidence`
(вывод упавшей проверки или шаги воспроизведения) или оба. Замечание без `path` и `line` (например,
«обязательная проверка не запускалась») уходит в сводку. Локально выведи те же поля списком:
`severity · path:line · rule или evidence — body`, затем сводку.

## Готово, когда
- Каждое замечание обосновано правилом, упавшей проверкой или воспроизведением.
- Для каждой обязательной проверки из спеки указан фактический статус: запущена и результат, упала или не запускалась.
- Перечислено, что по diff подтвердить нельзя. Ноль замечаний при непроверенном рантайме — не «готово».
