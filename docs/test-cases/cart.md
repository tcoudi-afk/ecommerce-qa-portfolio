# Test Cases — Cart

## TC-CART-001 — No header cart count/price badge exists

- **Objective:** Document that there is no header badge to cross-check against the cart page,
  since the original premise of this test case doesn't hold on this site.
- **Risk:** R-15
- **Preconditions:** —
- **Data:** 2 different products.
- **Steps:** Add two different products to the cart. Inspect the nav bar's "Cart" link and
  the rest of the header for any element showing a count or price.
- **Expected Result:** **Confirmed (2026-07-26, Playwright exploration — see
  `docs/exploration/findings-cart.json`):** the nav "Cart" link is just an icon + the word
  "Cart" (`<a href="/view_cart"><i class="fa fa-shopping-cart"></i> Cart</a>`) — no dynamic
  count or price anywhere. A full scan of the header for any element containing a bare number
  or an "Rs. n" price found nothing. There is no header badge to compare the cart page
  against; the original version of this test case assumed a UI element that doesn't exist,
  same as TC-SEARCH-003's original assumption about combined filters. This test now documents
  that absence instead.
- **Tags:** `@edge-case` `@low` `@cart`

## TC-CART-002 — Adding the same item twice

- **Objective:** Verify that adding the same product twice via "Add to cart" correctly
  increments its quantity.
- **Risk:** R-16
- **Preconditions:** Product already in the cart (qty 1).
- **Data:** Same product.
- **Steps:** Add the same product again from the product page.
- **Expected Result:** Quantity becomes 2.
  **Confirmed (2026-07-26, network-level trace — see
  `docs/exploration/findings-cart-002-network.json`):** both "Add to cart" clicks
  independently fire `GET /add_to_cart/{id}?quantity=1`, both return HTTP 200
  `"Added To Cart"`, and the resulting quantity is 2 — the endpoint is additive, not
  idempotent, and behaves the way a user would expect.
  
  **History:** this test case previously documented the opposite (quantity stuck at 1) as a
  confirmed candidate defect, BUG-001. That finding did not hold up under repeated
  re-testing and a network-level trace, and BUG-001 has been retracted — see
  `docs/bug-reports/cart-duplicate-add-quantity.md` and `docs/automation-notes.md` for the
  full investigation. The original manual finding most likely came from a click that never
  reached the server (the same category of ad/overlay interference that repeatedly disrupted
  manual browser testing on 2026-07-26), not a real dedup on the backend.
- **Tags:** `@functional` `@medium` `@cart`

## TC-CART-003 — Cart persistence after logout and re-login

- **Objective:** Verify whether cart contents survive a logout/login cycle.
- **Risk:** R-17
- **Preconditions:** Logged-in user with an item in the cart.
- **Steps:** Log out. Log back in. Check the cart.
- **Expected Result:** **Confirmed:** the cart persists — it is tied to the account, not to
  the anonymous browser session. Immediately after logout the cart page appears empty (there
  is no logged-out view of an account's cart); after logging back in, the contents reappear.
- **Tags:** `@functional` `@high` `@cart` `@session`

## TC-CART-004 — Cart state after page refresh

- **Objective:** Verify cart contents survive a page reload.
- **Risk:** R-18
- **Preconditions:** Product in the cart.
- **Steps:** Reload `/view_cart` (F5).
- **Expected Result:** Cart contents (count, price) remain unchanged after the reload.
  **Confirmed (2026-07-26, Playwright exploration):** quantity, price, and total for the row
  were byte-identical before and after reload.
- **Tags:** `@functional` `@medium` `@cart`

## TC-CART-005 — Remove item from cart

- **Objective:** Verify removing an item updates the cart correctly.
- **Risk:** R-19
- **Preconditions:** At least two different products in the cart.
- **Data:** –
- **Steps:** Remove one item from the cart page.
- **Expected Result:** The removed item disappears from the cart; header count and total
  update to reflect only the remaining item(s); the total is recalculated correctly.
  **Confirmed (2026-07-26, Playwright exploration — see `docs/exploration/findings-cart.json`):**
  removing one row leaves the other row's own quantity/price/total untouched. There is **no
  cart-wide grand total element anywhere on `/view_cart`** — a full page scan for any
  `class`/`id` containing "total" outside `#cart_info_table` found nothing, consistent with
  TC-CART-001's finding that the header has no count/price badge either. "Total is
  recalculated correctly" only applies to each row's own `.cart_total` cell — there's no
  running/grand total to check against.
- **Tags:** `@functional` `@medium` `@cart`
