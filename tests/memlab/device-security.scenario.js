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
  return `${baseUrl}`;
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
  await waitForSelectorWithLog(page, '[data-test="device-security-title"]', { timeout: 60000 });
  await waitForSelectorWithLog(page, '[data-test="device-security-table"]', { timeout: 60000 });
  await waitForSelectorWithLog(page, '[data-test="device-security-pagination-next"]', { timeout: 60000 });
  await waitForSelectorWithLog(page, '[data-test="device-security-row"]', { timeout: 60000 });
}

async function advanceToLastPage(page) {
  let safeguard = 0;

  while (safeguard < 39) {
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

    await page.click('[data-test="device-security-pagination-next"]');
    logStep('clicked next pagination button');

    safeguard += 1;
  }

  logStep('waiting for pagination next button to become disabled');
}

async function action(page) {
  await waitForDocumentReady(page);
  await waitForSelectorWithLog(page, '[data-testid="device-security"]', { timeout: 10000})
  await page.click('[data-testid="device-security"]');
  await waitForTableReady(page);
  await advanceToLastPage(page);
}

async function back(page) {
  await page.click('[data-testid="dashboard"]');
}

module.exports = {
  action,
  back,
  url,
};
