import { test, expect } from '@playwright/test';

/**
 * Responsive rendering checks. Wikipedia ships separate desktop /
 * mobile views — `en.wikipedia.org/wiki/...` for desktop and
 * `en.m.wikipedia.org/wiki/...` for mobile. The Playwright config's
 * webkit project uses iPhone 14 device emulation so this picks up the
 * mobile-rendered shell automatically.
 */

test.describe('mobile rendering', { tag: ['@visual', '@mobile'] }, () => {
  test('main page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/wiki/Main_Page');
    // No horizontal scrollbar should appear at the configured viewport.
    const horizontallyOverflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(horizontallyOverflows).toBe(false);
  });

  test('article page hides desktop sidebar on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Sidebar visibility test only meaningful in mobile viewport');
    await page.goto('/wiki/Albert_Einstein');
    // Vector 2022 main-menu pinned sidebar — visible on desktop, collapsed
    // / hidden on mobile.
    const sidebar = page.locator('#mw-panel, .vector-main-menu').first();
    const visible = await sidebar.isVisible().catch(() => false);
    expect(visible).toBe(false);
  });
});
