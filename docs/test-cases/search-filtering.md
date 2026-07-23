# Test Cases — Search & Filtering

## TC-SEARCH-001 — Search result accuracy

- **Objective:** Verify search returns exactly the products matching the term — no more, no
  fewer.
- **Risk:** R-11, R-12
- **Preconditions:** Catalogue state known via `GET productsList`; locally filter products
  whose name contains the search term to compute the expected set.
- **Data:** A term matching a subset of the catalogue, e.g. `dress`.
- **Steps:** Compute the expected set via the API. Enter the same term in the UI search.
  Compare the displayed set to the expected set.
- **Expected Result:** The displayed set exactly matches the expected set (nothing missing —
  no false negative; nothing extra — no false positive).
- **Tags:** `@functional` `@medium` `@search`

## TC-SEARCH-002 — Search term with no matches

- **Objective:** Verify a clean "no results" state for a term matching nothing.
- **Risk:** R-11
- **Preconditions:** Chosen term confirmed (via API) to match no product.
- **Data:** `xyzxyz123nonexistent`
- **Steps:** Enter the term in search.
- **Expected Result:** An empty/"no products found" state is shown; no error, no unrelated
  products.
- **Tags:** `@negative` `@low` `@search`

## TC-SEARCH-003 — Combined category and brand filter

- **Objective:** Verify combining two filters narrows results to their intersection.
- **Risk:** R-13
- **Preconditions:** Catalogue contains products for the chosen category/brand combination.
- **Data:** Category `Men`, brand `Polo`.
- **Steps:** Select the category, then apply the brand filter.
- **Expected Result:** Displayed products match the intersection of both filters — not just
  the last filter applied.
- **Tags:** `@functional` `@medium` `@filter`

## TC-SEARCH-004 — Search input edge cases

- **Objective:** Verify search handles edge-case input consistently and without crashing.
- **Risk:** R-11, R-12
- **Preconditions:** User on the search page.
- **Data (data-driven):**
  - Empty string, whitespace-only
  - Case variants: `dress`, `Dress`, `DRESS`
  - Leading/trailing spaces: ` dress`, `dress `
  - Diacritics/Unicode: `šaty`, `Ä`, `😊`
  - Very long string (500+ characters)
  - Special characters: `<script>alert(1)</script>`, `%`, `'`
- **Steps:** Submit each value separately (parametrised).
- **Expected Result:** No crash, no unhandled error; consistent behaviour (matching results
  or a clean "no results" state); no script execution/reflection in the DOM.
- **Tags:** `@boundary` `@security` `@low` `@search`

## TC-SEARCH-005 — Filter state after page refresh

- **Objective:** Document filter persistence behaviour across a reload.
- **Risk:** R-14
- **Preconditions:** A filter is applied.
- **Steps:** Apply a category filter. Reload the page (F5).
- **Expected Result:** **Confirmed:** the filter is not preserved — the URL does not encode
  filter state, and after reload the full, unfiltered catalogue is shown.
- **Tags:** `@edge-case` `@low` `@filter`
