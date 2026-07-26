# BUG-001 — Adding the same item twice does not increase cart quantity

**Status: RETRACTED (2026-07-26) — not reproduced under network-level tracing. See
"Retraction" section below before reading further; the rest of this file is kept as the
original report for the record, not because it's still believed accurate.**

**Original Severity:** Medium (functional, not blocking — but affects a common purchase pattern)
**Original Priority:** Medium
**Original Status:** Confirmed (manual exploration, 2026-07-22)
**Environment:** automationexercise.com, production instance, Chromium

## Retraction (2026-07-26)

Re-tested repeatedly while automating TC-CART-002. Results were inconsistent across runs (6
of 9 total observations that day showed quantity 2, not 1), which prompted a network-level
investigation instead of continuing to guess from end-state UI checks alone.

`docs/exploration/findings-cart-002-network.json` captured the full request/response trace
for both "Add to cart" clicks. Both fired `GET /add_to_cart/8?quantity=1` independently and
both returned HTTP 200 with body `"Added To Cart"` — no dropped request, no error, no retry.
The resulting cart line item was quantity 2, matching what a user would expect. The endpoint
is additive, not idempotent, and both calls in this trace succeeded cleanly.

This means the original 2026-07-22 finding (quantity stuck at 1) most likely wasn't a real
application defect. The most plausible explanation, given everything else observed today
(ad/CMP overlays repeatedly intercepting real clicks during manual browser testing, with zero
network request to the app underneath), is that the second "Add to cart" click during the
original manual test never actually reached the server — not that the server received it and
suppressed the increment.

**Conclusion: retracted, not a defect.** Adding a product twice via "Add to cart" correctly
increments quantity to 2. See `docs/test-cases/cart.md` TC-CART-002 for the corrected test
case and `docs/automation-notes.md` for the full same-day timeline of how this was
investigated.

---

## Original Report (2026-07-22, no longer believed accurate — kept for the record)

### Steps to Reproduce

1. Open a product page (e.g. `/product_details/1`).
2. Click "Add to cart". Confirm the "Added!" modal, click "Continue Shopping".
3. On the same product page, click "Add to cart" again.
4. Open `/view_cart`.

### Expected Behaviour

Clicking "Add to cart" twice for the same product results in a quantity of 2 in the cart —
this is the behaviour a user would reasonably expect from repeating the same action.

### Actual Behaviour (as originally reported — not reproduced on 2026-07-26)

The cart shows a single line item with quantity 1. The second "Add to cart" action has no
visible effect on quantity.

### Additional Context

Quantity *can* be set before the first add, via the "Quantity" field on the product page —
but this is not how most users attempt to increase quantity; clicking "Add to cart" again is
the more intuitive action. Quantity is not editable afterwards, either on the cart page or
the checkout page (both display it as static text), so once an item is added there is no way
to correct the quantity without removing and re-adding it with the correct amount pre-set.

### Impact (as originally assessed)

Low technical risk, but a real UX/business risk: a user attempting to buy 2 of the same item
via repeated clicks will unknowingly check out with only 1, unless they notice the discrepancy
on the cart or checkout page.

## Related

- Test case: `docs/test-cases/cart.md` — TC-CART-002
- Risk: R-16 (`docs/risk-analysis.md`)
- Retraction evidence: `docs/exploration/findings-cart-002-network.json`,
  `docs/exploration/findings-cart.json`
