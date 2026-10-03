'use strict';

const { createRoutePaginationScenario } = require('./create-route-pagination-scenario');

module.exports = createRoutePaginationScenario({
  name: 'device-security',
  defaultBaseUrl: 'http://127.0.0.1:4305',
  routeSelector: '[data-testid="device-security"]',
  readySelectors: [
    '[data-test="device-security-title"]',
    '[data-test="device-security-table"]',
    '[data-test="device-security-pagination-next"]',
    '[data-test="device-security-row"]',
  ],
  nextSelector: '[data-test="device-security-pagination-next"]',
  backSelector: '[data-testid="dashboard"]',
  getCurrentPage: (page) =>
    page.$eval('[data-test="device-security-page"]', (element) => element.getAttribute('data-page')),
  waitForPageChange: (page, previousPage) =>
    page.waitForFunction(
      (expectedPreviousPage) =>
        document
          .querySelector('[data-test="device-security-page"]')
          ?.getAttribute('data-page') !== expectedPreviousPage,
      { timeout: 10000 },
      previousPage,
    ),
  minTransitions: 39,
});
