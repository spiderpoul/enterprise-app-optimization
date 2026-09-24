---
name: code-review
description: Ревью diff merge request на соответствие контрактам этого репозитория. Используется
  в CI и локально перед MR.
---
1. Прочитай AGENTS.md, затем только документацию по областям, которые задевает diff.
2. Проверяй по порядку: контракты и «Что ещё заденешь» → спека и scope → производительность →
   запущены ли проверки из спеки.
3. Каждое замечание ссылается на правило (документ + раздел) или на упавшую проверку.
   Нет правила — нет замечания.
4. Серьёзность: blocker | risk. Мелочи не публикуются.
5. Не больше 10 замечаний; остальное — в сводку.
6. Никогда не одобряй, никогда не пушь.

## Вход
- CI: `mr.diff` из `.github/workflows/agent-review.yml`.
- Локально: `git diff --merge-base origin/main` плюс `git status --short` для неотслеживаемых файлов.
- Спека, если она есть у изменения: `openspec/changes/<id>/`.

## Результат
CI пишет `review.json`, который `scripts/post-review.cjs` публикует одним ревью без одобрения:

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
    }
  ]
}
```

`line` — строка нового файла, которая входит в diff. Локально выведи те же поля списком:
`severity · path:line · rule — body`, затем сводку.
