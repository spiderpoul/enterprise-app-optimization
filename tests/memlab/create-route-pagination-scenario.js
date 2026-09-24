'use strict';

function createRoutePaginationScenario({
  name,
  defaultBaseUrl,
  routeSelector,
  readySelectors,
  nextSelector,
  backSelector,
  getCurrentPage,
  waitForPageChange,
  maxPages = 40,
  minTransitions = 1,
}) {
  if (typeof getCurrentPage !== 'function' || typeof waitForPageChange !== 'function') {
    throw new Error('Pagination scenario requires getCurrentPage and waitForPageChange callbacks.');
  }

  const logPrefix = `[memlab][${name}]`;
  const log = (message) => console.info(`${logPrefix} ${message}`);
  const waitFor = async (page, selector, timeout = 60000) => {
    log(`waiting for selector: ${selector}`);
    await page.waitForSelector(selector, { timeout });
    log(`selector ready: ${selector}`);
  };

  return {
    url: () => (process.env.MEMLAB_APP_BASE_URL || defaultBaseUrl).trim().replace(/\/$/, ''),
    action: async (page) => {
      log('waiting for document ready state');
      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
      await waitFor(page, routeSelector);
      log(`opening route via ${routeSelector}`);
      await page.click(routeSelector);
      for (const selector of readySelectors) await waitFor(page, selector);

      let transitions = 0;
      let reachedDisabledNext = false;
      for (let attempt = 0; attempt < maxPages; attempt += 1) {
        const disabled = await page.$eval(nextSelector, (element) => Boolean(
          element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true' || element.closest('[aria-disabled="true"]'),
        ));
        if (disabled) {
          reachedDisabledNext = true;
          log(`Next is disabled after ${transitions} transitions`);
          break;
        }

        const previousPage = await getCurrentPage(page);
        log(`transition ${transitions + 1}: current page is ${previousPage}; clicking Next`);
        await page.click(nextSelector);
        await waitForPageChange(page, previousPage);
        const currentPage = await getCurrentPage(page);
        if (currentPage === previousPage) {
          throw new Error(`Pagination did not change after clicking Next on page ${previousPage}.`);
        }
        transitions += 1;
        log(`transition ${transitions}: page changed from ${previousPage} to ${currentPage}`);
      }

      if (!reachedDisabledNext) {
        throw new Error(`Pagination did not reach a disabled Next control within ${maxPages} attempts.`);
      }
      if (transitions < minTransitions) {
        throw new Error(`Pagination completed only ${transitions} transitions; expected at least ${minTransitions}.`);
      }
      log(`pagination interaction completed with ${transitions} transitions`);
    },
    back: async (page) => {
      log(`navigating away via ${backSelector}`);
      await page.click(backSelector);
      await page.waitForSelector(routeSelector);
      log('navigation-away completed');
    },
  };
}

module.exports = { createRoutePaginationScenario };
