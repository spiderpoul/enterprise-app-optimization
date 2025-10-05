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
  return `${baseUrl}/dashboard`;
}

async function waitForTableReady(page) {
  await page.waitForSelector('text/Безопасность устройств', { timeout: 30000 });
  await page.waitForSelector('.ant-table-wrapper', { timeout: 10000 });
  await page.waitForSelector('.ant-pagination', { timeout: 10000 });
  await page.waitForSelector('.ant-table-row', { timeout: 10000 });
}

async function goToDeviceSecurity(page) {
  const baseUrl = getBaseUrl();
  await page.goto(`${baseUrl}/device-security`, { waitUntil: 'networkidle0' });
  await waitForTableReady(page);
}

async function advanceToLastPage(page) {
  let safeguard = 0;

  while (safeguard < 100) {
    await page.waitForSelector('li.ant-pagination-next button', { timeout: 10000 });

    const isDisabled = await page.$eval('li.ant-pagination-next button', (element) => {
      return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
    });

    if (isDisabled) {
      break;
    }

    const currentPage = await page.$eval('.ant-pagination-item-active', (element) => {
      const text = element.textContent || '';
      const parsed = Number.parseInt(text.trim(), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    });

    await page.click('li.ant-pagination-next button');

    await page.waitForFunction(
      (expected) => {
        const active = document.querySelector('.ant-pagination-item-active');
        if (!active) {
          return false;
        }

        const text = active.textContent || '';
        const parsed = Number.parseInt(text.trim(), 10);
        return Number.isFinite(parsed) && parsed >= expected;
      },
      { timeout: 10000 },
      currentPage + 1,
    );

    safeguard += 1;
  }

  await page.waitForFunction(() => {
    const element = document.querySelector('li.ant-pagination-next button');
    if (!element) {
      return false;
    }

    return element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
  });
}

async function action(page) {
  await goToDeviceSecurity(page);
  await advanceToLastPage(page);
}

async function back(page) {
  try {
    await page.goBack({ waitUntil: 'networkidle0' });
  } catch (error) {
    console.warn('Failed to navigate back from device security page.', error);
  }
}

module.exports = {
  action,
  back,
  url,
};
