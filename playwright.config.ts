import { defineConfig, devices } from '@playwright/test';

// Read-only E2E tests against the LIVE GharBazar site.
// No logins, no orders, no product changes, no Firestore writes —
// these tests only read the public pages.
export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://adeel1508.github.io/gharbazar-website/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
