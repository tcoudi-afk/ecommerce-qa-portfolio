# BUG-003 — Checkout is reachable and completable with an empty cart via direct URL

**Severity:** Medium (no direct financial harm on this demo site, but the underlying pattern
would be a real business risk on a production checkout)
**Priority:** Medium
**Status:** Confirmed (Playwright exploration, 2026-07-26)
**Environment:** automationexercise.com, production instance, Chromium

## Steps to Reproduce

1. Log in with an account that has an empty cart (or empty the cart first).
2. Navigate directly to `/checkout` (not via the UI "Proceed to Checkout" button — there
   isn't one when the cart is empty, see below).

## Expected Behaviour

Checkout should not be reachable at all with an empty cart — either redirect elsewhere, or
show a clear "your cart is empty" message, consistent with what `/view_cart` itself does.

## Actual Behaviour

`/checkout` renders completely normally: full address details, an order review table with no
line items, **Total Amount Rs. 0**, and a fully functional "Place Order" link that proceeds to
the real payment flow. Nothing in the UI indicates anything is wrong. `/view_cart` itself
*does* correctly show "Cart is empty! Click here to buy products." and has no checkout control
at all when empty — this protection simply isn't applied if `/checkout` is reached directly
(bookmark, back button, typed URL, stale tab, etc.).

## Additional Context

This is the same *shape* of problem as BUG-002 (session drop mid-purchase silently empties
checkout) — a checkout page that renders successfully with no items and no warning — but a
different trigger: BUG-002 needs an active session to drop mid-flow, this one just needs
direct navigation with nothing in the cart. Worth tracking as a separate finding rather than
folding into BUG-002, since the root cause (missing empty-cart guard specifically on the
`/checkout` route) is likely shared but the reproduction paths are independent.

## Impact

On this demo site there's no real financial exposure. On a production e-commerce checkout,
letting a customer proceed through the full payment flow attached to a Rs. 0 / empty order is
the kind of gap that becomes a real business risk — at minimum a broken/confusing user
experience, at worst a route to placing orders that don't reflect what was actually intended.

## Related

- Test case: `docs/test-cases/checkout.md` — TC-CHECKOUT-002
- Risk: R-21 (`docs/risk-analysis.md`)
- Related bug: `docs/bug-reports/session-drop-silent-empty-checkout.md` (BUG-002) — same
  symptom shape, different trigger
- Evidence: `docs/exploration/findings-checkout.json`
