import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private emailInput = () => this.page.getByPlaceholder('Email Address');
  private passwordInput = () => this.page.getByPlaceholder('Password');
  private loginButton = () => this.page.getByRole('button', { name: 'Login' });

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }
}
