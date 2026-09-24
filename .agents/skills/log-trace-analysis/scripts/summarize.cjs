#!/usr/bin/env node
'use strict';

// Детерминированная часть скилла log-trace-analysis: читает большой лог, чтобы его не читала
// модель. Группирует строки с ошибками, упорядочивает группы по первому появлению и показывает
// трейс, в котором группа началась. Без зависимостей; файл читается потоком.
//
//   node .agents/skills/log-trace-analysis/scripts/summarize.cjs <file> [--top <n>]
//   node .agents/skills/log-trace-analysis/scripts/summarize.cjs <file> --trace <id>
//
// Вход: JSON lines, текстовые строки (время, уровень, [service], trace=<id>, сообщение)
// или HAR-файл. Строки, не подходящие ни под один формат, считаются, но не разбираются.
// Вывод остаётся на английском: его читает модель, а формат одинаков для всех команд.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const USAGE = `Usage:
  summarize.cjs <file> [--top <n>]    error groups: first seen, trace, count, relation
  summarize.cjs <file> --trace <id>   timeline of one trace (an id prefix is enough)

<file>: JSON lines, plain-text log lines, or a HAR file.`;

const ERROR_LEVELS = new Set([
  'error',
  'err',
  'fatal',
  'crit',
  'critical',
  'severe',
  'panic',
  'alert',
  'emerg',
]);
const LEVEL_NAMES = { 10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal' };
const MAX_TEXT = 2000;
// Used only for lines without a level: tool and check output, bare stack traces.
const ERROR_WORDS =
  /\b(?:[A-Z]\w*(?:Error|Exception)|Error|Uncaught|Unhandled|Traceback|FAIL(?:ED)?|failed|failure|error)\b|npm ERR!|[✖✗]/;

// ---------- arguments ----------

function parseArgs(argv) {
  const options = { file: null, trace: null, top: 10 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--trace' || arg === '--top') {
      const value = argv[i + 1];
      if (!value) throw new Error(`${arg} needs a value`);
      i += 1;
      if (arg === '--trace') options.trace = value.replace(/(…|\.\.\.)$/, '').toLowerCase();
      else options.top = Math.max(1, Number.parseInt(value, 10) || 10);
    } else if (arg.startsWith('-')) {
      throw new Error(`unknown option ${arg}`);
    } else if (!options.file) {
      options.file = arg;
    } else {
      throw new Error(`unexpected argument ${arg}`);
    }
  }
  if (!options.file) throw new Error('missing <file>');
  return options;
}

// ---------- parsing ----------

function pick(object, keys) {
  for (const key of keys) {
    let value = object;
    for (const part of key.split('.'))
      value = value && typeof value === 'object' ? value[part] : undefined;
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function parseTime(value, context) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') {
    const ms = value > 1e12 ? value : value * 1000;
    return { ms, text: new Date(ms).toISOString().slice(11, 23) };
  }
  const text = String(value);
  const clock = text.match(/(\d{2}):(\d{2}):(\d{2})(?:[.,](\d{1,6}))?/);
  if (!clock) return null;
  const millis = (clock[4] || '0').padEnd(3, '0').slice(0, 3);
  const display = `${clock[1]}:${clock[2]}:${clock[3]}.${millis}`;
  const date = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (date) {
    const hasZone = /(?:Z|[+-]\d{2}:?\d{2})\s*$/.test(text);
    const ms = Date.parse(
      `${date[1]}T${display}${hasZone ? text.match(/(Z|[+-]\d{2}:?\d{2})\s*$/)[1] : 'Z'}`,
    );
    if (!Number.isNaN(ms)) {
      context.lastDay = Date.parse(`${date[1]}T00:00:00Z`);
      return { ms, text: display };
    }
  }
  const sinceMidnight =
    ((Number(clock[1]) * 60 + Number(clock[2])) * 60 + Number(clock[3])) * 1000 + Number(millis);
  return { ms: context.lastDay + sinceMidnight, text: display };
}

function normalizeLevel(value) {
  if (typeof value === 'number') return LEVEL_NAMES[Math.floor(value / 10) * 10] || String(value);
  if (typeof value !== 'string') return undefined;
  const level = value.toLowerCase();
  return level === 'warning' ? 'warn' : level;
}

function traceFrom(value) {
  if (!value) return undefined;
  if (typeof value === 'object') return traceFrom(value.id || value.traceId);
  const text = String(value).trim();
  const parent = text.match(/^00-([0-9a-f]{32})-/i);
  return (parent ? parent[1] : text).toLowerCase();
}

function fromJson(object) {
  const error = pick(object, ['err', 'error', 'exception']);
  const errorText =
    error && typeof error === 'object'
      ? [error.name || error.type, error.message].filter(Boolean).join(': ')
      : typeof error === 'string'
        ? error
        : undefined;
  return {
    time: pick(object, ['time', 'timestamp', 'ts', '@timestamp', 'date', 'datetime']),
    level: normalizeLevel(pick(object, ['level', 'severity', 'lvl', 'levelname', 'log.level'])),
    service: pick(object, [
      'service',
      'service.name',
      'svc',
      'app',
      'application',
      'component',
      'logger',
      'source',
    ]),
    trace: traceFrom(
      pick(object, [
        'traceId',
        'trace_id',
        'traceID',
        'trace',
        'trace.id',
        'otelTraceID',
        'traceparent',
      ]),
    ),
    method: pick(object, ['method', 'req.method', 'request.method', 'http.method']),
    url: pick(object, ['url', 'path', 'req.url', 'request.url', 'http.url', 'http.target']),
    status:
      Number(
        pick(object, [
          'status',
          'statusCode',
          'status_code',
          'res.statusCode',
          'response.status',
          'http.status_code',
        ]),
      ) || undefined,
    message: String(pick(object, ['msg', 'message', 'event', 'text']) || errorText || ''),
  };
}

const TIME_RE =
  /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?|\b\d{2}:\d{2}:\d{2}(?:[.,]\d{1,6})?\b/;
const LEVEL_RE =
  /\b(TRACE|DEBUG|INFO|NOTICE|WARN(?:ING)?|ERROR|ERR|FATAL|CRIT(?:ICAL)?|SEVERE|PANIC)\b|\blevel=(\w+)/;
const TRACE_RE =
  /\b(?:trace(?:[_-]?id)?|traceID|traceparent)[=:]\s*"?(?:00-)?([0-9a-fA-F][0-9a-fA-F-]{7,})/;
const HTTP_RE =
  /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\/\S*)(?:\s+(?:->|→|status[=:]?)?\s*([1-5]\d\d)\b)?/;

function fromText(line) {
  let rest = line;
  const take = (re) => {
    const match = rest.match(re);
    if (match) rest = rest.replace(match[0], ' ');
    return match;
  };
  const time = take(TIME_RE);
  // Tool output ("ERROR in ./src/x.tsx") has no timestamp: keep the level word in the message.
  const level = time ? take(LEVEL_RE) : rest.match(LEVEL_RE);
  const trace = take(TRACE_RE);
  const service = take(/^\s*\[([A-Za-z][\w.:-]*)\]/) || take(/\bservice=([\w.:-]+)/);
  const http = rest.match(HTTP_RE);
  const status =
    http && http[3]
      ? Number(http[3])
      : Number((rest.match(/\bstatus[=:]\s*([1-5]\d\d)\b/) || [])[1]) || undefined;
  return {
    time: time && time[0],
    level: level ? normalizeLevel(level[1] || level[2]) : undefined,
    service: service && service[1],
    trace: trace ? trace[1].toLowerCase() : undefined,
    method: http && http[1],
    url: http && http[2],
    status,
    message: rest.replace(/\s+/g, ' ').trim(),
  };
}

function toRecord(fields, lineNo, context) {
  const message = String(fields.message || '').slice(0, MAX_TEXT);
  const level = fields.level;
  const status = fields.status;
  const looksLikeError = ERROR_WORDS.test(message);
  return {
    lineNo,
    time: parseTime(fields.time, context),
    level: level || (status >= 500 ? 'error' : undefined),
    service: fields.service ? String(fields.service) : undefined,
    trace: fields.trace,
    method: fields.method,
    url: fields.url ? String(fields.url) : undefined,
    status,
    message,
    isError: ERROR_LEVELS.has(level) || status >= 500 || (!level && looksLikeError),
  };
}

function parseLine(line, lineNo, context) {
  const trimmed = line.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return toRecord(fromJson(JSON.parse(trimmed)), lineNo, context);
    } catch (_error) {
      // not JSON after all: fall through to the text parser
    }
  }
  return toRecord(fromText(trimmed.slice(0, MAX_TEXT)), lineNo, context);
}

function harRecords(har, context) {
  return har.log.entries.map((entry, index) => {
    const headers = [...(entry.response?.headers || []), ...(entry.request?.headers || [])];
    const header = (name) => headers.find((item) => item.name.toLowerCase() === name)?.value;
    let url;
    try {
      url = new URL(entry.request.url);
    } catch (_error) {
      url = { host: undefined, pathname: entry.request?.url, search: '' };
    }
    const status = entry.response?.status;
    return toRecord(
      {
        time: entry.startedDateTime,
        level: status === 0 || status >= 500 ? 'error' : 'info',
        service: url.host,
        trace: traceFrom(
          header('traceparent') ||
            header('x-trace-id') ||
            header('x-b3-traceid') ||
            header('x-request-id'),
        ),
        method: entry.request?.method,
        url: `${url.pathname}${url.search || ''}`,
        status: status || undefined,
        message:
          status === 0
            ? `request failed, no response: ${entry.request?.method || 'GET'} ${url.pathname}`
            : `${entry.response?.statusText || ''}`.trim(),
      },
      index + 1,
      context,
    );
  });
}

function readHead(file, bytes = 65536) {
  const fd = fs.openSync(file, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    return buffer.toString('utf8', 0, fs.readSync(fd, buffer, 0, bytes, 0));
  } finally {
    fs.closeSync(fd);
  }
}

// Yields parsed records; a second call re-reads the file (two passes keep memory flat).
async function* records(file, state = {}) {
  const context = { lastDay: 0 };
  const head = readHead(file);
  const firstLine = head.split('\n', 1)[0].trim();
  const maybeHar =
    /\.har$/i.test(file) || (head.trimStart().startsWith('{') && !firstLine.endsWith('}'));
  if (maybeHar) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(parsed?.log?.entries)) {
        state.format = 'har';
        yield* harRecords(parsed, context);
        return;
      }
    } catch (_error) {
      // not a HAR file: read it line by line
    }
  }
  state.format = 'lines';
  const input = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let lineNo = 0;
  for await (const line of input) {
    lineNo += 1;
    if (line.trim()) yield parseLine(line, lineNo, context);
  }
}

// ---------- grouping ----------

const stripQuery = (url) => String(url || '').split(/[?#]/)[0];
const normalizePath = (url) =>
  stripQuery(url)
    .split('/')
    .map((part) => (/^(?:\d+|[0-9a-f]{8,}|[0-9a-f-]{36})$/i.test(part) ? ':id' : part))
    .join('/');
const stripLocations = (text) =>
  text.replace(/\s*\(?\b[\w./:-]*\.(?:js|cjs|mjs|ts|tsx|jsx):\d+(?::\d+)?\)?/g, '');

function groupKey(record) {
  if (record.status >= 500) {
    return {
      key: `http ${record.status} ${normalizePath(record.url)}`,
      label: `${record.status} ${stripQuery(record.url)}`,
    };
  }
  const label = stripLocations(record.message.split('\n')[0]).trim() || '(empty message)';
  const key = label
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<uuid>')
    .replace(/\b[0-9a-f]{12,}\b/gi, '<hex>')
    .replace(/\d+/g, '#')
    .slice(0, 200);
  return { key: `msg ${key}`, label };
}

const earlier = (a, b) => {
  if (a.time && b.time) return a.time.ms < b.time.ms;
  if (a.time || b.time) return Boolean(a.time);
  return a.lineNo < b.lineNo;
};

async function collect(file, wantedTrace) {
  const groups = new Map();
  const matches = [];
  const state = {};
  let lines = 0;
  for await (const record of records(file, state)) {
    lines += 1;
    if (wantedTrace && record.trace && record.trace.startsWith(wantedTrace)) matches.push(record);
    if (!record.isError) continue;
    const { key, label } = groupKey(record);
    let group = groups.get(key);
    if (!group) {
      group = { key, label, count: 0, first: record, traces: new Set(), services: new Set() };
      groups.set(key, group);
    }
    group.count += 1;
    if (earlier(record, group.first)) {
      group.first = record;
      group.label = label;
    }
    if (record.trace) group.traces.add(record.trace);
    if (record.service) group.services.add(record.service);
  }
  const ordered = [...groups.values()].sort((a, b) => (earlier(a.first, b.first) ? -1 : 1));
  ordered.forEach((group, index) => {
    group.index = index + 1;
  });
  return { lines, groups: ordered, matches, unit: state.format === 'har' ? 'entries' : 'lines' };
}

async function addTraceServices(file, groups) {
  const wanted = new Map();
  for (const group of groups) {
    for (const trace of group.traces) wanted.set(trace, new Set());
  }
  if (wanted.size === 0) return;
  for await (const record of records(file)) {
    if (record.trace && record.service && wanted.has(record.trace)) {
      wanted.get(record.trace).add(record.service);
    }
  }
  for (const group of groups) {
    for (const trace of group.traces) {
      for (const service of wanted.get(trace)) group.services.add(service);
    }
  }
}

function relation(group, groups) {
  const shared = (a, b) => [...a.traces].filter((trace) => b.traces.has(trace)).length;
  if (group.traces.size > 0) {
    for (const other of groups) {
      if (other.index >= group.index) break;
      const share = shared(group, other) / group.traces.size;
      if (share >= 0.5)
        return `after #${other.index}, ${share === 1 ? 'same traces' : `${Math.round(share * 100)}% same traces`}`;
    }
  }
  const services = group.services.size
    ? `${group.services.size} service${group.services.size === 1 ? '' : 's'}`
    : '';
  if (group.index === 1) return ['first seen', services].filter(Boolean).join(', ');
  if (group.traces.size === 0) return ['no trace id', services].filter(Boolean).join(', ');
  const related = groups.some((other) => other !== group && shared(group, other) > 0);
  return related ? services || 'shares traces with a later group' : 'unrelated';
}

// ---------- output ----------

const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const clip = (text, width) => (text.length > width ? `${text.slice(0, width - 1)}…` : text);
const shortTrace = (trace) => (trace.length > 8 ? `${trace.slice(0, 8)}…` : trace);
const timeText = (record) => (record.time ? record.time.text : '--:--:--.---');

function printSummary({ lines, groups, unit }, top) {
  const out = [
    `${thousands(lines)} ${unit} · ${groups.length} error group${groups.length === 1 ? '' : 's'}`,
  ];
  for (const group of groups.slice(0, top)) {
    const where = group.first.trace
      ? `trace ${shortTrace(group.first.trace)}`
      : `line ${group.first.lineNo}`;
    out.push(`#${group.index}  ${timeText(group.first)}  ${where}`);
    out.push(`    ${clip(group.label, 76)}`);
    out.push(`    × ${thousands(group.count)} (${relation(group, groups)})`);
  }
  if (groups.length > top)
    out.push(`… ${groups.length - top} more groups (use --top ${groups.length})`);
  console.log(out.join('\n'));
}

function printTrace({ groups, matches }, wanted) {
  const traces = [...new Set(matches.map((record) => record.trace))];
  if (traces.length === 0) {
    console.error(`No lines with a trace id starting with "${wanted}".`);
    return 1;
  }
  if (traces.length > 1) {
    console.error(
      `"${wanted}" matches ${traces.length} traces (${traces.slice(0, 5).join(', ')}…). Use a longer prefix.`,
    );
    return 2;
  }
  const byKey = new Map(groups.map((group) => [group.key, group.index]));
  const timeline = matches.slice().sort((a, b) => (earlier(a, b) ? -1 : 1));
  const services = [...new Set(timeline.map((record) => record.service).filter(Boolean))];
  const width = Math.max(7, ...services.map((service) => service.length));
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const elapsed = first.time && last.time ? last.time.ms - first.time.ms : null;
  const span =
    elapsed === null
      ? ''
      : ` → ${last.time.text} (${elapsed < 10000 ? `${elapsed} ms` : `${(elapsed / 1000).toFixed(1)} s`})`;
  const serviceCount = `${services.length} service${services.length === 1 ? '' : 's'}`;
  const out = [
    `trace ${traces[0]} · ${timeline.length} lines · ${serviceCount} · ${timeText(first)}${span}`,
  ];
  for (const record of timeline) {
    const inMessage = record.url && record.message.includes(stripQuery(record.url));
    const http =
      record.url && !inMessage
        ? [record.status, record.method, stripQuery(record.url)].filter(Boolean).join(' ')
        : '';
    const text = [http, record.message].filter(Boolean).join(' · ');
    const tag = record.isError ? `  [#${byKey.get(groupKey(record).key)}]` : '';
    out.push(
      `${timeText(record)}  ${(record.level || '-').toUpperCase().padEnd(5)}  ${(record.service || '-').padEnd(width)}  ${clip(text, 110)}${tag}`,
    );
  }
  console.log(out.join('\n'));
  return 0;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  const file = path.resolve(options.file);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    console.error(`File not found: ${options.file}`);
    return 2;
  }
  const result = await collect(file, options.trace);
  if (options.trace) return printTrace(result, options.trace);
  await addTraceServices(file, result.groups);
  printSummary(result, options.top);
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
