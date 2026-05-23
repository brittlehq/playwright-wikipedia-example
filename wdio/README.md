# WebdriverIO + Brittle — example project

Runnable WDIO 9 suite that streams every result to a [Brittle](https://brittle.dev) hub via [`@brittlehq/wdio-reporter`](https://www.npmjs.com/package/@brittlehq/wdio-reporter). Headless Chromium, Mocha framework, ~6 tests covering unit + browser assertions.

This folder is self-contained — fork it, drop in your own tests, point at your hub.

## Prerequisites

- Node.js 20+
- A Brittle hub running somewhere — either via the root-level [`docker-compose.yml`](../docker-compose.yml) or the hosted demo at `app.brittle.dev`
- Chrome / Chromium installed locally (for the headless test runner)

## Install + configure

```bash
pnpm install
cp .env.example .env
```

Edit `.env`:

```
BRITTLE_URL=http://localhost:3100   # or https://app.brittle.dev
BRITTLE_TOKEN=brt_xxx               # from Project → Settings → Tokens
```

## Run

```bash
pnpm test
```

You should see Mocha output + a Brittle run URL printed at the end. Open the dashboard to see:
- Per-test status with WebDriver BiDi command logs
- Optional failure screenshots (enabled by default in this example)

## How it's wired

The only Brittle-specific lines are in `wdio.conf.ts`:

```ts
import BrittleReporter from '@brittlehq/wdio-reporter';

const BRITTLE_URL = process.env['BRITTLE_URL'] ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env['BRITTLE_TOKEN'];
if (!BRITTLE_TOKEN) throw new Error('BRITTLE_TOKEN is required');

export const config: Options.Testrunner = {
  reporters: [
    'spec',
    [
      BrittleReporter,
      {
        url: BRITTLE_URL,
        token: BRITTLE_TOKEN,
        runName: process.env['CI_BUILD_ID'],
        tags: ['wdio'],
        screenshotOnFailure: true,
      },
    ],
  ],
  // ...standard WDIO config
};
```

The reporter subscribes to WebDriver BiDi events on the worker's `browser` instance directly — no separate `services:` entry needed.

## Reporter options

```ts
{
  url?: string;                  // defaults to process.env.BRITTLE_URL
  token?: string;                // defaults to process.env.BRITTLE_TOKEN
  runName?: string;              // groups parallel workers into one Run row
  target?: string;               // 'prod' / 'staging' / app version label
  tags?: string[];               // e.g. ['nightly', 'smoke']
  screenshotOnFailure?: boolean; // capture browser.takeScreenshot() on failure
  // Explicit git overrides — set when CI env is more reliable than `git`
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
  prUrl?: string;
}
```

Git context (branch, commit, PR) auto-detected from the working tree.

## Forking

Copy the whole folder. The only file you'll want to edit is `wdio.conf.ts` — point `specs:` at your own test directory, adjust capabilities for your browser matrix, you're done.

See the [root README](../README.md) for the cross-reporter overview and token creation walkthrough.
