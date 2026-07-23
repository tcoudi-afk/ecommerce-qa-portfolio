# Risk-Based Analysis — automationexercise.com

Risk = Impact × Likelihood of failure. Impact reflects effect on completing a purchase, on
money/data correctness, or on security. Likelihood reflects how complex or fragile the
underlying behaviour is.

Each risk has an ID (R-XX) referenced by test cases in `docs/test-cases/` and by
`docs/coverage-matrix.md`.

---

## 1. Registration & Login

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-01 | Registration with valid data fails | High | Low–Medium | Critical |
| R-02 | Login with valid data fails | High | Low–Medium | Critical |
| R-03 | Duplicate email accepted without error | Medium | Medium | High |
| R-04 | Wrong password allows login | High (security) | Low | Critical |
| R-05 | Session expires/drops mid-purchase | High | Medium | High |
| R-06 | Missing email format validation | Medium | Medium | Medium |
| R-07 | Password accepted without minimum requirement validation | Medium | Medium | Medium |
| R-08 | Unclear error messages | Low | High | Low |
| R-09 | Double-submit on "Create Account" creates duplicate accounts/requests | Medium | Low | Medium |
| R-10 | Session state inconsistent across concurrent tabs (e.g. logout in one tab not reflected in another) | Medium | Low | Medium |

## 2. Search & Filter

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-11 | False positive search results | Low | Medium | Low–Medium |
| R-12 | False negative search results | Medium | Medium | Medium |
| R-13 | Filter combination doesn't narrow results correctly | Low | Medium | Low–Medium |
| R-14 | Filter resets without URL change/reload | Low | Low | Low |

## 3. Cart

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-15 | Item count/price inconsistent across UI locations (header vs. cart page) | High | Medium | Critical |
| R-16 | Adding the same item twice doesn't merge quantity | Medium | Medium | Medium |
| R-17 | Cart doesn't persist after logout | Medium | Medium | Medium |
| R-18 | Cart state lost on page refresh | Medium | Low | Medium |
| R-19 | Removing an item doesn't correctly update count/total | Medium | Medium | Medium |

## 4. Checkout

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-20 | Checkout cannot be completed | High | Low–Medium | Critical |
| R-21 | Checkout allowed with an empty cart | Low | Medium | Medium |
| R-22 | Order doesn't appear in order history | Medium–High | Low | High |
| R-23 | Quantity cannot be adjusted on the checkout page | Medium | Medium | Medium |
| R-24 | Double-submit on "Place Order" creates duplicate orders | High | Low | High |
| R-25 | Refreshing after order confirmation creates a duplicate order | High | Low | High |

## 5. API Layer

Source of truth: `automationexercise.com/api_list` (verified 2026-07-22).

### verifyLogin

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-26 | Valid credentials don't return 200 / "User exists!" | High | Low | Critical |
| R-27 | Invalid credentials return 200 instead of 404 | High (security) | Low | Critical |
| R-28 | Missing email/password doesn't return 400 | Medium | Medium | High |
| R-29 | DELETE method doesn't return 405 | Low–Medium | Low | Low–Medium |
| R-39 | Empty request body / invalid Content-Type not handled with a proper error | Medium | Low | Medium |

### productsList

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-30 | GET returns 200 but the product list is corrupted or empty | High | Low | High |
| R-31 | POST doesn't return 405 | Low–Medium | Low | Low–Medium |

### searchProduct

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-32 | Negative/empty parameter value returns 200 instead of 400 | High | Medium | High |
| R-33 | Special characters / injection-like input cause a 500 or expose internal detail | High (robustness) | Low | High |

### createAccount

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-34 | Valid data doesn't return 201 / "User created!" | High | Low | Critical |
| R-35 | Registration with an existing email — behaviour undocumented | High | Low | High |
| R-36 | Missing mandatory field doesn't return a proper validation error | High | Low | High |

### Cross-endpoint

| ID | Risk | Impact | Likelihood | Priority |
|---|---|---|---|---|
| R-37 | Empty string vs. missing vs. whitespace-only parameter handled inconsistently | Medium | Medium | Medium |
| R-38 | Unexpected extra parameters not handled predictably | Low–Medium | Medium | Low–Medium |
