import { Page } from '@playwright/test';

export class ProductsPage {
  constructor(private page: Page) {}

  private searchInput = () => this.page.getByPlaceholder('Search Product');
  private searchButton = () => this.page.locator('#submit_search');
  // The site's "Add to cart" elements are <a> tags WITHOUT an href attribute,
  // so they don't get the accessibility 'link' role - getByRole('link', ...)
  // silently matches nothing and hangs waiting. Confirmed via the ARIA
  // snapshot in a failed exploration run (2026-07-24): these render as
  // 'generic', not 'link'. CSS class selector instead.
  private addToCartLinks = () => this.page.locator('a.add-to-cart');
  private productNames = () => this.page.locator('.single-products .productinfo p');

  async goto() {
    await this.page.goto('/products');
  }

  /**
   * Returns the raw, un-normalised name text of every currently displayed
   * product. Whitespace normalisation is left to the caller (the test) —
   * this method's job is just to report what the page actually shows.
   */
  async getProductNames(): Promise<string[]> {
    return this.productNames().allTextContents();
  }

  async searchProduct(name: string) {
    await this.searchInput().fill(name);
    await this.searchButton().click();
  }

  async addFirstProductToCart() {
    await this.addToCartLinks().first().click();
  }
}
