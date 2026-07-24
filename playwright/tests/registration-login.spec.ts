import { test, expect } from '../fixtures/test';
import { SignupPage } from '../pages/SignupPage';
import { AccountInfoPage } from '../pages/AccountInfoPage';
import { LoginPage } from '../pages/LoginPage';
import { NavBar } from '../pages/components/NavBar';

test.describe('Registration & Login', () => {
  test('TC-LOGIN-002 - user can log in with valid credentials', async ({ page }) => {
    // --- Setup: create an account through the UI signup flow ---
    // Done via UI, not the createAccount API, even though automation-notes.md
    // generally prefers API setup. Reason: on this shared demo environment the API
    // returns HTTP 302 instead of JSON on ~40-60% of calls (see automation-notes.md).
    // A UI test's setup step failing because of unrelated API flakiness would be a
    // worse trade-off here than the extra setup time of going through the UI.
    const timestamp = Date.now();
    const name = `POM Tester ${timestamp}`;
    const email = `qa.pom.${timestamp}@test.com`;
    const password = 'Test1234!';

    const signupPage = new SignupPage(page);
    const accountInfoPage = new AccountInfoPage(page);
    const navBar = new NavBar(page);

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

    // Signup logs the user in automatically. TC-LOGIN-002 is specifically about the
    // login form, so log out first to get a clean starting point for the real test.
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
});
