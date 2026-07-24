import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  // AutomationExercise používá data-qa místo výchozího data-testid, takže
  // getByTestId() musí vědět, na jaký atribut se ptát. Patří to do `use`,
  // ne na top-level defineConfig() — tam se to tiše ignoruje a spadne to
  // zpět na výchozí 'data-testid' bez jakékoliv chyby při startu.
  use: {
    testIdAttribute: 'data-qa',
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
