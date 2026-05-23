import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import BrittleReporter from '@brittlehq/vitest-reporter';

// Explicit dotenv.config() rather than `import 'dotenv/config'` — some
// loaders drop side-effect-only imports during transpilation; the
// explicit call survives any pass.
dotenv.config();

const BRITTLE_URL = process.env.BRITTLE_URL ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env.BRITTLE_TOKEN;
if (!BRITTLE_TOKEN) {
  throw new Error(
    'BRITTLE_TOKEN is required. Copy .env.example to .env and fill in a token from your Brittle dashboard (Project → Settings → Tokens).',
  );
}

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
