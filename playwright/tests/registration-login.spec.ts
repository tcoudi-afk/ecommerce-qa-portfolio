import { test, expect } from '../fixtures/test';
import { SignupPage } from '../pages/SignupPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';
import { LoginPage } from '../pages/LoginPage';
import { NavBar } from '../pages/components/NavBar';

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
});
