import { test, expect } from '../fixtures/test';
import type { APIRequestContext } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';

interface ApiProduct {
  name: string;
  category: { category: string };
}

interface ProductsListResponse {
  responseCode: number;
  products: ApiProduct[];
}

/**
 * The productsList API returns an HTTP 302 redirect instead of JSON on
 * roughly 40-60% of calls on this shared demo environment (see
 * docs/automation-notes.md) — third-party infrastructure instability, not
 * an application defect.
 *
 * Retrying here (rather than the guard/skip pattern used in the Postman
 * collection) is the right call for this specific case: this call isn't
 * the thing under test — it's just how the test establishes its expected
 * data set for a UI assertion. In Postman, the API itself is what's being
 * verified, so masking a 302 with a retry would hide a real finding.
 */
async function fetchProductsListWithRetry(
  request: APIRequestContext,
  attempts = 5
): Promise<ProductsListResponse> {
  for (let i = 0; i < attempts; i++) {
    const response = await request.get('/api/productsList');
    if (response.status() === 200) {
      return response.json();
    }
  }
  throw new Error(
    `productsList did not return HTTP 200 after ${attempts} attempts ` +
      `(known ~40-60% HTTP 302 rate on this environment — see docs/automation-notes.md)`
  );
}

/** Collapses internal whitespace and normalises case, so a UI rendering quirk
 * (e.g. "Men  Tshirt" with a double space vs. the API's "Men Tshirt") doesn't
 * register as a false mismatch. */
function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

test.describe('Search & Filtering', () => {
  test('TC-SEARCH-001 - search result accuracy', async ({ page, request }) => {
    const term = 'dress';

    // --- Expected set, computed from the API ---
    // Matching is on name OR category, not name-only — confirmed by live
    // exploration (see docs/automation-notes.md); a name-only assumption
    // would fail against real data.
    const { products } = await fetchProductsListWithRetry(request);
    const expectedNames = products
      .filter(
        (p) =>
          normalise(p.name).includes(term) ||
          normalise(p.category.category).includes(term)
      )
      .map((p) => normalise(p.name))
      .sort();

    // --- Actual set, read from the UI ---
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.searchProduct(term);
    const actualNames = (await productsPage.getProductNames())
      .map(normalise)
      .sort();

    // Expected Result (docs/test-cases/search-filtering.md): displayed set
    // exactly matches the expected set — nothing missing, nothing extra.
    expect(actualNames).toEqual(expectedNames);
  });
});
