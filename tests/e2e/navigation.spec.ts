import { expect, test } from '@playwright/test';

const clickNavItem = async (page: import('@playwright/test').Page, label: string) => {
  const locator = page.getByRole('menuitem', { name: label, exact: true }).first();
  try {
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    await locator.click();
    return;
  } catch (error) {
    const fallback = page.getByText(label, { exact: true }).first();
    await fallback.waitFor({ state: 'visible', timeout: 5000 });
    await fallback.click();
  }
};

test.describe('Enterprise shell navigation', () => {
  test('loads dashboard and navigates through microfrontends', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Enterprise optimisation centre', exact: true }),
    ).toBeVisible();

    await clickNavItem(page, 'Operations reports');

    await expect(page.locator('.operations-reports__title')).toContainText(
      'Enterprise operations reports',
    );

    const firstReportRow = page.locator('.operations-reports__table-row').first();
    await firstReportRow.waitFor({ state: 'visible' });
    await firstReportRow.click();

    await expect(page.getByText('Infrastructure readiness overview')).toBeVisible();

    await clickNavItem(page, 'Users & roles');

    await expect(page.locator('.users-roles__title')).toContainText('Users and roles');

    const firstUserRow = page.locator('.users-roles__table-row').first();
    await firstUserRow.waitFor({ state: 'visible' });
    await firstUserRow.click();

    await expect(page.getByText('Riley Anderson')).toBeVisible();
  });
});
