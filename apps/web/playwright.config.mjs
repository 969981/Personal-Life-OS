import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    serviceWorkers: 'allow'
  },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://127.0.0.1:4321/capture/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
