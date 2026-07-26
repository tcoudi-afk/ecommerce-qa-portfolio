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

  test('TC-SEARCH-002 - search term with no matches shows an empty state', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.searchProduct('xyzxyz123nonexistent');

    // Confirmed (docs/automation-notes.md, 2026-07-26): there is no explicit
    // "no results" message on this site - the only observable signal is a
    // zero-length product list, so that's what this asserts on.
    expect(await productsPage.getProductNames()).toHaveLength(0);
  });

  test('TC-SEARCH-003 - category and brand filters do not combine', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await page.goto('/category_products/3'); // Men -> Tshirts
    const categoryNames = new Set(
      (await productsPage.getProductNames()).map((n) => n.trim())
    );

    await page.getByRole('link', { name: 'Polo' }).click();
    await expect(page).toHaveURL(/\/brand_products\/Polo$/);

    // Confirmed (docs/automation-notes.md, 2026-07-26): the brand view is not
    // scoped to the category we came from - it's a separate, unfiltered-by-
    // category product set. Asserting "contains something outside the
    // category set" is robust to catalogue changes, unlike pinning exact
    // counts.
    const brandNames = await productsPage.getProductNames();
    const hasProductOutsideCategory = brandNames.some(
      (n) => !categoryNames.has(n.trim())
    );
    expect(hasProductOutsideCategory).toBe(true);
  });

  test.describe('TC-SEARCH-004 - search input edge cases', () => {
    test('empty and whitespace-only search show the full catalogue', async ({
      page,
      request,
    }) => {
      const { products } = await fetchProductsListWithRetry(request);
      const productsPage = new ProductsPage(page);
      await productsPage.goto();

      // Confirmed: an empty/whitespace-only term applies no filter at all -
      // it does not error and does not show zero results.
      await productsPage.searchProduct('');
      expect(await productsPage.getProductNames()).toHaveLength(products.length);

      await productsPage.searchProduct('   ');
      expect(await productsPage.getProductNames()).toHaveLength(products.length);
    });

    test('search is case-insensitive', async ({ page }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();

      await productsPage.searchProduct('dress');
      const lower = (await productsPage.getProductNames()).map(normalise).sort();

      await productsPage.searchProduct('Dress');
      const mixed = (await productsPage.getProductNames()).map(normalise).sort();

      await productsPage.searchProduct('DRESS');
      const upper = (await productsPage.getProductNames()).map(normalise).sort();

      expect(mixed).toEqual(lower);
      expect(upper).toEqual(lower);
    });

    // Confirmed baseline (docs/automation-notes.md, 2026-07-26): whitespace is
    // NOT trimmed symmetrically - a leading space loses matches that a
    // trailing space doesn't.
    test('leading whitespace narrows results; trailing whitespace does not', async ({
      page,
    }) => {
      const productsPage = new ProductsPage(page);
      await productsPage.goto();

      await productsPage.searchProduct('dress');
      const trimmedCount = (await productsPage.getProductNames()).length;

      await productsPage.searchProduct(' dress');
      const leadingSpaceCount = (await productsPage.getProductNames()).length;

      await productsPage.searchProduct('dress ');
      const trailingSpaceCount = (await productsPage.getProductNames()).length;

      expect(leadingSpaceCount).toBeLessThan(trimmedCount);
      expect(trailingSpaceCount).toBe(trimmedCount);
    });

    // Diacritics/Unicode, a very long string, and lone special characters -
    // confirmed to all return zero results without crashing. Grouped as one
    // data-driven loop since they share the same expected outcome.
    const noMatchValues = ['šaty', 'Ä', '😊', '%', "'", 'a'.repeat(600)];
    for (const value of noMatchValues) {
      const label = value.length > 20 ? `${value.slice(0, 20)}… (${value.length} chars)` : value;
      test(`"${label}" returns zero results without crashing`, async ({ page }) => {
        const productsPage = new ProductsPage(page);
        await productsPage.goto();
        await productsPage.searchProduct(value);
        expect(await productsPage.getProductNames()).toHaveLength(0);
      });
    }

    test('script-tag payload is not reflected as an executable element', async ({ page }) => {
      // The real-world failure mode for reflected XSS is the payload actually
      // executing - checking for a JS dialog is a more meaningful signal than
      // just grepping innerHTML for an escaped-looking string.
      let dialogAppeared = false;
      page.on('dialog', async (dialog) => {
        dialogAppeared = true;
        await dialog.dismiss();
      });

      const productsPage = new ProductsPage(page);
      await productsPage.goto();
      await productsPage.searchProduct('<script>alert(1)</script>');
      await page.waitForTimeout(500);

      expect(dialogAppeared).toBe(false);
    });
  });

  test('TC-SEARCH-005 - category filter survives a page reload', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await page.goto('/category_products/3'); // Men -> Tshirts
    const namesBefore = (await productsPage.getProductNames()).sort();

    await page.reload();

    // Confirmed (docs/automation-notes.md, 2026-07-26): category filtering is
    // a URL-addressed page, not client-side state - reloading the same URL
    // correctly shows the same category again.
    await expect(page).toHaveURL(/\/category_products\/3$/);
    const namesAfter = (await productsPage.getProductNames()).sort();
    expect(namesAfter).toEqual(namesBefore);
  });
});
