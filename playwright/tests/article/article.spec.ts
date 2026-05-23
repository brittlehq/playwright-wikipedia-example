import { test, expect } from '@playwright/test';
import { annotate } from '../_shared/annotate.js';

/**
 * Article page navigation + content rendering — the bulk of Wikipedia
 * traffic lands on /wiki/{Title} pages, so these tests cover the
 * heaviest user-facing rendering path.
 *
 * Page picks for stability:
 *   - Albert_Einstein — extremely long-lived URL, never deleted, has an
 *     infobox + references + TOC
 *   - Photosynthesis — same shape, different topic, used for cross-
 *     article navigation tests
 */

test.describe('article rendering', { tag: ['@smoke', '@a11y'] }, () => {
  test.beforeEach(() => {
    annotate('owner', 'content-platform');
    annotate('severity', 'high');
    annotate('doc', 'https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style');
  });

  test('article page renders title heading', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein');
    await expect(page.getByRole('heading', { name: 'Albert Einstein', level: 1 })).toBeVisible();
  });

  test('article infobox renders with metadata', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein');
    // Wikipedia's "infobox" on biographies has the subject's photo,
    // birth/death dates, and a few other fields. Selector targets the
    // canonical class — stable for 10+ years.
    const infobox = page.locator('table.infobox').first();
    await expect(infobox).toBeVisible();
    await expect(infobox).toContainText(/14 March 1879|Ulm/);
  });

  test('article has a references section', async ({ page }) => {
    await page.goto('/wiki/Photosynthesis');
    await expect(page.getByRole('heading', { name: /^references$/i })).toBeVisible();
  });

  test('skip-to-content link is present (a11y)', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein');
    // First focusable element on every Wikipedia page is the
    // "Jump to content" skip-link — a load-bearing a11y affordance.
    const skipLink = page.getByRole('link', { name: /jump to content/i });
    await expect(skipLink).toBeAttached();
  });
});

/**
 * TOC anchor scrolling. Wikipedia's table-of-contents links are real
 * fragment links; clicking them should scroll the heading into view.
 * Sometimes the scroll fires before the page fully settles — tagged
 * `@flaky-watch` for that reason.
 */
test.describe('TOC anchor scrolling', { tag: ['@regression-suite', '@flaky-watch'] }, () => {
  test.beforeEach(() => {
    annotate('owner', 'content-platform');
    annotate('severity', 'medium');
    annotate('issue', 'WIKI-318');
  });

  test('clicking a TOC entry scrolls its section into view', async ({ page }) => {
    await page.goto('/wiki/Photosynthesis');
    // Pick a section that's definitely below the fold so the scroll is
    // observable. "History" is in nearly every article's TOC.
    const tocLink = page.locator('.vector-toc a, #toc a').filter({ hasText: /^History$/ }).first();
    await tocLink.click();
    // The corresponding section heading should now be near the viewport top.
    const heading = page.getByRole('heading', { name: 'History' }).first();
    await expect(heading).toBeInViewport();
  });
});
