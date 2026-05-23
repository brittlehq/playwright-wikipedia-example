# Playwright Wikipedia Example

A production-ready Playwright test suite that runs daily against [en.wikipedia.org](https://en.wikipedia.org) across three browsers. It demonstrates a complete integration with **[@brittlehq/playwright-reporter](https://www.npmjs.com/package/@brittlehq/playwright-reporter)** — every run lands on the live dashboard at [app.brittle.dev](https://app.brittle.dev).

The suite is also designed to be forked as a starting point for any Playwright project that wants Brittle reporting.

## What's in the suite

```
tests/
  search/    — search box, results page, autocomplete (@smoke @p0)
  article/   — title, infobox, references, a11y skip-link, TOC anchors (@smoke @a11y)
  history/   — revision history, old-version view, user contributions (@regression-suite)
  i18n/      — language switcher, cross-edition navigation (@smoke)
  profile/   — User: namespace pages (@smoke)
  talk/      — Talk: namespace pages (@regression-suite)
  visual/    — pixel-diff snapshots of stable chrome; mobile viewport checks (@visual)
```

### Tags

| Tag | Meaning |
|---|---|
| `@smoke` | Must pass every run — entry-point health check |
| `@p0` | Highest priority (search box) |
| `@regression-suite` | Broader sweep; paired with the nightly schedule |
| `@flaky-watch` | Known edge-of-flake; deliberately kept to give the dashboard's Flaky Watch panel real signal |
| `@a11y` | Accessibility-adjacent checks |
| `@visual` | Pixel-diff snapshot tests |
| `@mobile` | Mobile viewport / device emulation |

Filter by tag with `--grep`:

```bash
npx playwright test --grep @smoke
npx playwright test --grep @visual
```

## Getting started

### Prerequisites

- Node.js 18+
- A Brittle hub (sign up at [app.brittle.dev](https://app.brittle.dev) or [self-host](https://github.com/brittlehq/brittle))

### Install

```bash
git clone https://github.com/brittlehq/playwright-wikipedia-example.git
cd playwright-wikipedia-example
npm install
npx playwright install --with-deps   # one-time browser download
```

### Configure

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|---|---|
| `BRITTLE_URL` | Your hub URL — `https://app.brittle.dev` or `http://localhost:3100` |
| `BRITTLE_TOKEN` | Service token from **Project → Settings → Tokens → New token** |

### Run

```bash
# Run all three browsers (.env is auto-loaded via dotenv)
npm test

# Single browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Filtered by tag
npx playwright test --grep @smoke
```

Open the local Playwright report:

```bash
npm run report
```

## How the Brittle integration works

The only Brittle-specific line is the reporter entry in `playwright.config.ts`:

```ts
reporters: [
  ['@brittlehq/playwright-reporter', {
    url: process.env.BRITTLE_URL,
    token: process.env.BRITTLE_TOKEN,
    runName,
  }],
]
```

This uses the **reported-origin** flow — Playwright runs browsers locally and the reporter posts results to the hub after each test. No Brittle grid node required; it works with any existing Playwright suite.

**Run collapsing:** all parallel browser workers share the same `runName`, so the reporter converges them into a single Run on the dashboard instead of creating three separate ones. In CI this is set to the workflow run ID; locally it defaults to today's date.

## CI

The included workflow at `.github/workflows/nightly.yml` runs the full suite daily at 03:00 UTC across all three browsers.

**Required repository secrets:**

| Secret | Value |
|---|---|
| `BRITTLE_URL` | `https://app.brittle.dev` |
| `BRITTLE_TOKEN` | Service token from your Brittle project |

The workflow can also be triggered manually from the Actions tab with optional browser and tag filters.

## Visual regression baselines

Snapshot baselines live in `tests/visual/snapshots.spec.ts-snapshots/`. They target stable, low-churn Wikipedia chrome (header logo, article shell, footer) with masks over any region that rotates (timestamps, banners).

Update baselines after intentional UI changes:

```bash
npx playwright test --update-snapshots tests/visual/snapshots.spec.ts
```

## Forking for your own suite

1. Add the reporter to your project:
   ```bash
   npm install @brittlehq/playwright-reporter
   ```

2. Register it in `playwright.config.ts`:
   ```ts
   import { defineConfig } from '@playwright/test';

   export default defineConfig({
     reporter: [
       ['@brittlehq/playwright-reporter', {
         url: process.env.BRITTLE_URL,
         token: process.env.BRITTLE_TOKEN,
         runName: process.env.BRITTLE_RUN_NAME,
       }],
     ],
   });
   ```

3. Set `BRITTLE_URL` and `BRITTLE_TOKEN` in your CI environment.

That's it. The reporter picks up tags, describe blocks, retries, screenshots, videos, and traces automatically — no further wiring needed.

## License

MIT
