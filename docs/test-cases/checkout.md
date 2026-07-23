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
- **Tags:** `@smoke` `@critical` `@checkout`

## TC-CHECKOUT-002 — Checkout with an empty cart

- **Objective:** Verify checkout cannot be reached with no items in the cart.
- **Risk:** R-21
- **Preconditions:** Empty cart.
- **Steps:** Attempt to proceed to checkout with no items in the cart. Also attempt direct
  navigation to the checkout URL without going through the UI.
- **Expected Result:** Checkout cannot be completed — either the action is unavailable or a
  clear "cart is empty" message is shown, including via direct URL access.
- **Tags:** `@negative` `@medium` `@checkout`

## TC-CHECKOUT-003 — Order appears in order history

- **Objective:** Verify a completed order is visible afterwards.
- **Risk:** R-22
- **Preconditions:** Completed order (from TC-CHECKOUT-001).
- **Steps:** Navigate to the order history / account profile page.
- **Expected Result:** The new order is listed with correct items and total.
- **Tags:** `@functional` `@medium` `@checkout`

## TC-CHECKOUT-004 — Quantity adjustment on the checkout page

- **Objective:** Document whether quantity can be changed during checkout.
- **Risk:** R-23
- **Preconditions:** Product in cart, user on the checkout page.
- **Steps:** Attempt to change the quantity of a line item on the checkout page.
- **Expected Result:** **Confirmed:** quantity is not editable on the checkout page — it is
  displayed as static text, not an input field. Quantity can only be changed earlier, from
  the product page before adding to the cart.
- **Tags:** `@edge-case` `@medium` `@checkout`

## TC-CHECKOUT-005 — Double-submit on "Place Order"

- **Objective:** Verify rapid double-clicking "Place Order" doesn't create duplicate orders.
- **Risk:** R-24
- **Preconditions:** Logged-in user, product in cart, on the final checkout step.
- **Steps:** Click "Place Order" twice in rapid succession.
- **Expected Result:** Exactly one order is created; no duplicate order appears in order
  history.
- **Tags:** `@edge-case` `@high` `@checkout`

## TC-CHECKOUT-006 — Refresh after order confirmation

- **Objective:** Verify reloading the confirmation page doesn't resubmit the order.
- **Risk:** R-25
- **Preconditions:** Order just placed, confirmation page displayed.
- **Steps:** Reload the confirmation page (F5).
- **Expected Result:** No duplicate order is created; order history still shows exactly one
  order.
- **Tags:** `@edge-case` `@high` `@checkout`
