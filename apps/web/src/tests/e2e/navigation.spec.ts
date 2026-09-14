import { test, expect } from '@playwright/test';

test.describe('Dar Lemlih navigation tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page in French
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr$/);
  });

  test('can navigate to the collection page', async ({ page }) => {
    // Wait for the navigation menu to be visible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    const linkInNav = nav.getByRole('link', { name: 'Collection', exact: true });
    await expect(linkInNav).toBeVisible();
    await linkInNav.click();

    // Verify we are on the products page
    await expect(page).toHaveURL(/\/fr\/products$/);
    await expect(page.getByRole('heading', { name: /collection/i })).toBeVisible();
    await expect(page.getByText(/La collection arrivera bientôt/i)).toBeVisible();
  });

  test('can navigate to the story page', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /navigation principale/i });
    const storyLink = nav.getByRole('link', { name: 'Notre histoire', exact: true });
    await storyLink.click();

    // Verify we are on the story page
    await expect(page).toHaveURL(/\/fr\/story$/);
  });

  test('can navigate back to home using the logo', async ({ page }) => {
    // Go to products first
    await page.goto('/fr/products');

    // Click on the logo (link containing "Dar Lemlih")
    const logoLink = page.getByRole('link', { name: /dar lemlih/i }).first();
    await logoLink.click();

    // Verify we are back on the home page
    await expect(page).toHaveURL(/\/fr$/);
  });
});
