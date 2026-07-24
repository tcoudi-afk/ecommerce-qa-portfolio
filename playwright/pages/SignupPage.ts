import { Page } from '@playwright/test';

export class SignupPage {
  constructor(private page: Page) {}

  // Stejný důvod jako u LoginPage: getByPlaceholder('Email Address') na /login
  // matchuje i login-email pole na téže stránce → použitý data-qa místo placeholderu.
  private nameInput = () => this.page.getByTestId('signup-name');
  private emailInput = () => this.page.getByTestId('signup-email');
  private signupButton = () => this.page.getByTestId('signup-button');

  // Same reasoning as LoginPage.errorMessage: no data-qa on this element,
  // exact text confirmed in docs/test-cases/registration-login.md (TC-LOGIN-003).
  errorMessage = () => this.page.getByText('Email Address already exist!');

  async signup(name: string, email: string) {
    await this.nameInput().fill(name);
    await this.emailInput().fill(email);
    await this.signupButton().click();
  }
}
