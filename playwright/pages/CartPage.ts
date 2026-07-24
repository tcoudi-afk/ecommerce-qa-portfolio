import { Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  private proceedToCheckoutButton = () => this.page.locator('.check_out');
  private deleteItemLinks = () => this.page.locator('.cart_quantity_delete');
  private quantityCells = () => this.page.locator('.cart_quantity');

  async goto() {
    await this.page.goto('/view_cart');
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton().click();
  }

  async deleteFirstItem() {
    await this.deleteItemLinks().first().click();
  }

  async getItemQuantity(index = 0) {
    return this.quantityCells().nth(index).textContent();
  }
}
