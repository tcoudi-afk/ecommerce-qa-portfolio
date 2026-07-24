import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  // AutomationExercise používá data-qa místo výchozího data-testid,
  // takže getByTestId() musí vědět, na jaký atribut se ptát.
  testIdAttribute: 'data-qa',

  use: {
    baseURL: 'https://automationexercise.com',
    headless: isCI,
    trace: 'retain-on-first-failure',
  },

  // Cross-browser matrix je podle test-strategy.md timeboxed na Chromium.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
});
