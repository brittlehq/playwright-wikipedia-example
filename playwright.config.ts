import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Wikipedia example suite.
 *
 * Uses the @brittlehq/playwright-reporter "reported-origin" flow: Playwright
 * spawns browsers locally (or in CI), runs tests against wikipedia.org, and
 * the reporter mirrors every result to the Brittle hub for the dashboard to
 * render. No Brittle grid involvement — any existing Playwright suite can
 * add Brittle this way with a single reporter entry.
 *
 * Required env vars:
 *   BRITTLE_HUB_URL  — Brittle hub base URL (e.g. https://app.brittle.dev)
 *   BRITTLE_TOKEN    — Service token from Project → Settings → Tokens
 *
 * Optional env vars:
 *   BRITTLE_RUN_NAME  — shared across all parallel browser legs to collapse
 *                       them into one Run on the dashboard (auto-set in CI)
 *   BRITTLE_BRANCH    — branch label; defaults to "main"
 *   BRITTLE_RUN_TAGS  — comma-separated run-level tags (e.g. "nightly,smoke")
 */

const HUB_URL = process.env.BRITTLE_HUB_URL ?? 'http://localhost:3100';
const TOKEN = process.env.BRITTLE_TOKEN;
if (!TOKEN) {
  throw new Error(
    'BRITTLE_TOKEN is required. Mint a service token in your Brittle project under Settings → Tokens and export it.',
  );
}

// All parallel browser workers share the same runName so the reporter
// collapses them into a single Run on the dashboard. In CI this is set
// to the workflow run ID; locally it defaults to today's date so same-day
// runs merge naturally.
const runName =
  process.env.BRITTLE_RUN_NAME ?? `Wikipedia · ${new Date().toISOString().slice(0, 10)}`;
const branch = process.env.BRITTLE_BRANCH ?? 'main';
const runTags = (process.env.BRITTLE_RUN_TAGS ?? 'nightly,wikipedia').split(',').filter(Boolean);

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: true,
  retries: 1,
  workers: process.env.CI ? 4 : 3,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      '@brittlehq/playwright-reporter',
      {
        url: HUB_URL,
        token: TOKEN,
        runName,
        tags: runTags,
        runMetadata: { branch },
      },
    ],
  ],
  use: {
    baseURL: 'https://en.wikipedia.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['iPhone 14'] } },
  ],
});
