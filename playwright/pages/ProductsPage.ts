import { Page } from '@playwright/test';

export class ProductsPage {
  constructor(private page: Page) {}

  private searchInput = () => this.page.getByPlaceholder('Search Product');
  private searchButton = () => this.page.locator('#submit_search');
  private addToCartLinks = () => this.page.getByRole('link', { name: 'Add to cart' });

  async goto() {
    await this.page.goto('/products');
  }

  async searchProduct(name: string) {
    await this.searchInput().fill(name);
    await this.searchButton().click();
  }

  async addFirstProductToCart() {
    await this.addToCartLinks().first().click();
  }
}
