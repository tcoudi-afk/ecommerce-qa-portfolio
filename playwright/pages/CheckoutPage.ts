import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  private commentBox = () => this.page.locator('textarea[name="message"]');
  private placeOrderLink = () => this.page.getByRole('link', { name: 'Place Order' });

  async addComment(comment: string) {
    await this.commentBox().fill(comment);
  }

  async placeOrder() {
    await this.placeOrderLink().click();
  }
}
