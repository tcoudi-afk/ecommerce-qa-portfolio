# BUG-001 — Adding the same item twice does not increase cart quantity

**Severity:** Medium (functional, not blocking — but affects a common purchase pattern)
**Priority:** Medium
**Status:** Confirmed (manual exploration, 2026-07-22)
**Environment:** automationexercise.com, production instance, Chromium

## Steps to Reproduce

1. Open a product page (e.g. `/product_details/1`).
2. Click "Add to cart". Confirm the "Added!" modal, click "Continue Shopping".
3. On the same product page, click "Add to cart" again.
4. Open `/view_cart`.

## Expected Behaviour

Clicking "Add to cart" twice for the same product results in a quantity of 2 in the cart —
this is the behaviour a user would reasonably expect from repeating the same action.

## Actual Behaviour

The cart shows a single line item with quantity 1. The second "Add to cart" action has no
visible effect on quantity.

## Additional Context

Quantity *can* be set before the first add, via the "Quantity" field on the product page —
but this is not how most users attempt to increase quantity; clicking "Add to cart" again is
the more intuitive action. Quantity is not editable afterwards, either on the cart page or
the checkout page (both display it as static text), so once an item is added there is no way
to correct the quantity without removing and re-adding it with the correct amount pre-set.

## Impact

Low technical risk, but a real UX/business risk: a user attempting to buy 2 of the same item
via repeated clicks will unknowingly check out with only 1, unless they notice the discrepancy
on the cart or checkout page.

## Related

- Test case: `docs/test-cases/cart.md` — TC-CART-002
- Risk: R-16 (`docs/risk-analysis.md`)
