import { test, expect } from '@playwright/test';

/**
 * Brand-new test added expressly to exercise the Brittle PR-comment
 * bot's NEW badge. The expectation below will not match the live page,
 * so this test fails on first contact — perfect for proving the
 * "never-seen-before failure" classification path.
 */

test.describe('brittle-bot smoke', { tag: ['@smoke', '@brittle-bot'] }, () => {
  test('newly added test that fails on purpose', async ({ page }) => {
    await page.goto('/wiki/Main_Page');
    const heading = page.getByRole('heading', { name: 'This text will never appear' });
    await expect(heading).toBeVisible({ timeout: 5000 });
  });
});
