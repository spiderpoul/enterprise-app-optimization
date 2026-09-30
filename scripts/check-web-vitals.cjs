'use strict';

// Замеряет Web Vitals роутов через shell тем же Chrome DevTools MCP, что подключён агенту в .mcp.json:
// агент разбирает трейс руками, а эта проверка — гейт с числами против бюджета.
const fs = require('fs');
const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport, getDefaultEnvironment } = require('@modelcontextprotocol/sdk/client/stdio.js');

const root = path.resolve(__dirname, '..');
const budgetFile = path.join('performance', 'web-vitals-budget.json');
const budget = JSON.parse(fs.readFileSync(path.join(root, budgetFile), 'utf8'));
const server = JSON.parse(fs.readFileSync(path.join(root, '.mcp.json'), 'utf8')).mcpServers[
  'chrome-devtools'
];

const baseUrl = process.env.WEB_VITALS_BASE_URL;
if (!baseUrl) {
  console.error(
    'Проверка Web Vitals не знает, куда идти. Подними приложение как в production (npm run start:prod -- --build) ' +
      'и передай адрес shell: WEB_VITALS_BASE_URL=http://localhost:4300 npm run check:web-vitals -- /users. ' +
      'Dev-сервер для замера не подходит: там eval-сборка без минификации.',
  );
  process.exit(2);
}
const routes =
  process.argv.slice(2).length > 0 ? process.argv.slice(2) : Object.keys(budget.routes);
// Локальные особенности запуска Chrome (путь к бинарнику, --no-sandbox в контейнере под root) — не в .mcp.json.
const extraArgs = (process.env.WEB_VITALS_MCP_ARGS || '').split(' ').filter(Boolean);

// Выполняется в странице: ждёт, пока сеть и LCP затихнут (shell догружает продукты уже после load),
// и возвращает LCP, CLS, JS, скачанный до LCP, и путь, на котором остался браузер. Что на этом пути
// открылась нужная страница, а не заглушка или ошибка, скрипт не знает: это подтверждают до замера
// (take_screenshot через MCP или smoke). LCP и CLS здесь — локальный regression budget, не полевые данные и не INP.
const measureInPage = `async () => {
  const lcpEntries = [];
  const shifts = [];
  new PerformanceObserver((list) => lcpEntries.push(...list.getEntries())).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => shifts.push(...list.getEntries())).observe({ type: 'layout-shift', buffered: true });
  let state = '';
  let quietSince = performance.now();
  while (performance.now() < 45000) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const next = lcpEntries.length + ':' + performance.getEntriesByType('resource').length;
    if (next !== state) {
      state = next;
      quietSince = performance.now();
    } else if (lcpEntries.length > 0 && performance.now() - quietSince > 3000) {
      break;
    }
  }
  const lcp = lcpEntries[lcpEntries.length - 1];
  let cls = 0;
  let windowValue = 0;
  let windowStart = 0;
  let previous = 0;
  for (const shift of shifts.filter((entry) => !entry.hadRecentInput)) {
    if (shift.startTime - previous > 1000 || shift.startTime - windowStart > 5000) {
      windowValue = 0;
      windowStart = shift.startTime;
    }
    windowValue += shift.value;
    previous = shift.startTime;
    cls = Math.max(cls, windowValue);
  }
  const scripts = performance.getEntriesByType('resource')
    .filter((entry) => /\\.m?js(\\?|$)/.test(entry.name) && (!lcp || entry.startTime < lcp.startTime))
    .map((entry) => ({ name: entry.name.split('/').pop(), bytes: entry.encodedBodySize }))
    .sort((a, b) => b.bytes - a.bytes);
  return {
    path: location.pathname,
    lcp: lcp ? Math.round(lcp.startTime) : null,
    lcpElement: lcp && lcp.element ? lcp.element.tagName.toLowerCase() + (lcp.element.className ? '.' + String(lcp.element.className).split(' ')[0] : '') : null,
    cls: Math.round(cls * 1000) / 1000,
    scripts: scripts.slice(0, 3),
    scriptBytes: scripts.reduce((sum, entry) => sum + entry.bytes, 0),
  };
}`;

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`;
const ms = (value) => `${value.toLocaleString('ru-RU')} мс`;

async function main() {
  const client = new Client({ name: 'check-web-vitals', version: '1.0.0' });
  await client.connect(
    new StdioClientTransport({
      command: server.command,
      args: [...server.args, ...extraArgs],
      // env из .mcp.json (например, CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS) поверх безопасного набора по умолчанию.
      env: { ...getDefaultEnvironment(), ...(server.env || {}) },
      cwd: root,
      stderr: 'ignore',
    }),
  );
  const call = async (name, args) => {
    const result = await client.callTool({ name, arguments: args });
    const text = result.content.map((part) => part.text || '').join('\n');
    if (result.isError) throw new Error(`${name}: ${text}`);
    return text;
  };

  const { cpuThrottlingRate, networkConditions } = budget.throttling;
  await call('emulate', {
    pageId: 1,
    cpuThrottlingRate,
    ...(networkConditions ? { networkConditions } : {}),
  });
  const conditions = `CPU ×${cpuThrottlingRate}${networkConditions ? `, ${networkConditions}` : ''}, медиана ${budget.runs} прогонов`;

  const failures = [];
  for (const route of routes) {
    const limit = { ...budget.default, ...budget.routes[route] };
    const runs = [];
    for (let run = 0; run < budget.runs; run += 1) {
      await call('navigate_page', { pageId: 1, type: 'url', url: 'about:blank' });
      await call('navigate_page', {
        pageId: 1,
        type: 'url',
        url: new URL(route, baseUrl).href,
        ignoreCache: true,
        timeout: 60000,
      });
      const output = await call('evaluate_script', {
        pageId: 1,
        function: measureInPage,
        waitForStableDom: false,
      });
      runs.push(JSON.parse(output.slice(output.indexOf('{'), output.lastIndexOf('}') + 1)));
    }
    const expectedPath = new URL(route, baseUrl).pathname;
    const wrongPath = runs.find((run) => run.path !== expectedPath);
    if (wrongPath) {
      failures.push(
        `${route}: браузер оказался на ${wrongPath.path}, а не на ${expectedPath} — замерена не та страница (редирект или fallback). ` +
          'Открой роут через MCP (take_screenshot, list_console_messages) и почини загрузку, потом меряй.',
      );
      continue;
    }
    if (runs.some((run) => run.lcp === null)) {
      failures.push(
        `${route}: браузер не зафиксировал LCP — страница ничего не отрисовала. Открой её через MCP (take_screenshot, list_console_messages).`,
      );
      continue;
    }
    const lcp = median(runs.map((run) => run.lcp));
    const cls = median(runs.map((run) => run.cls));
    // Диагностика — из прогона, чей LCP и есть медиана, а не из последнего прогона.
    const medianRunIndex = runs.findIndex((run) => run.lcp === lcp);
    const { scripts, scriptBytes, lcpElement } = runs[medianRunIndex];
    const diagnosticsRun = `прогон ${medianRunIndex + 1} из ${runs.length} — с медианным LCP`;
    console.log(
      `${route}: LCP ${ms(lcp)} (бюджет ${ms(limit.lcpMs)}, цель ${ms(budget.target.lcpMs)}) · ` +
        `CLS ${cls} (бюджет ${limit.cls}, цель ${budget.target.cls}) · ${conditions} · JS до LCP ${mb(scriptBytes)} (${diagnosticsRun})`,
    );

    if (lcp > limit.lcpMs) {
      const heaviest = scripts.map((script) => `${script.name} ${mb(script.bytes)}`).join(', ');
      failures.push(
        `${route}: LCP ${ms(lcp)} при бюджете ${ms(limit.lcpMs)} (${conditions}). ` +
          `В ${diagnosticsRun}: LCP-элемент — ${lcpElement}, до LCP браузер скачал ${mb(scriptBytes)} JS, больше всего — ${heaviest}. ` +
          'Обычно это код страницы или библиотека целиком ' +
          "в entry продукта: CommonJS (require, modules: 'cjs') или статический import страницы — см. «Не копируй» в docs/performance.md. " +
          'Не угадывай: сними трейс через MCP chrome-devtools (performance_start_trace, затем performance_analyze_insight LCPBreakdown) — ' +
          'шаги в .agents/skills/web-vitals-check/SKILL.md.',
      );
    }
    if (cls > limit.cls) {
      failures.push(
        `${route}: CLS ${cls} при бюджете ${limit.cls} — контент сдвигается после отрисовки. Задай размеры контейнеру таблицы ` +
          'и лоадеру (skeleton той же высоты), трейс покажет сдвиги в insight CLSCulprits.',
      );
    }
  }
  await client.close();

  if (failures.length > 0) {
    console.error(
      `\nПроверка Web Vitals не прошла:\n${failures.map((failure) => `✖ ${failure}`).join('\n')}`,
    );
    console.error(
      `Бюджет в ${budgetFile} не ослабляй, чтобы проверка позеленела, — это решает владелец (@perf-guild).`,
    );
    process.exit(1);
  }
  console.log('Проверка Web Vitals пройдена: LCP и CLS в локальном бюджете. INP и полевой UX этим не подтверждены.');
}

main().catch((error) => {
  console.error(
    `Проверка Web Vitals не смогла запустить Chrome через MCP: ${error.message}\n` +
      'Chrome не установлен в стандартном месте или запускаешь под root в контейнере — передай ' +
      'WEB_VITALS_MCP_ARGS="--executablePath <путь к chrome> --chromeArg=--no-sandbox".',
  );
  process.exit(2);
});
