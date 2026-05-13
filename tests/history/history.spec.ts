import { test, expect } from '@playwright/test';

/**
 * Article revision history — the audit trail that's central to
 * Wikipedia's credibility. These tests exercise the history pages
 * directly, which use a different layout from the article body and
 * have their own regression risk.
 */

test.describe('revision history', { tag: ['@regression-suite'] }, () => {
  test('history page renders a revision list', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein?action=history');
    // History page is a list of revisions inside #pagehistory.
    const list = page.locator('#pagehistory, .mw-contributions-list').first();
    await expect(list).toBeVisible();
    // High-traffic article — definitely has > 5 visible entries.
    const entries = list.locator('li');
    await expect(entries).not.toHaveCount(0);
  });

  test('clicking a revision opens the old-version view', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein?action=history');
    // First "old revision" link with text "prev" or a timestamp link.
    const firstRevLink = page.locator('#pagehistory a[href*="oldid="]').first();
    await firstRevLink.click();
    // Old revisions are shown with a banner explaining the user is viewing
    // an old version.
    await expect(page.locator('.mw-revision, #mw-revision-info')).toBeVisible({ timeout: 15_000 });
  });

  test('user contributions page loads for a known user', async ({ page }) => {
    await page.goto('/wiki/Special:Contributions/Jimbo_Wales');
    await expect(
      page.getByRole('heading', { name: /user contributions/i }),
    ).toBeVisible();
  });
});
