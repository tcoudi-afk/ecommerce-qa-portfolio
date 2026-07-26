import { test as base } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';

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
 *
 * Rozšířeno 2026-07-26 o pagead2.googlesyndication.com a *.doubleclick.net
 * (Google reklamní síť) - původně blokováno jen v throwaway exploračních
 * skriptech, ne tady, což způsobilo dva reálné CI selhány (konzistentně 3/3
 * pokusů, ne flaky): reklamní text unikl do `getProductNames()`
 * (TC-SEARCH-005) a reklamní `POST /pagead/ping` prohodil network-level
 * assertion o tom, že žádný POST nefiruje při reloadu (TC-CHECKOUT-006).
 */
const BLOCKED_URL_PATTERNS = [
  '**://fundingchoicesmessages.google.com/**',
  '**://pagead2.googlesyndication.com/**',
  '**://*.doubleclick.net/**',
];

/**
 * Data účtu vytvořeného fixture `registeredUser`. Heslo je součástí, protože
 * ho testy potřebují zpátky pro přihlášení (TC-LOGIN-002, TC-LOGIN-004) —
 * appka samotná ho po vytvoření účtu nikam nevrací, takže jinak by nebylo
 * odkud ho vzít.
 */
type RegisteredUser = {
  name: string;
  email: string;
  password: string;
};

type Fixtures = {
  blockThirdPartyOverlays: void;
  registeredUser: RegisteredUser;
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

  /**
   * Vytvoří nový účet přes UI signup flow a testu vrátí jeho přihlašovací
   * údaje. Narozdíl od `blockThirdPartyOverlays` NENÍ `auto: true` — spustí
   * se jen v testech, které si o `registeredUser` řeknou destrukturováním
   * (`{ page, registeredUser }`), protože TC-LOGIN-001 testuje přesně tenhle
   * flow a nesmí ho dostat „zdarma“ jako cizí setup.
   *
   * Přes UI, ne přes createAccount API — stejný důvod jako v
   * docs/automation-notes.md: ~40-60% HTTP 302 rate by dělal setup flaky
   * z důvodu, který nemá nic společného s testovanou funkcionalitou.
   *
   * Po doběhnutí je uživatel přihlášený (appka po registraci loguje
   * automaticky) — testy, které potřebují odhlášený stav (TC-LOGIN-002,
   * TC-LOGIN-004), si musí zavolat navBar.logout() samy na začátku těla
   * testu, fixture to za ně neřeší.
   */
  registeredUser: async ({ page }, use) => {
    const timestamp = Date.now();
    const name = `POM Tester ${timestamp}`;
    const email = `qa.pom.${timestamp}@test.com`;
    const password = 'Test1234!';

    const signupPage = new SignupPage(page);
    const accountInfoPage = new AccountInfoPage(page);

    await page.goto('/login');
    await signupPage.signup(name, email);
    await accountInfoPage.fillAccountInfo({
      password,
      firstName: 'POM',
      lastName: 'Tester',
      address1: 'Test Street 1',
      state: 'Praha',
      city: 'Praha',
      zipcode: '10000',
      mobileNumber: '123456789',
    });
    await accountInfoPage.createAccount();
    await accountInfoPage.continueAfterAccountCreated();

    await use({ name, email, password });
  },
});

export { expect } from '@playwright/test';
