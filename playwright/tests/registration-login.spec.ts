import { test, expect } from '../fixtures/test';
import { SignupPage } from '../pages/SignupPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';
import { LoginPage } from '../pages/LoginPage';
import { NavBar } from '../pages/components/NavBar';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Registration & Login', () => {
  test('TC-LOGIN-001 - user can register with valid data', async ({ page }) => {
    const timestamp = Date.now();
    const name = `POM Register ${timestamp}`;
    const email = `qa.register.${timestamp}@test.com`;

    const signupPage = new SignupPage(page);
    const accountInfoPage = new AccountInfoPage(page);
    const navBar = new NavBar(page);

    await page.goto('/login');
    await signupPage.signup(name, email);
    await accountInfoPage.fillAccountInfo({
      password: 'Test1234!',
      firstName: 'POM',
      lastName: 'Register',
      address1: 'Test Street 1',
      state: 'Praha',
      city: 'Praha',
      zipcode: '10000',
      mobileNumber: '123456789',
    });
    await accountInfoPage.createAccount();

    // Expected Result (TC-LOGIN-001): "Account Created!" confirmation is displayed.
    await expect(accountInfoPage.accountCreatedHeading()).toBeVisible();

    await accountInfoPage.continueAfterAccountCreated();

    // Expected Result: user is logged in; header shows the user's name.
    await expect(page).toHaveURL('/');
    const loggedInText = await navBar.getLoggedInUserText();
    expect(loggedInText).toContain(`Logged in as ${name}`);
  });

  test('TC-LOGIN-002 - user can log in with valid credentials', async ({ page, registeredUser }) => {
    const { name, email, password } = registeredUser;
    const navBar = new NavBar(page);

    // registeredUser fixture leaves the browser logged in (that's how the
    // app behaves right after signup). TC-LOGIN-002 is specifically about
    // the login form, so log out first to get a clean starting point.
    await navBar.logout();

    // --- TC-LOGIN-002: Successful login with valid credentials ---
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    // Expected Result (per docs/test-cases/registration-login.md):
    // user is redirected to the home page; header shows "Logged in as {name}".
    await expect(page).toHaveURL('/');
    const loggedInText = await navBar.getLoggedInUserText();
    expect(loggedInText).toContain(`Logged in as ${name}`);
  });

  test('TC-LOGIN-008 - user can log out', async ({ page, registeredUser }) => {
    const navBar = new NavBar(page);

    // registeredUser fixture leaves the browser logged in.
    await navBar.logout();

    await expect(page).toHaveURL('/login');
    await expect(navBar.loggedInAsText()).toBeHidden();

    // Logged-out state must persist on navigation, not just on /login.
    await navBar.goToCart();
    await expect(navBar.loggedInAsText()).toBeHidden();
  });

  test('TC-LOGIN-004 - login with an incorrect password is rejected', async ({ page, registeredUser }) => {
    const { email } = registeredUser;
    const navBar = new NavBar(page);

    // registeredUser fixture leaves the browser logged in; this test needs
    // a logged-out starting point to submit the login form.
    await navBar.logout();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, 'WrongPassword123!');

    // Expected Result (docs/test-cases/registration-login.md): error shown,
    // user remains logged out. Both are asserted explicitly per
    // docs/automation-notes.md — checking only the error text would miss a
    // false positive where the app somehow still logs the user in.
    await expect(loginPage.errorMessage()).toBeVisible();
    await expect(navBar.loggedInAsText()).toBeHidden();
  });

  test('TC-LOGIN-003 - registration with an already-registered email is rejected', async ({ page, registeredUser }) => {
    const { email } = registeredUser;
    const navBar = new NavBar(page);

    // registeredUser fixture leaves the browser logged in; go through the
    // same logged-out starting point as the other negative-path tests.
    await navBar.logout();

    const signupPage = new SignupPage(page);
    await page.goto('/login');
    await signupPage.signup('Duplicate Attempt', email);

    // Expected Result (docs/test-cases/registration-login.md): error shown;
    // no new account is created. NOT checked via URL — confirmed live that
    // this app redirects to /signup on both outcomes, so URL can't
    // distinguish success from rejection here. Absence of the account-info
    // form heading is the actual proxy for "no new account."
    await expect(signupPage.errorMessage()).toBeVisible();
    await expect(new AccountInfoPage(page).accountInfoHeading()).toBeHidden();
  });

  // --- TC-LOGIN-006: Email format validation ---
  // Confirmed baseline (docs/automation-notes.md, 2026-07-24): all four values are
  // rejected by the browser's native type="email" + required constraint validation
  // before the form ever reaches the server - so there is no app-level error to
  // assert on here, only the absence of a submit.
  const invalidEmails = ['test', 'test@', 'test@@test.com', ''];
  for (const value of invalidEmails) {
    test(`TC-LOGIN-006 - email "${value || '(empty)'}" is rejected client-side, form not submitted`, async ({ page }) => {
      await page.goto('/login');
      const emailInput = page.getByTestId('signup-email');
      await page.getByTestId('signup-name').fill('QA Email Format');
      await emailInput.fill(value);
      await page.getByTestId('signup-button').click();

      // Native constraint validation blocks the submit - still on /login,
      // the account-info form never appears.
      await expect(page).toHaveURL(/\/login$/);
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });
  }

  // --- TC-LOGIN-007: Password field boundary values ---
  // Confirmed baseline (docs/automation-notes.md, 2026-07-24): only `required` is
  // enforced client-side; the server enforces no min/max length at all.
  test('TC-LOGIN-007 - empty password is blocked client-side, account not created', async ({ page }) => {
    const timestamp = Date.now();
    const email = `qa.pwempty.${timestamp}@test.com`;
    const signupPage = new SignupPage(page);
    const accountInfoPage = new AccountInfoPage(page);

    await page.goto('/login');
    await signupPage.signup('QA Pw Empty', email);

    // Leave password empty, fill everything else, try to submit.
    await page.locator('#first_name').fill('QA');
    await page.locator('#last_name').fill('PwEmpty');
    await page.locator('#address1').fill('Test Street 1');
    await page.locator('#state').fill('Praha');
    await page.locator('#city').fill('Praha');
    await page.locator('#zipcode').fill('10000');
    await page.locator('#mobile_number').fill('123456789');
    await accountInfoPage.createAccount();

    // Native `required` blocks the submit - still on the account-info form.
    await expect(accountInfoPage.accountInfoHeading()).toBeVisible();
  });

  const acceptedPasswords = [
    { label: 'single-character', value: 'a' },
    { label: '220-character', value: 'a'.repeat(220) },
  ];
  for (const { label, value } of acceptedPasswords) {
    test(`TC-LOGIN-007 - ${label} password is accepted, account created`, async ({ page }) => {
      const timestamp = Date.now();
      const email = `qa.pwboundary.${timestamp}@test.com`;
      const signupPage = new SignupPage(page);
      const accountInfoPage = new AccountInfoPage(page);

      await page.goto('/login');
      await signupPage.signup('QA Pw Boundary', email);
      await accountInfoPage.fillAccountInfo({
        password: value,
        firstName: 'QA',
        lastName: 'PwBoundary',
        address1: 'Test Street 1',
        state: 'Praha',
        city: 'Praha',
        zipcode: '10000',
        mobileNumber: '123456789',
      });
      await accountInfoPage.createAccount();

      // No server-side length limit either direction - confirmed baseline.
      await expect(accountInfoPage.accountCreatedHeading()).toBeVisible();
    });
  }

  // --- TC-LOGIN-009: Double-submit on "Create Account" ---
  test('TC-LOGIN-009 - double-clicking Create Account creates exactly one account', async ({ page }) => {
    const timestamp = Date.now();
    const email = `qa.dblsubmit.${timestamp}@test.com`;
    const signupPage = new SignupPage(page);
    const accountInfoPage = new AccountInfoPage(page);

    await page.goto('/login');
    await signupPage.signup('QA Double Submit', email);
    await accountInfoPage.fillAccountInfo({
      password: 'Test1234!',
      firstName: 'QA',
      lastName: 'DblSubmit',
      address1: 'Test Street 1',
      state: 'Praha',
      city: 'Praha',
      zipcode: '10000',
      mobileNumber: '123456789',
    });

    let signupResponseCount = 0;
    page.on('response', (res) => {
      if (res.url().endsWith('/signup')) signupResponseCount++;
    });

    // locator.click() waits for actionability, which can't represent a real
    // rapid double-click (the second call ends up waiting for a button that
    // navigation just removed). Two native clicks dispatched synchronously
    // inside one evaluate() is what actually reproduces it - confirmed
    // approach from the exploration script, see docs/automation-notes.md.
    await page.evaluate(() => {
      const btn = document.querySelector('[data-qa="create-account"]') as HTMLButtonElement;
      btn.click();
      btn.click();
    });

    await expect(accountInfoPage.accountCreatedHeading()).toBeVisible();
    expect(signupResponseCount).toBe(1);
  });

  // --- TC-LOGIN-005: Session drops during an active purchase ---
  // Confirmed baseline (docs/automation-notes.md, 2026-07-24; BUG-002): the app does
  // NOT redirect to login on session drop. Checkout renders directly with a silently
  // empty cart instead. This test documents that actual (buggy) behaviour, not the
  // originally-assumed one - see docs/bug-reports/session-drop-silent-empty-checkout.md.
  test('TC-LOGIN-005 - session drop mid-purchase silently empties checkout instead of prompting re-auth', async ({
    page,
    context,
    registeredUser,
  }) => {
    const navBar = new NavBar(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await productsPage.goto();
    await productsPage.addFirstProductToCart();
    await cartPage.goto();
    await expect(cartPage.getItemQuantity()).resolves.toContain('1');

    // Simulate the session dropping mid-purchase.
    await context.clearCookies();

    await cartPage.proceedToCheckout();

    // BUG-002: no redirect to /login happens.
    await expect(page).toHaveURL(/\/checkout$/);
    // Navbar reflects the logged-out state...
    await expect(navBar.loggedInAsText()).toBeHidden();
    // ...but the checkout page itself gives no explicit warning: it just
    // renders with an empty order instead of the item added above.
    await expect(checkoutPage.orderItemRows()).toHaveCount(0);
    await expect(page.getByText('Rs. 0')).toBeVisible();
  });

  // --- TC-LOGIN-010: Session state across concurrent tabs ---
  test('TC-LOGIN-010 - logging out in one tab is reflected in another after reload', async ({
    page,
    context,
    registeredUser,
  }) => {
    const navBarTabA = new NavBar(page);

    // Tab B: same browser context, so it shares the session cookie set up by
    // the registeredUser fixture on Tab A.
    const pageB = await context.newPage();
    await pageB.goto('/');
    const navBarTabB = new NavBar(pageB);
    await expect(navBarTabB.loggedInAsText()).toContainText(registeredUser.name);

    // Logout on Tab A.
    await navBarTabA.logout();

    // Tab B hasn't reloaded yet - the point of this test is what happens
    // once it does.
    await pageB.reload();
    await expect(navBarTabB.loggedInAsText()).toBeHidden();

    await pageB.close();
  });
});
