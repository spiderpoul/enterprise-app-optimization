import { expect, test } from '@playwright/test';

test('users table is interactive', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/users');
  await page.waitForLoadState('networkidle');

  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  const hasReactRuntimeError = consoleErrors.some((entry) =>
    /Cannot read properties of null|useRef/i.test(entry),
  );

  expect(hasReactRuntimeError).toBeFalsy();
});
