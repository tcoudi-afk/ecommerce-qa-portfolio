# Automation Notes

Implementation-level decisions extracted from the test cases, so the test cases themselves
stay technology-independent and readable outside a Playwright context.

## Test Data

- Accounts use a randomised email (timestamp/UUID) generated per test run, not hardcoded —
  avoids collisions between parallel CI runs and removes dependency on manual cleanup.
- Where a test needs an existing account (e.g. TC-LOGIN-003, TC-CART-003), create it via the
  `createAccount` API in a setup step rather than through the UI — faster, less flaky, and
  independent of the registration flow being tested elsewhere.
- Expected search results (TC-SEARCH-001, TC-API-009) are computed dynamically from
  `GET /api/productsList` in the test setup, not hardcoded — resilient to catalogue changes
  on the shared demo environment.

## Assertions

- Assert on business outcome, not implementation detail: e.g. "user is logged in" is checked
  via the header state (`Logged in as {name}` visible, `Logout` link present), not just via
  URL or a success toast that could appear even if the underlying state didn't change.
- For negative scenarios (e.g. TC-LOGIN-004), assert the negative state explicitly (logged-in
  indicator is absent) rather than only checking that an error message appeared — a false
  positive here is a classic flaky-test source.
- For TC-API-007, validate the response against a JSON schema, not just presence of the
  `products` key — catches a "200 with a corrupted list" case that a presence check would
  miss.

## Session Manipulation

- TC-LOGIN-005 (session drop mid-purchase) requires invalidating the session at the browser
  context level (`context.clearCookies()` or equivalent) — this cannot be simulated through
  the UI alone.
- TC-LOGIN-010 (concurrent tabs) requires two `Page` objects sharing one `BrowserContext` to
  accurately reflect two tabs of the same browser session.

## Parametrisation

- TC-LOGIN-006, TC-LOGIN-007, TC-SEARCH-004, TC-API-011, and TC-API-015 are data-driven: one
  test definition parametrised over a list of inputs, not one test per value.

## Confirmed Baselines (from manual exploration, 2026-07-22)

These were established through live manual testing before writing the corresponding
automated assertions:

- Duplicate "Add to cart" does not increment quantity (stays at 1).
- Cart is tied to the account and persists across logout/login.
- Checkout page displays quantity as static text — not editable.
- Search/category filters are not encoded in the URL and reset on reload.
- `createAccount` with an existing email returns HTTP 400, `"Email already exists!"`, and does
  not affect the original account.
