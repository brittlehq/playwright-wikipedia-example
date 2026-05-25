import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

// Side-effect-only `import 'dotenv/config'` gets dropped by Playwright's
// esbuild-based config loader (it tree-shakes unused side-effect imports
// in some 1.4x versions). Calling dotenv.config() explicitly survives any
// transpilation pass and runs before the env-var checks below.
dotenv.config();

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
 *   BRITTLE_URL    — Brittle hub base URL (e.g. https://app.brittle.dev)
 *   BRITTLE_TOKEN  — Service token from Project → Settings → Tokens
 *
 * Optional env vars:
 *   BRITTLE_RUN_NAME  — shared across all parallel browser legs to collapse
 *                       them into one Run on the dashboard (auto-set in CI)
 *   BRITTLE_BRANCH    — override the auto-detected git branch. Leave unset
 *                       and the reporter reads `git rev-parse --abbrev-ref HEAD`
 *                       (and CI env vars in CI). Only set this when the
 *                       detected value is wrong, e.g. shallow checkouts.
 *   BRITTLE_RUN_TAGS  — comma-separated run-level tags (e.g. "nightly,smoke")
 */

const BRITTLE_URL = process.env.BRITTLE_URL ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env.BRITTLE_TOKEN;
if (!BRITTLE_TOKEN) {
  throw new Error(
    'BRITTLE_TOKEN is required. Copy .env.example to .env and fill in a token from your Brittle dashboard (Project → Settings → Tokens).',
  );
}

// All parallel browser workers share the same runName so the reporter
// collapses them into a single Run on the dashboard. In CI this is set
// to the workflow run ID; locally it defaults to today's date so same-day
// runs merge naturally.
const runName =
  process.env.BRITTLE_RUN_NAME ?? `Wikipedia · ${new Date().toISOString()}`;
const branchOverride = process.env.BRITTLE_BRANCH;
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
        url: BRITTLE_URL,
        token: BRITTLE_TOKEN,
        runName,
        tags: runTags,
        // Branch is auto-detected from `git rev-parse --abbrev-ref HEAD`
        // (and from CI env in CI). Only forward an override when the
        // operator explicitly set BRITTLE_BRANCH.
        ...(branchOverride ? { runMetadata: { branch: branchOverride } } : {}),
      },
    ],
  ],
  use: {
    baseURL: 'https://en.wikipedia.org',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['iPhone 14'] } },
  ],
});
