// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  timeout: 100 * 1000,
 
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is left */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 0 : 0,

  /* Opt out of parallel tests on CI */
  workers:1,

  /* Reporter: HTML + list */
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  /* Shared settings for all projects */
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 55 * 1000,

    /* Base URL from .env */
    baseURL: process.env.BASE_URL ,

    /* Save video for each test */
    video: 'on',

    /* Save screenshots on failure */
    screenshot: 'only-on-failure',

    /* Traces for debugging */
    trace: 'retain-on-failure',

    /* Output directory for artifacts */
    outputDir: 'test-results/',
  },

  /* Browser projects */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
    //   {
    //     name: 'firefox',
    //     use: { ...devices['Desktop Firefox'] },
    //   },
    //   {
    //     name: 'webkit',
    //     use: { ...devices['Desktop Safari'] },
    //   },
  ],

  /* Optional: run local dev server before tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
