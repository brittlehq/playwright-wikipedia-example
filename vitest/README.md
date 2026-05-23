# Vitest + Brittle — example project

Runnable Vitest unit-test suite that streams every result to a [Brittle](https://brittle.dev) hub via [`@brittlehq/vitest-reporter`](https://www.npmjs.com/package/@brittlehq/vitest-reporter). No browser involvement — fast Node runner, watch mode for dev, CI mode for ship.

This folder is self-contained — fork it, drop in your own tests, point at your hub.

## Prerequisites

- Node.js 20+
- A Brittle hub running somewhere — either via the root-level [`docker-compose.yml`](../docker-compose.yml) or the hosted demo at `app.brittle.dev`

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
pnpm test          # single CI-style run
pnpm test:watch    # watch mode for dev (still reports to Brittle)
```

You should see Vitest's default output + a Brittle run URL printed at the end. Open the dashboard to see per-test status, failure messages, and timing.

## How it's wired

The only Brittle-specific lines are in `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import BrittleReporter from '@brittlehq/vitest-reporter';

const BRITTLE_URL = process.env.BRITTLE_URL ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env.BRITTLE_TOKEN;
if (!BRITTLE_TOKEN) throw new Error('BRITTLE_TOKEN is required');

export default defineConfig({
  test: {
    reporters: [
      'default',
      new BrittleReporter({
        url: BRITTLE_URL,
        token: BRITTLE_TOKEN,
        runName: process.env.CI_BUILD_ID ?? `vitest-local-${Date.now()}`,
        tags: ['vitest'],
      }),
    ],
  },
});
```

## Reporter options

```ts
{
  url?: string;              // defaults to process.env.BRITTLE_URL
  token?: string;            // defaults to process.env.BRITTLE_TOKEN
  runName?: string;          // groups parallel workers into one Run row
  target?: string;           // 'prod' / 'staging' / app version label
  tags?: string[];           // e.g. ['unit', 'nightly']
  // Explicit git overrides
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
  prUrl?: string;
}
```

Git context auto-detected from the working tree.

## Forking

Copy the folder. Edit `vitest.config.ts` to point at your own test paths. The reporter entry stays exactly as-is — note that Vitest expects a `new BrittleReporter(...)` instance, not a `[name, opts]` tuple like Jest/Playwright do.

See the [root README](../README.md) for the cross-reporter overview and token creation walkthrough.
