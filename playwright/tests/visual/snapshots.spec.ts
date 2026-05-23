import { test, expect } from '@playwright/test';
import { annotate } from '../_shared/annotate.js';

/**
 * Visual-regression snapshots against stable Wikipedia chrome.
 *
 * Wikipedia content rotates daily (Main Page especially), so we deliberately
 * snapshot small, durable surfaces — header logo, article chrome, footer —
 * with masks over any region that has live content. The point isn't to catch
 * Wikipedia changing; it's to demonstrate Brittle's pixel-diff workflow on a
 * real-world suite.
 *
 * Baselines live in `tests/visual/snapshots.spec.ts-snapshots/` alongside
 * this file. Update them with `pnpm exec playwright test --update-snapshots`
 * after intentional Wikipedia chrome redesigns.
 */

test.describe('visual regression — stable chrome', { tag: ['@visual', '@regression-suite'] }, () => {
  test.beforeEach(() => {
    annotate('owner', 'design-systems');
    annotate('severity', 'medium');
    annotate('reviewed', '2026-05-12');
    annotate('doc', 'https://playwright.dev/docs/test-snapshots');
  });

  // Mobile webkit project gets a different rendered shell (en.m.wikipedia.org)
  // so the snapshot baselines wouldn't transfer. Skip on mobile rather than
  // maintain a second baseline set we'd never look at.
  test.skip(({ isMobile }) => isMobile === true, 'Desktop chrome only');

  test('header logo + wordmark area', async ({ page }) => {
    await page.goto('/wiki/Albert_Einstein');
    // The Vector 2022 skin header is `.mw-page-container-inner > header`, but
    // it nests the search box (which has focus-state hover artefacts) and the
    // sign-in chip (text varies by viewport). Snapshot the logo cell only.
    const logo = page.locator('.mw-logo, .vector-header-start .mw-logo').first();
    await expect(logo).toHaveScreenshot('header-logo.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('article first-paint chrome (title + tabs)', async ({ page }) => {
    // Quadratic_formula is a math article — body content is LaTeX-rendered and
    // hasn't meaningfully changed in a decade. Safer baseline than a politics
    // / biography article.
    await page.goto('/wiki/Quadratic_formula');
    const titleArea = page.locator('#bodyContent, .mw-body').first();
    await expect(titleArea).toHaveScreenshot('article-body-chrome.png', {
      // Mask the dynamic bits: "last edited" footer timestamp + any banner
      // (fundraising, site notices) that MediaWiki occasionally injects.
      mask: [
        page.locator('#footer-info-lastmod'),
        page.locator('#siteNotice'),
        page.locator('.mw-dismissable-notice'),
        // Math rendering can shift a sub-pixel between MathML/SVG fallback;
        // mask the formula image specifically.
        page.locator('.mwe-math-element').first(),
      ],
      maxDiffPixelRatio: 0.02,
      fullPage: false,
    });
  });

  test('footer license + meta strip', async ({ page }) => {
    await page.goto('/wiki/Quadratic_formula');
    const footer = page.locator('#footer, .mw-footer').first();
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot('footer.png', {
      mask: [
        // "last edited 3 days ago" rotates constantly.
        page.locator('#footer-info-lastmod'),
        page.locator('#footer-info-viewcount'),
      ],
      maxDiffPixelRatio: 0.02,
    });
  });
});
