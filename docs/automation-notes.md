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

## Confirmed Baselines (from automated test runs, 2026-07-24)

Found while writing Playwright tests, not from a separate manual exploration pass — kept as
a distinct section so the provenance stays honest.

- Submitting the signup form redirects to `/signup` regardless of whether the email is new
  or already registered — the URL is identical for both outcomes. Surfaced when TC-LOGIN-003
  initially asserted `toHaveURL('/login')` on the duplicate-email path and failed against the
  live app: the page actually stayed on `/signup`, distinguished only by page content (the
  account-info form vs. the error message), not the URL. Fixed by asserting on the
  account-info form heading (`AccountInfoPage.accountInfoHeading`) instead.
- The signup email field (`type="email"`, `required`) rejects `test`, `test@`,
  `test@@test.com`, and an empty string entirely through the browser's native constraint
  validation — none of them ever reach the server, so TC-LOGIN-006 can never observe an
  app-level error message for these values, only the browser's own validation UI.
- The signup password field has no `minLength`/`maxLength`/`pattern` — only `required`.
  A 1-character password and a 220-character password are both accepted and create the
  account; the site enforces no server-side length limit either direction (TC-LOGIN-007).
- Two synchronous native clicks on the "Create Account" button (`el.click(); el.click();`,
  bypassing Playwright's per-click actionability wait, which cannot represent a real rapid
  double-click) produced exactly one `POST /signup` and one account. No duplicate-request
  behaviour observed (TC-LOGIN-009).
- **Session drop mid-purchase does not redirect to login.** After `context.clearCookies()`
  with an item already in the cart, navigating to checkout renders `/checkout` directly — the
  navbar reflects the logged-out state ("Signup / Login"), but the order review shows no line
  items and Total Amount **Rs. 0**. The cart is silently emptied with no prompt to
  re-authenticate (TC-LOGIN-005). Filed as `docs/bug-reports/session-drop-silent-empty-checkout.md`
  (BUG-002) — this contradicts the test case's original expected result, which assumed a
  login redirect and cart preservation on the (incorrect) assumption that session drop would
  behave like the confirmed logout/re-login case (TC-CART-003).

Raw tool output backing the four findings above:
`docs/exploration/findings-005-006-007-009.json` (generated by a throwaway Playwright script,
not part of the committed suite).

## Confirmed Baselines (live browser check, 2026-07-26)

- **TC-SEARCH-002:** `/products?search=xyzxyz123nonexistent` shows zero product cards and no
  explicit "no results" message anywhere on the page (checked the full body text against
  `no product|not found|no result`, case-insensitive — no match). Test should assert product
  count = 0, not the presence of a message that doesn't exist.
- **TC-CART-001/005:** no cart-wide count/price display exists anywhere — not in the header
  (just an icon + "Cart" text) and not on `/view_cart` either (no grand-total element outside
  each row's own `.cart_total`). Both test cases were rewritten/adjusted to stop assuming a
  UI element this site doesn't have.
- **TC-CART-002 (resolved 2026-07-26, network-level trace):** re-tested the existing
  BUG-001 finding (quantity stays at 1) repeatedly through the day with inconsistent results
  (6 of 9 total observations showed quantity 2, not 1). A network-level trace
  (`docs/exploration/findings-cart-002-network.json`) settled it: both "Add to cart" clicks
  independently fired `GET /add_to_cart/{id}?quantity=1`, both returned HTTP 200
  `"Added To Cart"`, and the result was quantity 2 — no dropped request, no error. **BUG-001
  has been retracted** (`docs/bug-reports/cart-duplicate-add-quantity.md`) — the endpoint is
  additive and correct; the original 2026-07-22 manual finding most likely came from a click
  that never reached the server (same category as the ad/CMP overlay interference that
  repeatedly derailed manual browser testing today), not a real dedup on the backend.
- **TC-CART-004:** cart quantity/price/total confirmed byte-identical before and after a page
  reload.
  Raw data for all of the above: `docs/exploration/findings-cart.json` and
  `docs/exploration/findings-cart-002-network.json` (kept on disk per new standing rule —
  exploration JSON output is archived, not deleted; see CLAUDE.md).
- **TC-SEARCH-003:** category and brand are non-combinable, independent views — not a
  narrowing filter pair. The brand sidebar link on a category page always points to
  `/brand_products/{name}`, dropping the category entirely. Verified: `/category_products/3`
  (Men Tshirts, 6 products) → click "Polo" → `/brand_products/Polo` returns 12 products
  spanning multiple categories (Blue Top, Fancy Green Top, Soft Stretch Jeans, Grunt Blue Slim
  Fit Jeans, Premium Polo T-Shirts), not an intersection and not scoped to Men Tshirts. The
  test case was rewritten to document this instead of asserting an intersection that isn't
  reachable through the UI.

## Checkout module (Playwright exploration, 2026-07-26)

- **TC-CHECKOUT-001:** `CheckoutPage.ts`/`PaymentPage.ts` locators (written speculatively in
  an earlier session, never run) all matched the real site with no changes needed. Confirmed
  exact confirmation text: heading "Order Placed!", message "Congratulations! Your order has
  been confirmed!", at `/payment_done/{orderId}`.
- **TC-CHECKOUT-002 / BUG-003:** `/view_cart` correctly shows "Cart is empty!" with no
  checkout control when empty, but **direct navigation to `/checkout` bypasses this** — page
  renders normally with Rs. 0 and a working "Place Order". Same shape as BUG-002, different
  trigger (no session drop needed, just an empty cart). See
  `docs/bug-reports/empty-cart-checkout-direct-url.md`.
- **TC-CHECKOUT-003:** no order-history/account page exists anywhere in the nav after a
  completed order — confirmed by listing every nav link, not by guessing a URL. Test case
  rewritten to document the absence.
- **TC-CHECKOUT-005:** "Place Order" is a plain `<a href="/payment">`, not a submit control —
  cannot itself cause a duplicate order. The real risk is the Payment page's `pay-button`
  (`POST /payment`). Two synchronous clicks there produced exactly one `POST /payment` in the
  network trace — no duplicate order in this trial.
- **TC-CHECKOUT-006:** reloading the confirmation page (`/payment_done/{orderId}`) fires no
  POST at all — order id is baked into the URL path, reload is inherently safe.
  Raw data: `docs/exploration/findings-checkout.json`.

## CI failure (2026-07-26): ad network domains missing from the shared fixture

First real CI run of the Playwright job (`ui-tests` in `.github/workflows/ci.yml`) failed 2
of 41 tests, consistently across all 3 retries (not flaky) — both traced back to the same
root cause: `playwright/fixtures/test.ts` only ever blocked the Funding Choices CMP domain.
The ad network domains (`pagead2.googlesyndication.com`, `*.doubleclick.net`) were blocked in
the throwaway `_explore-*.spec.ts` scripts used during today's investigation, but that
blocking was never carried over into the shared fixture used by the actual committed suite.

- **TC-SEARCH-005** failed on `expect(namesAfter).toEqual(namesBefore)`: one product's name
  differed between the before/after reload snapshots (e.g. "...BLUE**Men's T-Shirts**" vs
  "...BLUE**T-Shirt Printing Service**", changing on every retry) — ad-injected text was
  leaking into `ProductsPage.getProductNames()`'s locator, not a real category-filter defect.
- **TC-CHECKOUT-006** failed on `expect(postRequestFiredOnReload).toBe(false)`: an unscoped
  `page.on('request')` listener caught `POST pagead2.googlesyndication.com/pagead/ping` and
  mistook it for the app resubmitting the order on reload.

**Fix:** added `pagead2.googlesyndication.com` and `*.doubleclick.net` to
`playwright/fixtures/test.ts`'s `BLOCKED_URL_PATTERNS` (previously only had the CMP domain),
so every test gets this protection automatically — not just the throwaway exploration
scripts. Also scoped TC-CHECKOUT-006's request listener to `automationexercise.com` as
defense-in-depth, so an unblocked third party can't trip that specific assertion again even
if the domain list is ever incomplete.

**Why this passed locally but failed in CI:** most plausibly ads simply didn't fire during
the local runs (ad delivery is inherently non-deterministic — network/region/timing dependent),
while the CI runner's network path triggered them consistently. This is exactly why the
exploration scripts' network-level tracing methodology matters: an end-state check that
happens to pass locally can still be silently relying on an environment detail (ads not
firing) that isn't guaranteed anywhere else, including CI.
- **TC-SEARCH-005 correction:** the pre-existing "Confirmed" note for this test case (filter
  lost on reload) did not hold up. Category filtering is a URL-addressed page
  (`/category_products/{id}`), so F5 correctly shows the same category again — there's no
  separate client-side filter state to lose. The old note was an unverified assumption
  mislabelled as confirmed; see the test case file for the corrected version.
- **TC-SEARCH-004 (via Playwright probe script, not manual):** empty/whitespace-only search
  shows the full unfiltered catalogue (34 products), not zero results or an error.
  Case-insensitive (`dress`/`Dress`/`DRESS` identical). Whitespace handling is asymmetric —
  trailing space matches like the trimmed term, leading space returns fewer results.
  Diacritics/Unicode/`%`/`'`/600-char string all → 0 results, no crash. `<script>` payload not
  reflected as an executable element. Console errors seen across every value are page-chrome
  noise (HTTP font mixed-content warnings), not search-specific — don't assert on them. Raw
  data: `docs/exploration/findings-search-004.json`.
