import { Page } from '@playwright/test';

export class NavBar {
  constructor(private page: Page) {}

  private cartLink = () => this.page.getByRole('link', { name: 'Cart' });
  private logoutLink = () => this.page.getByRole('link', { name: 'Logout' });
  private loggedInAsText = () => this.page.getByText(/Logged in as/);

  async goToCart() {
    await this.cartLink().click();
  }

  async logout() {
    await this.logoutLink().click();
  }

  async getLoggedInUserText() {
    return this.loggedInAsText().textContent();
  }
}
