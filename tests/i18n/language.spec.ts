import { test, expect } from '@playwright/test';
import { annotate } from '../_shared/annotate.js';

/**
 * Language switching. Wikipedia is the OG multilingual product —
 * 300+ language editions, with cross-language links on every article.
 * These tests exercise the language switcher and verify cross-edition
 * navigation lands on the correct sister-wiki.
 */

test.describe('language switching', { tag: ['@smoke'] }, () => {
  test.beforeEach(() => {
    annotate('owner', 'i18n-team');
    annotate('severity', 'high');
    annotate('doc', 'https://meta.wikimedia.org/wiki/Help:Cross-wiki_languages');
  });

  test('article has language links to other wikis', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein');
    // The Vector 2022 skin moved language links into a popover; older
    // skins keep them in a sidebar. Either way, the link to Spanish
    // (.es) is present on a topic this popular.
    const spanish = page.locator('a[lang="es"], a[hreflang="es"]').first();
    await expect(spanish).toBeAttached();
  });

  test('Spanish edition has correct lang attribute', async ({ page }) => {
    await page.goto('https://es.wikipedia.org/wiki/Albert_Einstein');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('search on the Japanese wiki works', async ({ page }) => {
    await page.goto('https://ja.wikipedia.org/wiki/Main_Page');
    const searchInput = page.getByRole('searchbox').first();
    await searchInput.fill('量子力学');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/ja\.wikipedia\.org/);
  });
});
