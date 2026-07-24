import { Page } from '@playwright/test';

export class SignupPage {
  constructor(private page: Page) {}

  private nameInput = () => this.page.getByPlaceholder('Name');
  private emailInput = () => this.page.getByPlaceholder('Email Address');
  private signupButton = () => this.page.getByRole('button', { name: 'Signup' });

  async signup(name: string, email: string) {
    await this.nameInput().fill(name);
    await this.emailInput().fill(email);
    await this.signupButton().click();
  }
}
