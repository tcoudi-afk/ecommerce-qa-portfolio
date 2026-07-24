import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // getByPlaceholder('Email Address') by matchoval i signup-email pole na téže
  // stránce (oba formuláře, login i signup, jsou na /login) → strict mode violation.
  // data-qa je tu jednoznačný a appka ho pro přesně tenhle účel poskytuje.
  private emailInput = () => this.page.getByTestId('login-email');
  private passwordInput = () => this.page.getByTestId('login-password');
  private loginButton = () => this.page.getByTestId('login-button');

  // No data-qa on this element on the real site — text-based locator is the
  // only reliable option. The exact string is a confirmed baseline (see
  // docs/test-cases/registration-login.md, TC-LOGIN-004).
  errorMessage = () => this.page.getByText('Your email or password is incorrect!');

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }
}
