import { test, expect } from '@playwright/test';

/**
 * Article talk pages — the discussion area attached to every article.
 * Important Wikipedia surface that uses a different rendering shape
 * from the article body (threaded discussion sections).
 */

test.describe('article talk pages', { tag: ['@regression-suite'] }, () => {
  test('talk page exists for popular articles', async ({ page }) => {
    await page.goto('/wiki/Talk:Albert_Einstein');
    // Heading shape varies (e.g. "Talk:Albert Einstein"), match loosely.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/talk/i);
  });

  test('talk page has discussion sections', async ({ page }) => {
    await page.goto('/wiki/Talk:Photosynthesis');
    // Talk pages have at minimum a "WikiProjects" / banner section at the
    // top + (typically) topic-thread sections below. Verify at least one
    // section heading rendered.
    const sectionHeadings = page.locator('h2 .mw-headline, h2 > span.mw-headline');
    await expect(sectionHeadings.first()).toBeVisible();
  });
});
