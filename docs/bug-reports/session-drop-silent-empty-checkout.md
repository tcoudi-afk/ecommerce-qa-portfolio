# BUG-002 — Session drop mid-purchase silently empties the cart instead of prompting re-authentication

**Severity:** High (checkout-path integrity; user can lose their order with no warning)
**Priority:** High
**Status:** Confirmed (Playwright exploration script, 2026-07-24)
**Environment:** automationexercise.com, production instance, Chromium

## Steps to Reproduce

1. Register a new account and stay logged in.
2. Add a product to the cart. Confirm `/view_cart` shows quantity 1.
3. Drop the session (e.g. `context.clearCookies()` — simulates a session/cookie expiring).
4. Proceed to checkout (`/checkout`).

## Expected Behaviour

Losing the session mid-purchase should be handled explicitly — either redirect to `/login`
so the user can re-authenticate before checkout, or otherwise make it clear that they are no
longer logged in and their cart is not what they think it is.

## Actual Behaviour

`/checkout` renders normally with **no redirect**. The navbar reflects the logged-out state
("Signup / Login" instead of "Logged in as {name}"), but the page itself gives no indication
anything is wrong: the order review table renders with its normal headers, no line items, and
**Total Amount: Rs. 0**. A user who doesn't happen to notice the navbar or the zeroed total
could reasonably believe the page is just still loading, or that their cart is genuinely
empty — not that their session dropped and their in-progress order silently disappeared.

## Additional Context

This is a different failure mode than the confirmed logout/re-login case (TC-CART-003, cart
persists across a normal logout/login cycle). That case is an intentional user action with a
clear before/after. This case is passive session loss with no user-facing signal beyond a
zeroed total on an otherwise normal-looking checkout page.

## Impact

For a real e-commerce checkout flow, silently discarding cart contents without prompting
re-authentication is a business-risk-level issue, not just a UX nit: a customer mid-purchase
gets no indication their order was lost, and — worse — nothing prevents them from proceeding
through checkout with a Rs. 0 order if they don't notice the empty item list.

## Related

- Test case: `docs/test-cases/registration-login.md` — TC-LOGIN-005
- Risk: R-05 (`docs/risk-analysis.md`)
- Raw findings: `docs/exploration/findings-005-006-007-009.json`
