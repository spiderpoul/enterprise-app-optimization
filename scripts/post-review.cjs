#!/usr/bin/env node
'use strict';

// Публикует замечания агента-ревьюера в pull request одним ревью без одобрения.
// Используется в .github/workflows/agent-review.yml; без зависимостей (fetch из Node 22).
//
//   node scripts/post-review.cjs review.json [--dry-run] [--reviewer <name>] [--repo owner/name] [--pr <n>] [--sha <commit>]
//
// review.json пишет агент-ревьюер (см. .agents/skills/code-review/SKILL.md):
//   {
//     "summary": "один абзац",
//     "comments": [
//       { "path": "src/...", "line": 12, "severity": "blocker" | "risk",
//         "rule": "docs/architecture/microfrontends.md#подводные-камни", "body": "что и почему" },
//       { "path": "src/...", "line": 40, "severity": "blocker",
//         "evidence": "вывод упавшей проверки или шаги воспроизведения", "body": "что и почему" },
//       { "severity": "blocker", "evidence": "check:memory не запускался", "body": "…" }
//     ]
//   }
//   `line` — строка нового файла внутри diff. Замечание без `path` и `line` идёт только в сводку.
//
//   --reviewer  имя ревьюера из scripts/select-reviewers.cjs (code-review, platform-reviewer, …);
//               попадает в заголовок ревью, чтобы было видно, кто из агентов что написал
//
// Окружение (GitHub Actions задаёт всё, кроме токена):
//   GITHUB_TOKEN       токен с pull-requests: write (для --dry-run не нужен)
//   GITHUB_REPOSITORY  owner/name
//   GITHUB_EVENT_PATH  событие pull_request: номер PR и head-коммит
//   GITHUB_API_URL     по умолчанию https://api.github.com
//
// Правила скилла code-review соблюдаются и здесь: замечание без обоснования (ни `rule`, ни `evidence`)
// или с серьёзностью не blocker | risk отбрасывается, inline уходит не больше 10 замечаний (остальные,
// в том числе без строки, — в сводку), событие ревью всегда COMMENT: скрипт никогда не одобряет.
//
// Negative-проверка: node scripts/post-review.cjs scripts/fixtures/review-evidence-only.json --dry-run
// — замечание с evidence без rule сохраняется, замечание без строки попадает в сводку.

const fs = require('fs');

const MAX_COMMENTS = 10;
const SEVERITIES = ['blocker', 'risk'];

const USAGE =
  'Запуск: node scripts/post-review.cjs <review.json> [--dry-run] [--reviewer <name>] [--repo owner/name] [--pr <n>] [--sha <commit>]';

function parseArgs(argv) {
  const options = { file: null, dryRun: false, reviewer: null, repo: null, pr: null, sha: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--dry-run') options.dryRun = true;
    else if (['--reviewer', '--repo', '--pr', '--sha'].includes(arg)) {
      if (!argv[i + 1]) throw new Error(`${arg}: нужно значение`);
      options[arg.slice(2)] = argv[(i += 1)];
    } else if (arg.startsWith('-')) throw new Error(`неизвестный параметр ${arg}`);
    else if (!options.file) options.file = arg;
    else throw new Error(`лишний аргумент ${arg}`);
  }
  if (!options.file) throw new Error('не указан <review.json>');
  return options;
}

// Returns { review, warnings } or throws with every schema problem listed.
function readReview(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  const problems = [];
  if (!data || typeof data !== 'object' || Array.isArray(data))
    problems.push('верхний уровень должен быть объектом');
  else {
    if (typeof data.summary !== 'string') problems.push('"summary" должен быть строкой');
    if (!Array.isArray(data.comments)) problems.push('"comments" должен быть массивом');
  }
  const comments = Array.isArray(data?.comments) ? data.comments : [];
  comments.forEach((comment, index) => {
    const where = `comments[${index}]`;
    if (!comment || typeof comment !== 'object') {
      problems.push(`${where} должен быть объектом`);
      return;
    }
    const located = comment.path !== undefined || comment.line !== undefined;
    if (located && (typeof comment.path !== 'string' || !comment.path))
      problems.push(`${where}.path должен быть непустой строкой (или убери и path, и line)`);
    if (located && (!Number.isInteger(comment.line) || comment.line < 1))
      problems.push(`${where}.line должен быть положительным целым (или убери и path, и line)`);
    if (typeof comment.body !== 'string' || !comment.body.trim())
      problems.push(`${where}.body должен быть непустой строкой`);
  });
  if (problems.length)
    throw new Error(`${file} не соответствует схеме ревью:\n- ${problems.join('\n- ')}`);

  const warnings = [];
  const kept = data.comments.filter((comment, index) => {
    if (!SEVERITIES.includes(comment.severity)) {
      warnings.push(
        `comments[${index}] отброшен: серьёзность "${comment.severity}" — не blocker | risk`,
      );
      return false;
    }
    if (!text(comment.rule) && !text(comment.evidence)) {
      warnings.push(
        `comments[${index}] отброшен: нет обоснования — ни правила (rule), ни проверки или воспроизведения (evidence)`,
      );
      return false;
    }
    return true;
  });
  kept.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));
  const located = kept.filter((comment) => comment.path !== undefined);
  return {
    review: {
      summary: data.summary.trim(),
      inline: located.slice(0, MAX_COMMENTS),
      overflow: [...located.slice(MAX_COMMENTS), ...kept.filter((comment) => comment.path === undefined)],
    },
    warnings,
  };
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const grounds = (comment) =>
  [text(comment.rule) && `\`${text(comment.rule)}\``, text(comment.evidence) && `evidence: ${text(comment.evidence)}`]
    .filter(Boolean)
    .join(' · ');
const formatComment = (comment) =>
  `**${comment.severity}** · ${grounds(comment)}\n\n${comment.body.trim()}`;
const listItem = (comment) =>
  `- **${comment.severity}** ${comment.path ? `\`${comment.path}:${comment.line}\`` : '(без строки)'} · ${grounds(comment)} — ${comment.body.trim()}`;

function reviewBody({ summary, overflow, reviewer }, extra = []) {
  const parts = [
    `**Агентное ревью${reviewer ? ` · ${reviewer}` : ''}** — это рекомендация, решает человек. Агент никогда не аппрувит.`,
    summary || '(нет сводки)',
  ];
  const listed = [...extra, ...overflow];
  if (listed.length)
    parts.push(`Не попало в inline-комментарии (${listed.length}):\n${listed.map(listItem).join('\n')}`);
  return parts.join('\n\n');
}

function payload(review, sha, inline = true) {
  const body = inline ? reviewBody(review) : reviewBody(review, review.inline);
  const result = { event: 'COMMENT', body };
  if (sha) result.commit_id = sha;
  if (inline && review.inline.length) {
    result.comments = review.inline.map((comment) => ({
      path: comment.path,
      line: comment.line,
      side: 'RIGHT',
      body: formatComment(comment),
    }));
  }
  return result;
}

function pullRequestContext(options) {
  let event = {};
  if (process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
    event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  }
  return {
    api: (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, ''),
    repo: options.repo || process.env.GITHUB_REPOSITORY || null,
    pr: options.pr || event.pull_request?.number || null,
    sha: options.sha || event.pull_request?.head?.sha || null,
  };
}

async function post(url, token, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'agent-review',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (_error) {
    // оставляем сырой текст для сообщения об ошибке
  }
  return { status: response.status, ok: response.ok, json, text };
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`${error.message}\n${USAGE}`);
    return 2;
  }
  if (options.help) {
    console.log(USAGE);
    return 0;
  }

  let parsed;
  try {
    parsed = readReview(options.file);
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  parsed.warnings.forEach((warning) => console.warn(`warning: ${warning}`));
  const { review } = parsed;
  review.reviewer = options.reviewer;
  const context = pullRequestContext(options);

  if (options.dryRun) {
    const url = `${context.api}/repos/${context.repo || '<owner/name>'}/pulls/${context.pr || '<number>'}/reviews`;
    console.log(`[dry-run] POST ${url}`);
    console.log(JSON.stringify(payload(review, context.sha), null, 2));
    console.log(
      `[dry-run] inline-замечаний: ${review.inline.length}, в сводке: ${review.overflow.length}; ничего не отправлено.`,
    );
    return 0;
  }

  const token = process.env.GITHUB_TOKEN;
  const missing = [
    !token && 'GITHUB_TOKEN',
    !context.repo && 'GITHUB_REPOSITORY или --repo',
    !context.pr && 'событие pull_request или --pr',
  ].filter(Boolean);
  if (missing.length) {
    console.error(
      `Не могу опубликовать ревью, не хватает: ${missing.join(', ')}. Для предпросмотра — --dry-run.`,
    );
    return 2;
  }

  const url = `${context.api}/repos/${context.repo}/pulls/${context.pr}/reviews`;
  let result = await post(url, token, payload(review, context.sha));
  let inline = review.inline.length;
  if (result.status === 422 && inline > 0) {
    // Обычно это строка вне diff. Замечания не теряем: публикуем их в тексте ревью.
    console.warn(
      `warning: GitHub отклонил inline-замечания (${result.json?.message || result.status}); публикую их в сводке`,
    );
    result = await post(url, token, payload(review, context.sha, false));
    inline = 0;
  }
  if (!result.ok) {
    console.error(`GitHub API ${result.status}: ${result.json?.message || result.text}`);
    return 1;
  }
  console.log(
    `Опубликовано ревью ${result.json?.id ?? ''}, inline-замечаний: ${inline}: ${result.json?.html_url ?? url}`,
  );
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error.stack || String(error));
    process.exitCode = 1;
  },
);
