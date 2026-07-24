import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}

  private commentBox = () => this.page.locator('textarea[name="message"]');
  private placeOrderLink = () => this.page.getByRole('link', { name: 'Place Order' });

  // No wrapper - test asserts directly on this (same convention as
  // AccountInfoPage.accountCreatedHeading). Used to confirm an empty order
  // (TC-LOGIN-005, session drop mid-purchase) rather than count real items,
  // so a plain row-count check is enough - no need to read quantity/price.
  orderItemRows = () => this.page.locator('.cart_quantity');

  async addComment(comment: string) {
    await this.commentBox().fill(comment);
  }

  async placeOrder() {
    await this.placeOrderLink().click();
  }
}
