# Test Cases — Checkout

## TC-CHECKOUT-001 — Successful order placement

- **Objective:** Verify a user can complete an order end-to-end.
- **Risk:** R-20
- **Preconditions:** Logged-in user, product in cart.
- **Data:** Valid delivery address (from account details).
- **Steps:** Open cart → "Proceed to Checkout" → review/confirm address → "Place Order" →
  submit fictitious payment details → confirm.
- **Expected Result:** An order-confirmation message is displayed and the user is
  redirected to a confirmation page.
  **Confirmed (2026-07-26, Playwright exploration — see `docs/exploration/findings-checkout.json`):**
  "Place Order" navigates to `/payment` (address review + payment form), and after submitting
  payment the user lands on `/payment_done/{orderId}` with heading **"Order Placed!"** and
  message **"Congratulations! Your order has been confirmed!"**
- **Tags:** `@smoke` `@critical` `@checkout`

## TC-CHECKOUT-002 — Checkout with an empty cart

- **Objective:** Verify checkout cannot be reached with no items in the cart.
- **Risk:** R-21
- **Preconditions:** Empty cart.
- **Steps:** Attempt to proceed to checkout with no items in the cart. Also attempt direct
  navigation to the checkout URL without going through the UI.
- **Expected Result:** Checkout cannot be completed — either the action is unavailable or a
  clear "cart is empty" message is shown, including via direct URL access.
  **Confirmed (2026-07-26, Playwright exploration — see `docs/exploration/findings-checkout.json`):**
  half right. Via the UI, `/view_cart` correctly shows "Cart is empty! Click here to buy
  products." with no checkout control present at all — not disabled, entirely absent. **But
  direct navigation to `/checkout` bypasses this entirely**: the page renders normally with
  full address details, an empty order review, Total Amount Rs. 0, and a fully functional
  "Place Order" link. See `docs/bug-reports/empty-cart-checkout-direct-url.md` (BUG-003).
- **Tags:** `@negative` `@medium` `@checkout`

## TC-CHECKOUT-003 — No order history page exists

- **Objective:** Document that there is no order history / past-orders page reachable after
  checkout, since the original premise of this test case doesn't hold on this site.
- **Risk:** R-22
- **Preconditions:** Completed order (from TC-CHECKOUT-001).
- **Steps:** After completing an order, inspect every nav link for anything that could be an
  order history or account/profile page.
- **Expected Result:** **Confirmed (2026-07-26, Playwright exploration — see
  `docs/exploration/findings-checkout.json`):** no such page exists. The full nav after a
  completed order is: Home, Products, Cart, Logout, Delete Account, Test Cases, API Testing,
  Video Tutorials, Contact us — plus, only on the confirmation page itself, "Download
  Invoice" and "Continue" (both scoped to that one order, not a persistent history). There is
  no "My Orders"/"Order History" link anywhere. This test now documents that absence instead
  of navigating to a page that doesn't exist — same treatment as TC-SEARCH-003 and
  TC-CART-001 earlier today.
- **Tags:** `@edge-case` `@low` `@checkout`

## TC-CHECKOUT-004 — Quantity adjustment on the checkout page

- **Objective:** Document whether quantity can be changed during checkout.
- **Risk:** R-23
- **Preconditions:** Product in cart, user on the checkout page.
- **Steps:** Attempt to change the quantity of a line item on the checkout page.
- **Expected Result:** **Confirmed:** quantity is not editable on the checkout page — it is
  displayed as static text, not an input field. Quantity can only be changed earlier, from
  the product page before adding to the cart.
- **Tags:** `@edge-case` `@medium` `@checkout`

## TC-CHECKOUT-005 — Double-submit on the actual order-creating step

- **Objective:** Verify rapid double-clicking the control that actually creates the order
  doesn't create duplicate orders.
- **Risk:** R-24
- **Preconditions:** Logged-in user, product in cart, on the Payment page (`/payment`).
- **Steps:** Click "Pay and Confirm Order" twice in rapid succession.
- **Expected Result:** Exactly one order is created; no duplicate order appears in order
  history.
  **Correction (2026-07-26, Playwright exploration — see
  `docs/exploration/findings-checkout.json`):** "Place Order" (on the cart/checkout step) is
  just a plain `<a href="/payment">` navigation link, not a submit action — it cannot itself
  create a duplicate order no matter how many times it's clicked. The real order-creating
  step is the Payment page's `data-qa="pay-button"`, inside a `<form method="POST"
  action="/payment">`. This test targets that button, not the literal "Place Order" link.
  **Confirmed:** two native clicks fired synchronously on the pay button produced exactly one
  `POST /payment` in the network trace; no duplicate order was created in this trial.
- **Tags:** `@edge-case` `@high` `@checkout`

## TC-CHECKOUT-006 — Refresh after order confirmation

- **Objective:** Verify reloading the confirmation page doesn't resubmit the order.
- **Risk:** R-25
- **Preconditions:** Order just placed, confirmation page displayed.
- **Steps:** Reload the confirmation page (F5).
- **Expected Result:** No duplicate order is created; order history still shows exactly one
  order.
  **Confirmed (2026-07-26, manual probe — see
  `docs/exploration/findings-checkout-reload.json`):** a POST *does* fire on reload, but it's
  Cloudflare's Real User Monitoring beacon (`/cdn-cgi/rum`), injected by the CDN in front of
  the site — not a form resubmission. The order id in the confirmation URL
  (`/payment_done/{orderId}`) is identical before and after reload across 3/3 trials: no
  duplicate order is created. Earlier test versions asserted "no POST fires" as a proxy for
  "no duplicate order" — that proxy broke when the CDN's own same-origin beacon matched the
  same domain check. The test now asserts on the order id directly.
- **Tags:** `@edge-case` `@high` `@checkout`
