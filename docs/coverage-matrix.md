# Coverage Matrix — Risk → Test Case

Every risk from `docs/risk-analysis.md` mapped to the test case(s) covering it.

| Risk ID | Risk (short) | Test Case(s) |
|---|---|---|
| R-01 | Registration with valid data fails | TC-LOGIN-001 |
| R-02 | Login with valid data fails | TC-LOGIN-002 |
| R-03 | Duplicate email accepted without error | TC-LOGIN-003 |
| R-04 | Wrong password allows login | TC-LOGIN-004 |
| R-05 | Session expires/drops mid-purchase | TC-LOGIN-005 |
| R-06 | Missing email format validation | TC-LOGIN-006 |
| R-07 | Password accepted without validation | TC-LOGIN-007 |
| R-08 | Unclear error messages / session integrity | TC-LOGIN-008 |
| R-09 | Double-submit creates duplicate accounts | TC-LOGIN-009 |
| R-10 | Session state inconsistent across tabs | TC-LOGIN-010 |
| R-11 | False positive / no-match search results | TC-SEARCH-001, TC-SEARCH-002, TC-SEARCH-004 |
| R-12 | False negative search results | TC-SEARCH-001, TC-SEARCH-004 |
| R-13 | Filter combination incorrect | TC-SEARCH-003 |
| R-14 | Filter resets on reload | TC-SEARCH-005 |
| R-15 | Count/price inconsistency across UI | TC-CART-001 |
| R-16 | Duplicate add doesn't merge quantity | TC-CART-002 |
| R-17 | Cart persistence after logout | TC-CART-003 |
| R-18 | Cart state after refresh | TC-CART-004 |
| R-19 | Remove item doesn't update total | TC-CART-005 |
| R-20 | Checkout cannot be completed | TC-CHECKOUT-001 |
| R-21 | Checkout with empty cart | TC-CHECKOUT-002 |
| R-22 | Order not in history | TC-CHECKOUT-003 |
| R-23 | Quantity not adjustable at checkout | TC-CHECKOUT-004 |
| R-24 | Double-submit "Place Order" | TC-CHECKOUT-005 |
| R-25 | Refresh after confirmation | TC-CHECKOUT-006 |
| R-26 | verifyLogin valid credentials fail | TC-API-001 |
| R-27 | verifyLogin invalid returns 200 | TC-API-002 |
| R-28 | verifyLogin missing parameter | TC-API-003 |
| R-29 | verifyLogin DELETE not rejected | TC-API-006 |
| R-30 | productsList corrupted/empty list | TC-API-007 |
| R-31 | productsList POST not rejected | TC-API-008 |
| R-32 | searchProduct invalid param handling | TC-API-009, TC-API-010 |
| R-33 | searchProduct injection-like input | TC-API-011 |
| R-34 | createAccount valid data fails | TC-API-012 |
| R-35 | createAccount duplicate email | TC-API-014 |
| R-36 | createAccount missing mandatory field | TC-API-013 |
| R-37 | Empty vs. missing vs. whitespace param | TC-API-015 |
| R-38 | Unexpected extra parameters | TC-API-016 |
| R-39 | Empty body / invalid Content-Type | TC-API-004, TC-API-005 |

**Coverage summary:** 39/39 risks have at least one mapped test case. 36 test cases total
across 5 modules.
