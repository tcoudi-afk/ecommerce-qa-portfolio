import { Page } from '@playwright/test';

export class ProductDetailsPage {
  constructor(private page: Page) {}

  private quantityInput = () => this.page.locator('#quantity');
  private addToCartButton = () => this.page.locator('button.btn.btn-default.cart');
  private continueShoppingButton = () =>
    this.page.getByRole('button', { name: 'Continue Shopping' });

  async goto(productId: number) {
    await this.page.goto(`/product_details/${productId}`);
  }

  async setQuantity(quantity: number) {
    await this.quantityInput().fill(String(quantity));
  }

  async addToCart() {
    await this.addToCartButton().click();
  }

  async dismissAddedModal() {
    await this.continueShoppingButton().click();
  }
}
