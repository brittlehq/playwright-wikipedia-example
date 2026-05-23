import { test, expect } from '@playwright/test';
import { annotate } from '../_shared/annotate.js';

/**
 * Wikipedia search — entry-point smoke tests. The search box on the main
 * page is the highest-traffic affordance in the product and the place
 * where most users start a session, so it gets the strictest tags and
 * the most parallel coverage in the demo's CI matrix.
 */

test.describe('search', { tag: ['@smoke', '@p0'] }, () => {
  test.beforeEach(() => {
    annotate('owner', 'search-platform');
    annotate('severity', 'blocker');
    annotate('reviewed', '2026-05-12');
  });

  test('search box on main page accepts query input', async ({ page }) => {
    await page.goto('/wiki/Main_Page');
    const searchInput = page.getByRole('searchbox', { name: /search/i }).first();
    await searchInput.fill('Albert Einstein');
    await expect(searchInput).toHaveValue('Albert Einstein');
  });

  test('search submits and shows results page', async ({ page }) => {
    await page.goto('/wiki/Main_Page');
    const searchInput = page.getByRole('searchbox', { name: /search/i }).first();
    await searchInput.fill('quantum entanglement');
    await searchInput.press('Enter');
    await page.waitForURL(/Quantum_entanglement|Special:Search/);
    // Either Wikipedia routed us straight to the article (exact match) or to
    // the results page — both are valid happy paths for this query.
    await expect(page).toHaveTitle(/quantum entanglement/i);
  });

  test('results page heading echoes the query', async ({ page }) => {
    await page.goto('/wiki/Special:Search?search=transistor+history&fulltext=1');
    await expect(page.getByRole('heading', { name: /transistor history/i })).toBeVisible();
  });
});

/**
 * Autocomplete is naturally a bit flaky in cross-browser CI — it fires
 * an XHR and renders results when the response arrives, and slow network
 * runs can race past the dropdown timeout. Tagged `@flaky-watch` so the
 * Brittle dashboard's Flaky Watch panel earns its keep on the demo.
 */
test.describe('search autocomplete', { tag: ['@smoke', '@flaky-watch'] }, () => {
  test.beforeEach(() => {
    annotate('owner', 'search-platform');
    annotate('severity', 'high');
    annotate('issue', 'WIKI-204');
    annotate('doc', 'https://www.mediawiki.org/wiki/Help:Searching');
  });

  test('suggestions dropdown appears as the user types', async ({ page }) => {
    await page.goto('/wiki/Main_Page');
    const searchInput = page.getByRole('searchbox', { name: /search/i }).first();
    await searchInput.click();
    // Type letter-by-letter to give the autocomplete xhr time. Intentionally
    // no explicit waitForResponse — see tag.
    for (const ch of 'einst') {
      await searchInput.pressSequentially(ch, { delay: 80 });
    }
    const suggestions = page.locator('.cdx-typeahead-search__suggestions, .suggestions');
    await expect(suggestions.first()).toBeVisible({ timeout: 5_000 });
  });
});
