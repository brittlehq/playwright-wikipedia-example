# Jest + Brittle — example project

Runnable Jest unit-test suite that streams every result to a [Brittle](https://brittle.dev) hub via [`@brittlehq/jest-reporter`](https://www.npmjs.com/package/@brittlehq/jest-reporter). No browser involvement — this is the "any Node project" reporter.

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
pnpm test
```

You should see Jest's default output + a Brittle run URL printed at the end. Open the dashboard to see per-test status with failure stacks, expected/actual values, and timing.

## How it's wired

The only Brittle-specific lines are in `jest.config.js`:

```js
const BRITTLE_URL = process.env.BRITTLE_URL ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env.BRITTLE_TOKEN;
if (!BRITTLE_TOKEN) throw new Error('BRITTLE_TOKEN is required');

module.exports = {
  reporters: [
    'default',
    [
      '@brittlehq/jest-reporter',
      {
        url: BRITTLE_URL,
        token: BRITTLE_TOKEN,
        runName: process.env.CI_BUILD_ID ?? `jest-local-${Date.now()}`,
        tags: ['jest'],
      },
    ],
  ],
  // ...standard Jest config
};
```

The reporter streams one batch per spec file as each completes — the dashboard fills in progressively, you don't have to wait for the whole suite.

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

Copy the folder. Edit `jest.config.js` to point at your own `testMatch` / `roots`. The reporter entry stays exactly as-is.

See the [root README](../README.md) for the cross-reporter overview and token creation walkthrough.
