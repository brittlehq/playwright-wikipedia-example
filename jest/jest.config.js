require('dotenv').config();

const BRITTLE_URL = process.env.BRITTLE_URL ?? 'http://localhost:3100';
const BRITTLE_TOKEN = process.env.BRITTLE_TOKEN;
if (!BRITTLE_TOKEN) {
  throw new Error(
    'BRITTLE_TOKEN is required. Copy .env.example to .env and fill in a token from your Brittle dashboard (Project → Settings → Tokens).',
  );
}

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
  },
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
};
