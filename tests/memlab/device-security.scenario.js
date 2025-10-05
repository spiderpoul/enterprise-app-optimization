'use strict';

const DEFAULT_BASE_URL = 'http://127.0.0.1:4300';

function getBaseUrl() {
  const fromEnv = process.env.MEMLAB_APP_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/\/$/, '');
  }

  return DEFAULT_BASE_URL;
}

function url() {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/device-security`;
}

const LOG_PREFIX = '[memlab][device-security]';

function logStep(message) {
  console.info(`${LOG_PREFIX} ${message}`);
}

async function waitForSelectorWithLog(page, selector, options = {}) {
  logStep(`waiting for selector: ${selector}`);

  try {
    await page.waitForSelector(selector, options);
    logStep(`selector ready: ${selector}`);
  } catch (error) {
    logStep(`selector failed: ${selector} :: ${error?.message ?? error}`);
    throw error;
  }
}

async function waitForDocumentReady(page) {
  logStep('waiting for document ready state');

  try {
    await page.waitForFunction(
      () => typeof document !== 'undefined' && document.readyState === 'complete',
      { timeout: 30000 },
    );
    logStep('document ready state reached');
  } catch (error) {
    logStep(`document ready wait failed :: ${error?.message ?? error}`);
    throw error;
  }
}

async function waitForTableReady(page) {
  await waitForDocumentReady(page);
  await waitForSelectorWithLog(page, '[data-test="device-security-title"]', { timeout: 60000 });
  await waitForSelectorWithLog(page, '[data-test="device-security-table"]', { timeout: 60000 });
  await waitForSelectorWithLog(page, '[data-test="device-security-pagination-next"]', { timeout: 60000 });
  await waitForSelectorWithLog(page, '[data-test="device-security-row"]', { timeout: 60000 });
}

async function advanceToLastPage(page) {
  let safeguard = 0;

  while (safeguard < 100) {
    await waitForSelectorWithLog(page, '[data-test="device-security-pagination-next"]', {
      timeout: 60000,
    });

    logStep(`advance iteration #${safeguard + 1}`);

    const isDisabled = await page.$eval(
      '[data-test="device-security-pagination-next"]',
      (element) => {
        if (element.hasAttribute('disabled')) {
          return true;
        }

        const ariaDisabled = element.getAttribute('aria-disabled');
        if (ariaDisabled === 'true') {
          return true;
        }

        const closestDisabled = element.closest('[aria-disabled="true"]');
        return Boolean(closestDisabled);
      },
    );

    if (isDisabled) {
      break;
    }

    const currentPage = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('[data-test^="device-security-pagination-item-"]'),
      );

      for (const item of items) {
        const parent = item.closest('[aria-current="page"]');
        if (!parent) {
          continue;
        }

        const text = item.textContent || '';
        const parsed = Number.parseInt(text.trim(), 10);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }

      return 0;
    });

    logStep(`current page detected: ${currentPage}`);

    await page.click('[data-test="device-security-pagination-next"]');
    logStep('clicked next pagination button');

    await page.waitForFunction(
      (expectedPage, selectorPrefix) => {
        const items = Array.from(
          document.querySelectorAll(`[data-test^="${selectorPrefix}"]`),
        );

        return items.some((item) => {
          const parent = item.closest('[aria-current="page"]');
          if (!parent) {
            return false;
          }

          const text = item.textContent || '';
          const parsed = Number.parseInt(text.trim(), 10);
          return Number.isFinite(parsed) && parsed >= expectedPage;
        });
      },
      { timeout: 10000 },
      currentPage + 1,
      'device-security-pagination-item-',
    );

    safeguard += 1;
  }

  logStep('waiting for pagination next button to become disabled');

  await page.waitForFunction(() => {
    const element = document.querySelector('[data-test="device-security-pagination-next"]');
    if (!element) {
      return false;
    }

    if (element.hasAttribute('disabled')) {
      return true;
    }

    if (element.getAttribute('aria-disabled') === 'true') {
      return true;
    }

    return Boolean(element.closest('[aria-disabled="true"]'));
  });
}

async function action(page) {
  await waitForTableReady(page);
  await advanceToLastPage(page);
}

async function back(page) {
  let safeguard = 0;

  while (safeguard < 100) {
    logStep(`back iteration #${safeguard + 1}`);
    const hasPrevious = await page.$('[data-test="device-security-pagination-prev"]');
    if (!hasPrevious) {
      break;
    }

    const isDisabled = await page.$eval(
      '[data-test="device-security-pagination-prev"]',
      (element) => {
        if (element.hasAttribute('disabled')) {
          return true;
        }

        if (element.getAttribute('aria-disabled') === 'true') {
          return true;
        }

        return Boolean(element.closest('[aria-disabled="true"]'));
      },
    );

    if (isDisabled) {
      break;
    }

    logStep('clicked previous pagination button');
    await page.click('[data-test="device-security-pagination-prev"]');

    await page.waitForTimeout(250);
    safeguard += 1;
  }
}

module.exports = {
  action,
  back,
  url,
};
