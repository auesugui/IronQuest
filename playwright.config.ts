import { defineConfig, devices } from '@playwright/test';

// Mobile device viewports for testing
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14 Pro
const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Expo web compatibility
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: MOBILE_VIEWPORT,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  // No webServer - we start Expo manually for better control
});
