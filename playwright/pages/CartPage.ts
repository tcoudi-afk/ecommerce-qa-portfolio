import { Page } from '@playwright/test';

export type CartRow = {
  rowId: string | null;
  price: string | null;
  quantity: string | null;
  total: string | null;
};

export class CartPage {
  constructor(private page: Page) {}

  private proceedToCheckoutButton = () => this.page.locator('.check_out');
  private deleteItemLinks = () => this.page.locator('.cart_quantity_delete');
  private quantityCells = () => this.page.locator('.cart_quantity');
  private rows = () => this.page.locator('#cart_info_table tbody tr');

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

  /**
   * Structured price/quantity/total per row. Confirmed (docs/automation-notes.md,
   * 2026-07-26): there is no cart-wide grand total anywhere on this page - only
   * each row's own .cart_total - so this is the right level of granularity to
   * assert on, not a page-wide total.
   */
  async getRows(): Promise<CartRow[]> {
    const rows = this.rows();
    const count = await rows.count();
    const data: CartRow[] = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      data.push({
        rowId: await row.getAttribute('id'),
        price: (await row.locator('.cart_price').textContent())?.trim() ?? null,
        quantity: (await row.locator('.cart_quantity').textContent())?.trim() ?? null,
        total: (await row.locator('.cart_total').textContent())?.trim() ?? null,
      });
    }
    return data;
  }
}
