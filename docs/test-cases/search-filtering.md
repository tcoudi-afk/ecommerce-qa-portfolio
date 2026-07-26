# Test Cases — Search & Filtering

## TC-SEARCH-001 — Search result accuracy

- **Objective:** Verify search returns exactly the products matching the term — no more, no
  fewer.
- **Risk:** R-11, R-12
- **Preconditions:** Catalogue state known via `GET productsList`; locally compute the
  expected set as every product whose **name or category** contains the search term
  (confirmed via API exploration — matching is not name-only; e.g. searching `dress` also
  returns products categorised as "Dress" whose name doesn't contain the word).
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
- **Expected Result:** **Confirmed (2026-07-26, live check):** a clean empty state is
  shown — heading "Searched Products", zero product cards, no error. There is **no explicit
  "no results" message anywhere on the page** (`/products?search=xyzxyz123nonexistent`
  contains no text matching `no product|not found|no result`, case-insensitive). The test
  should assert product count = 0, not the presence of a no-results message that doesn't
  exist.
- **Tags:** `@negative` `@low` `@search`

## TC-SEARCH-003 — Category and brand filters do not combine

- **Objective:** Document how category and brand filtering actually interact, since the site
  has no combined-filter UI.
- **Risk:** R-13
- **Preconditions:** —
- **Data:** Category `Men → Tshirts` (`/category_products/3`), brand `Polo`
  (`/brand_products/Polo`).
- **Steps:** Open the category page. Click the "Polo" brand link from its sidebar. Compare
  the resulting product list to what the category page showed.
- **Expected Result:** **Confirmed (2026-07-26, live check):** category and brand are two
  independent, non-combinable views, not a filter that narrows a shared result set. The
  brand link on a category page always points to `/brand_products/{name}` regardless of
  which category you came from — clicking "Polo" from `/category_products/3` (Men Tshirts,
  6 products) lands on `/brand_products/Polo`, which returns 12 products **spanning multiple
  categories** (e.g. "Blue Top", "Soft Stretch Jeans") — not an intersection, and not scoped
  to Men Tshirts at all. There is no UI path that applies both filters at once. The original
  version of this test case assumed an intersection behaviour the site doesn't have; this
  version documents the actual (non-)interaction instead.
- **Tags:** `@edge-case` `@low` `@filter`

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
  **Confirmed (2026-07-26, Playwright probe — see
  `docs/exploration/findings-search-004.json`):** empty and whitespace-only search both show
  the full, unfiltered catalogue (34 products) rather than erroring or showing zero results —
  an empty search term applies no filter at all. Case-insensitive matching confirmed
  (`dress`/`Dress`/`DRESS` return identical result sets). Leading and trailing whitespace are
  **not** handled symmetrically: a trailing space (`"dress "`) matches the same set as
  `"dress"`, but a leading space (`" dress"`) returns fewer results — worth its own assertion
  rather than assuming both behave the same. Diacritics/Unicode (`šaty`, `Ä`, `😊`), `%`, `'`,
  and a 600-character string all return zero results with no crash and no console errors
  beyond unrelated page-chrome noise (mixed-content font warnings present on every value,
  including plain `dress` — not search-specific, don't assert on them). The `<script>` payload
  is not reflected as an executable element (`xssReflected: false`).
- **Tags:** `@boundary` `@security` `@low` `@search`

## TC-SEARCH-005 — Filter state after page refresh

- **Objective:** Document filter persistence behaviour across a reload.
- **Risk:** R-14
- **Preconditions:** A category filter is applied.
- **Steps:** Navigate to a category page (e.g. `/category_products/3`, Men → Tshirts). Reload
  the page (F5).
- **Expected Result:** **Confirmed (2026-07-26, live check — supersedes the previous entry
  below, which was wrong):** the category **is** preserved across reload. Category filtering
  on this site is a URL-addressed page (`/category_products/{id}`), not client-side state —
  the URL *is* the filter, so F5 reloading the same URL correctly shows the same category
  again. There is no separate "apply filter without navigating" mechanism on this site to
  lose in the first place.
  Previous (incorrect) entry, kept for the record rather than silently deleted: "the filter
  is not preserved — the URL does not encode filter state, and after reload the full,
  unfiltered catalogue is shown." This didn't hold up against a live check and appears to
  have been an unverified assumption rather than a tested fact.
- **Tags:** `@edge-case` `@low` `@filter`
