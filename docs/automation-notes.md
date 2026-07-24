# Automation Notes

Implementation-level decisions extracted from the test cases, so the test cases themselves
stay technology-independent and readable outside a Playwright context.

## Test Data

- Accounts use a randomised email (timestamp/UUID) generated per test run, not hardcoded —
  avoids collisions between parallel CI runs and removes dependency on manual cleanup.
- Where a test needs an existing account (e.g. TC-LOGIN-003, TC-CART-003), create it via the
  `createAccount` API in a setup step rather than through the UI — faster, less flaky, and
  independent of the registration flow being tested elsewhere. **Exception: Playwright UI
  tests use UI setup (signup flow) instead**, because the ~40-60% HTTP 302 rate on this API
  (see below) would make an unrelated UI test flaky for a reason that has nothing to do with
  what it's actually testing. The Postman/API layer keeps API setup, since retry handling for
  the 302 issue already lives there at the collection/Newman level.
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

## Environment Instability (API layer)

Confirmed via repeated live requests (2026-07-22): roughly 40–60% of API calls to
automationexercise.com return an HTTP 302 redirect to `/` instead of the documented JSON
response — across all four endpoints, unrelated to request frequency (still occurs with 1s
spacing between calls) or request validity. This is third-party infrastructure instability,
not an application defect.

**Pattern used in every Postman test script** to keep this from masquerading as a real test
failure: check `pm.response.code === 302` first; if true, fail one clearly-labelled
"API responded normally" assertion and skip the rest of that request's assertions, rather
than letting several unrelated assertions fail with confusing, unrelated messages. Actual
retry logic lives at the CI/Newman level, not duplicated into every test script — see
`.github/workflows/ci.yml`.

## Third-Party Overlays (UI layer)

AutomationExercise loads Google Funding Choices (CMP for cookie consent), which renders a
`fc-consent-root` overlay that intercepts pointer events on elements underneath it —
observed blocking clicks on the signup button on `/login` (TC-LOGIN-002 setup step).

The CMP is not part of the SUT and is out of scope for this portfolio. Handled once, at the
network level, via an auto-fixture (`playwright/fixtures/test.ts`) that aborts requests to
`fundingchoicesmessages.google.com` for every test — rather than a conditional "dismiss if
visible" step in each test, which would itself be a source of flakiness (the banner doesn't
always render in time to be dismissed). Trade-off: tests run in an environment slightly
different from what a real user sees. If consent-banner behaviour were ever business-critical
for this SUT, it would need its own dedicated test rather than being silently blocked here.

## Confirmed Baselines (from manual exploration, 2026-07-22)

These were established through live manual testing before writing the corresponding
automated assertions:

- Duplicate "Add to cart" does not increment quantity (stays at 1).
- Cart is tied to the account and persists across logout/login.
- Checkout page displays quantity as static text — not editable.
- Search/category filters are not encoded in the URL and reset on reload.
- `createAccount` with an existing email returns HTTP 400, `"Email already exists!"`, and does
  not affect the original account.
- `searchProduct` matches on **name or category**, not name alone — confirmed by comparing
  the live response against a locally-computed expected set from `productsList`. A test
  asserting name-only matching (the natural first assumption) fails against real data.
- `verifyLogin` treats an empty-string or whitespace-only `email` as *present but not
  found* (`responseCode: 404`) — distinct from an entirely missing `email` parameter
  (`responseCode: 400`). Whitespace is not trimmed before the lookup.
- `productsList`'s `Allow` response header lists `DELETE, PUT, OPTIONS, GET, POST` as
  supported methods, but DELETE and PUT both return the same `405` as any genuinely
  unsupported method — the `Allow` header does not accurately reflect functional support.
  OPTIONS returns endpoint metadata (name, accepted content types), not a 405.
