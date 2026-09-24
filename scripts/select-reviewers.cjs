#!/usr/bin/env node
'use strict';

// Выбирает агентных ревьюеров для diff по .agents/review/critical-paths.yml.
// Обычное ревью (скилл code-review) запускается всегда; для каждого критичного пути
// добавляется свой ревьюер. Владельцев берём из .github/CODEOWNERS. Без зависимостей.
//
//   node scripts/select-reviewers.cjs [файлы...] [--names | --json] [--config <yml>] [--codeowners <file>]
//   git diff --name-only origin/main...HEAD | node scripts/select-reviewers.cjs
//
//   файлы         изменённые пути от корня репозитория; без аргументов читаются из stdin, по одному на строку
//   --names       только имена ревьюеров, по одному на строку: сначала обычный, затем критичные (для CI)
//   --json        то же, что в тексте, но JSON
//   --config      другой файл правил (по умолчанию .agents/review/critical-paths.yml)
//   --codeowners  другой CODEOWNERS (по умолчанию .github/CODEOWNERS)
//
// critical-paths.yml читается маленьким парсером подмножества YAML: ключи верхнего уровня `critical`
// (список правил) и `default` (словарь), в правиле — `paths` (список в [скобках]), `reviewer`, `why`.
// Комментарии `# …` и строки-комментарии игнорируются. Правило, которое парсер не понял, — ошибка.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const USAGE = fs
  .readFileSync(__filename, 'utf8')
  .split('\n')
  .slice(3)
  .filter((line, index, lines) => lines.slice(0, index + 1).every((l) => l.startsWith('//')))
  .map((line) => line.replace(/^\/\/ ?/, ''))
  .join('\n');

function parseArgs(argv) {
  const options = { files: [], format: 'text', config: null, codeowners: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      if (!argv[i + 1]) throw new Error(`${arg}: нужно значение`);
      i += 1;
      return argv[i];
    };
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--names') options.format = 'names';
    else if (arg === '--json') options.format = 'json';
    else if (arg === '--config') options.config = value();
    else if (arg === '--codeowners') options.codeowners = value();
    else if (arg.startsWith('-')) throw new Error(`неизвестный параметр ${arg}`);
    else options.files.push(arg);
  }
  return options;
}

// ---------- маленький YAML ----------

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === "'" || char === '"') {
      quote = char;
    } else if (char === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

function scalar(text) {
  const value = text.trim();
  if (/^'.*'$/.test(value)) return value.slice(1, -1).replace(/''/g, "'");
  if (/^".*"$/.test(value)) return value.slice(1, -1);
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) throw new Error(`незакрытый список: ${value}`);
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(',').map((item) => scalar(item)) : [];
  }
  return value;
}

function parseYaml(text, file) {
  const result = {};
  let section = null; // имя ключа верхнего уровня
  let item = null; // текущий элемент списка
  text.split('\n').forEach((raw, index) => {
    const where = `${file}:${index + 1}`;
    const line = stripComment(raw).replace(/\s+$/, '');
    if (!line.trim()) return;
    const indent = line.match(/^ */)[0].length;
    const body = line.trim();
    if (indent === 0) {
      const match = body.match(/^([\w-]+):\s*(.*)$/);
      if (!match) throw new Error(`${where}: ожидался ключ верхнего уровня`);
      section = match[1];
      item = null;
      result[section] = match[2] ? scalar(match[2]) : undefined;
      return;
    }
    if (!section) throw new Error(`${where}: отступ без ключа верхнего уровня`);
    const listItem = body.match(/^-\s+(.*)$/);
    const pair = (listItem ? listItem[1] : body).match(/^([\w-]+):\s*(.*)$/);
    if (!pair) throw new Error(`${where}: ожидалась пара «ключ: значение»`);
    if (listItem) {
      if (result[section] === undefined) result[section] = [];
      if (!Array.isArray(result[section])) throw new Error(`${where}: «${section}» — не список`);
      item = {};
      result[section].push(item);
    } else if (!item) {
      if (result[section] === undefined) result[section] = {};
      if (Array.isArray(result[section])) throw new Error(`${where}: ожидался элемент списка «- …»`);
      item = result[section];
    }
    item[pair[1]] = scalar(pair[2]);
  });
  return result;
}

// ---------- шаблоны путей ----------

function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*' && glob[i + 1] === '*') {
      re += '.*';
      i += 1;
      if (glob[i + 1] === '/') i += 1;
    } else if (char === '*') re += '[^/]*';
    else if (char === '?') re += '[^/]';
    else re += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

// CODEOWNERS: побеждает последнее совпавшее правило; `/dir/` — каталог целиком.
function readCodeowners(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => stripComment(line).trim())
    .filter(Boolean)
    .map((line) => {
      const [pattern, ...owners] = line.split(/\s+/);
      let glob = pattern.startsWith('/') ? pattern.slice(1) : `**/${pattern}`;
      if (glob.endsWith('/')) glob += '**';
      return { pattern, re: globToRegExp(glob), owners };
    });
}

function ownersOf(file, rules) {
  let owners = [];
  for (const rule of rules) if (rule.re.test(file)) owners = rule.owners;
  return owners;
}

// ---------- main ----------

function readFiles(options) {
  if (options.files.length) return options.files;
  if (process.stdin.isTTY) return [];
  return fs.readFileSync(0, 'utf8').split('\n');
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`${error.message}\nСправка: node scripts/select-reviewers.cjs --help`);
    return 2;
  }
  if (options.help) {
    console.log(USAGE);
    return 0;
  }

  const configFile = path.resolve(root, options.config || '.agents/review/critical-paths.yml');
  const codeownersFile = path.resolve(root, options.codeowners || '.github/CODEOWNERS');
  let config;
  try {
    config = parseYaml(fs.readFileSync(configFile, 'utf8'), path.relative(root, configFile));
  } catch (error) {
    console.error(`Не удалось прочитать правила ревью: ${error.message}`);
    return 2;
  }
  const critical = Array.isArray(config.critical) ? config.critical : [];
  const problems = [];
  critical.forEach((rule, index) => {
    if (!Array.isArray(rule.paths) || rule.paths.length === 0) problems.push(`critical[${index}]: нет paths`);
    if (typeof rule.reviewer !== 'string' || !rule.reviewer) problems.push(`critical[${index}]: нет reviewer`);
  });
  const defaultReviewer = config.default && config.default.reviewer;
  if (typeof defaultReviewer !== 'string' || !defaultReviewer) problems.push('default: нет reviewer');
  if (problems.length) {
    console.error(`${path.relative(root, configFile)} не прошёл проверку:\n- ${problems.join('\n- ')}`);
    return 2;
  }

  const files = [
    ...new Set(
      readFiles(options)
        .map((file) => file.trim().replace(/^\.\//, ''))
        .filter(Boolean),
    ),
  ];
  const codeowners = readCodeowners(codeownersFile);

  const reviewers = [{ reviewer: defaultReviewer, kind: 'default', why: 'обычное ревью каждого diff', files }];
  for (const rule of critical) {
    const patterns = rule.paths.map(globToRegExp);
    const matched = files.filter((file) => patterns.some((re) => re.test(file)));
    if (!matched.length) continue;
    const existing = reviewers.find((entry) => entry.reviewer === rule.reviewer);
    if (existing) {
      existing.files = [...new Set([...existing.files, ...matched])];
      continue;
    }
    reviewers.push({
      reviewer: rule.reviewer,
      kind: 'critical',
      why: rule.why || '',
      agent: `.agents/agents/${rule.reviewer}.md`,
      files: matched,
    });
  }
  for (const entry of reviewers) {
    entry.owners = [...new Set(entry.files.flatMap((file) => ownersOf(file, codeowners)))];
  }

  if (options.format === 'names') {
    reviewers.forEach((entry) => console.log(entry.reviewer));
    return 0;
  }
  if (options.format === 'json') {
    console.log(JSON.stringify({ files: files.length, reviewers }, null, 2));
    return 0;
  }

  console.log(`Изменённых файлов: ${files.length}`);
  console.log('Ревьюеры для этого diff:');
  for (const entry of reviewers) {
    const label = entry.kind === 'default' ? 'обычное ревью, скилл .agents/skills/code-review' : entry.agent;
    console.log(`- ${entry.reviewer} (${label})`);
    if (entry.kind !== 'default') {
      console.log(`    почему: ${entry.why}`);
      console.log(`    файлы:  ${entry.files.join(', ')}`);
    }
    console.log(`    владельцы (CODEOWNERS): ${entry.owners.length ? entry.owners.join(', ') : 'не назначены'}`);
  }
  const extra = reviewers.length - 1;
  console.log(
    extra
      ? `Критичных путей: ${extra}. Агенты только комментируют; мёрж — за владельцами.`
      : 'Критичные пути не задеты: достаточно обычного ревью.',
  );
  return 0;
}

process.exitCode = main();
