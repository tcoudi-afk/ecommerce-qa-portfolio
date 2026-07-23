# Test Cases — Cart

## TC-CART-001 — Count/price consistency between header and cart page

- **Objective:** Verify the cart badge and the cart page always agree on count and total.
- **Risk:** R-15
- **Preconditions:** Empty cart.
- **Data:** 2–3 products with known prices.
- **Steps:** Add products to the cart. Record the count/total shown in the header badge.
  Open `/view_cart`. Compare count and total.
- **Expected Result:** Header and cart page show identical count and total.
- **Tags:** `@functional` `@critical` `@cart`

## TC-CART-002 — Adding the same item twice

- **Objective:** Document what happens when the same product is added to the cart twice.
- **Risk:** R-16
- **Preconditions:** Product already in the cart (qty 1).
- **Data:** Same product.
- **Steps:** Add the same product again from the product page.
- **Expected Result:** **Confirmed:** quantity stays at 1 — repeated "Add to cart" clicks do
  not increment quantity. Quantity can only be set on the product page *before* adding; it is
  not editable afterwards on the cart or checkout page. This is a candidate defect — see
  the bug report in `docs/bug-reports/`.
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
- **Tags:** `@functional` `@medium` `@cart`

## TC-CART-005 — Remove item from cart

- **Objective:** Verify removing an item updates the cart correctly.
- **Risk:** R-19
- **Preconditions:** At least two different products in the cart.
- **Data:** –
- **Steps:** Remove one item from the cart page.
- **Expected Result:** The removed item disappears from the cart; header count and total
  update to reflect only the remaining item(s); the total is recalculated correctly.
- **Tags:** `@functional` `@medium` `@cart`
