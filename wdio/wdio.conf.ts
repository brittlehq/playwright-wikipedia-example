import dotenv from 'dotenv';
import type { Options } from '@wdio/types';
import BrittleReporter from '@brittlehq/wdio-reporter';

// Explicit dotenv.config() call rather than `import 'dotenv/config'` —
// some loaders (Playwright's esbuild, certain Vitest configurations)
// drop side-effect-only imports. The explicit form survives them all.
dotenv.config();

// Resolved from env so the sample can be copy-pasted into someone else's
// project without editing source. See .env.example for the variables.
const BRITTLE_URL = process.env['BRITTLE_URL'] ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env['BRITTLE_TOKEN'];
if (!BRITTLE_TOKEN) {
  throw new Error(
    'BRITTLE_TOKEN is required. Copy .env.example to .env and fill in a token from your Brittle dashboard (Project → Settings → Tokens).',
  );
}

export const config: Options.Testrunner = {
  runner: 'local',
  specs: ['./test/**/*.spec.ts'],
  maxInstances: 1,

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
  ],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
  },

  // Keep the default waitFor* short so intentional failures surface quickly.
  waitforTimeout: 3000,

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

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: './tsconfig.json',
    },
  },
};
