import { test, expect } from '@playwright/test';

test.describe('Dar Lemlih storefront smoke tests', () => {
  test('hero renders sharply and locale switch updates language', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/fr$/);

    await expect(page.getByRole('heading', { name: /miel marocain/i })).toBeVisible();

    const hero = page.getByRole('region', { name: /miel marocain/i });
    const heroImage = hero.getByRole('img', { name: /miel/i });
    await expect(heroImage).toBeVisible();

    const localeSwitcher = page.getByRole('group', { name: /langue/i });
    await localeSwitcher.getByRole('button', { name: 'EN', exact: true }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { name: /rare moroccan honey/i })).toBeVisible();
  });
});
