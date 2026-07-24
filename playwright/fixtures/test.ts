import { test as base } from '@playwright/test';

/**
 * Domény třetích stran blokované ve všech testech.
 *
 * fundingchoicesmessages.google.com = Google Funding Choices (CMP pro souhlas
 * s cookies). AutomationExercise si ho natahuje kvůli reklamám a CMP vykreslí
 * overlay <div class="fc-consent-root">, který zachytává pointer eventy a
 * blokuje kliky na prvky pod ním (typicky signup/login tlačítka).
 *
 * CMP není součástí SUT ani ve scope portfolia (viz docs/test-strategy.md).
 * Blokace na síťové úrovni je deterministická — banner se nikdy nevykreslí,
 * takže testy nemusí obsahovat podmíněné "když je vidět, zavři ho" kroky,
 * které samy o sobě zavádějí race condition.
 *
 * Trade-off: testy tím běží v jiném prostředí než reálný uživatel. Kdyby byl
 * consent flow business-critical, patřil by mu vlastní dedikovaný test —
 * ne tichá blokace napříč celou sadou.
 */
const BLOCKED_URL_PATTERNS = [
  '**://fundingchoicesmessages.google.com/**',
];

type Fixtures = {
  blockThirdPartyOverlays: void;
};

export const test = base.extend<Fixtures>({
  blockThirdPartyOverlays: [
    async ({ context }, use) => {
      for (const pattern of BLOCKED_URL_PATTERNS) {
        await context.route(pattern, (route) => route.abort());
      }

      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
