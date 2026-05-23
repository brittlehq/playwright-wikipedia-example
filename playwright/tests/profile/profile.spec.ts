import { test, expect } from '@playwright/test';

/**
 * User profile pages — Wikipedia's lightweight "social" surface. We
 * exercise read-only views; the edit/preferences flows would require
 * auth and are out of scope for this demo.
 */

test.describe('user profile pages', { tag: ['@smoke'] }, () => {
  test('founder user page renders with bio content', async ({ page }) => {
    await page.goto('/wiki/User:Jimbo_Wales');
    // User pages are just articles in the User: namespace. The page title
    // matches the username; the body is whatever the user chose to put there.
    await expect(page.getByRole('heading', { name: /jimbo wales/i, level: 1 })).toBeVisible();
  });

  test('user page links to contributions + talk', async ({ page }) => {
    await page.goto('/wiki/User:Jimbo_Wales');
    // Sidebar / page-actions menu always carries "Contributions" + "Talk"
    // links scoped to the user.
    await expect(page.getByRole('link', { name: /contributions/i }).first()).toBeAttached();
    await expect(page.getByRole('link', { name: /^talk$/i }).first()).toBeAttached();
  });
});
