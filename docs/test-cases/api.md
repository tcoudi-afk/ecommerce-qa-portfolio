# Test Cases — API Layer

Source of truth: `automationexercise.com/api_list`.

## TC-API-001 — verifyLogin with valid credentials

- **Objective:** Verify a valid login is confirmed by the API.
- **Risk:** R-26
- **Endpoint:** `POST /api/verifyLogin`
- **Preconditions:** Account exists (created via `createAccount` in setup).
- **Data:** Valid email + password.
- **Expected Result:** HTTP 200; body contains `"User exists!"`.
- **Tags:** `@smoke` `@critical` `@api`

## TC-API-002 — verifyLogin with invalid credentials

- **Objective:** Verify invalid credentials are correctly rejected.
- **Risk:** R-27
- **Endpoint:** `POST /api/verifyLogin`
- **Data:** Non-existent email/password.
- **Expected Result:** HTTP 404; body contains `"User not found!"`. (If it returns 200
  instead, that's a security-relevant defect — the system would be confirming a
  non-existent account.)
- **Tags:** `@negative` `@critical` `@security` `@api`

## TC-API-003 — verifyLogin without the email parameter

- **Objective:** Verify missing required parameters are rejected with a clear error.
- **Risk:** R-28
- **Endpoint:** `POST /api/verifyLogin`
- **Data:** `password` only.
- **Expected Result:** HTTP 400; body contains `"email or password parameter is missing"`.
- **Tags:** `@negative` `@high` `@api`

## TC-API-004 — verifyLogin with an empty request body

- **Objective:** Verify an empty body is handled with a proper error, not a server error.
- **Risk:** R-39
- **Endpoint:** `POST /api/verifyLogin`
- **Data:** Empty body.
- **Expected Result:** HTTP 400 with a descriptive message — not a 500.
- **Tags:** `@negative` `@medium` `@api`

## TC-API-005 — verifyLogin with an invalid Content-Type

- **Objective:** Verify malformed request encoding is handled gracefully.
- **Risk:** R-39
- **Endpoint:** `POST /api/verifyLogin`
- **Data:** Valid credentials sent as `application/json` instead of form-encoded.
- **Expected Result:** A clear error response — not a 500 or a silently ignored body.
- **Tags:** `@negative` `@medium` `@api`

## TC-API-006 — verifyLogin with a DELETE request (unsupported method)

- **Objective:** Verify unsupported HTTP methods are rejected.
- **Risk:** R-29
- **Endpoint:** `DELETE /api/verifyLogin`
- **Expected Result:** HTTP 405, `"This request method is not supported."`
- **Tags:** `@negative` `@low` `@api`

## TC-API-007 — productsList GET

- **Objective:** Verify the product list endpoint returns a well-formed response.
- **Risk:** R-30
- **Endpoint:** `GET /api/productsList`
- **Expected Result:** HTTP 200; JSON contains a `products` array with a valid structure
  (id, name, price, brand, category) — validated against a schema, not just checked for
  presence.
- **Tags:** `@smoke` `@high` `@api`

## TC-API-008 — productsList POST (unsupported method)

- **Objective:** Verify unsupported methods on a read-only endpoint are rejected.
- **Risk:** R-31
- **Endpoint:** `POST /api/productsList`
- **Expected Result:** HTTP 405, `"This request method is not supported."`
- **Tags:** `@negative` `@low` `@api`

## TC-API-009 — searchProduct with a valid term

- **Objective:** Verify the search endpoint returns products matching the term.
- **Risk:** R-32
- **Endpoint:** `POST /api/searchProduct`
- **Data:** `search_product=dress`
- **Expected Result:** HTTP 200; returned products match the search term (compared against
  an expected set computed from `productsList`, same principle as TC-SEARCH-001).
- **Tags:** `@functional` `@high` `@api`

## TC-API-010 — searchProduct without the required parameter

- **Objective:** Verify a missing required parameter is rejected with a clear error.
- **Risk:** R-32
- **Endpoint:** `POST /api/searchProduct`
- **Expected Result:** HTTP 400, `"search_product parameter is missing"`.
- **Tags:** `@negative` `@high` `@api`

## TC-API-011 — searchProduct with injection-like input

- **Objective:** Verify malicious-looking input is handled safely (robustness, not a
  penetration test).
- **Risk:** R-33
- **Endpoint:** `POST /api/searchProduct`
- **Data (data-driven):** `' OR 1=1--`, `<script>alert(1)</script>`, `%`
- **Expected Result:** No HTTP 500; no stack trace or internal detail in the response; no
  unescaped reflection of the input.
- **Tags:** `@security` `@robustness` `@high` `@api`

## TC-API-012 — createAccount with valid data

- **Objective:** Verify a new account can be created via the API.
- **Risk:** R-34
- **Endpoint:** `POST /api/createAccount`
- **Preconditions:** Email not yet registered.
- **Data:** Randomly generated unique email + all required fields.
- **Expected Result:** HTTP 201, `"User created!"`.
- **Tags:** `@smoke` `@critical` `@api`

## TC-API-013 — createAccount with a missing mandatory field

- **Objective:** Verify missing required fields are rejected with a clear error.
- **Risk:** R-36
- **Endpoint:** `POST /api/createAccount`
- **Data:** All required fields except one (e.g. `firstname` omitted).
- **Expected Result:** A clear validation error is returned — not a 500, not a silent
  partial account creation.
- **Tags:** `@negative` `@high` `@api`

## TC-API-014 — createAccount with an already-registered email

- **Objective:** Confirm the (previously undocumented) behaviour for duplicate registration
  via the API.
- **Risk:** R-35
- **Endpoint:** `POST /api/createAccount`
- **Preconditions:** Account with the given email already exists.
- **Data:** Existing account's email, otherwise valid data.
- **Expected Result:** **Confirmed:** HTTP 400, `"Email already exists!"`. The original
  account is unaffected (verified via `verifyLogin` with the original password).
- **Tags:** `@negative` `@high` `@api`

## TC-API-015 — Empty string vs. missing vs. whitespace-only parameter

- **Objective:** Verify these three distinct cases are not treated interchangeably.
- **Risk:** R-37
- **Endpoint:** `POST /api/verifyLogin` (representative; same principle applies to other
  endpoints with required parameters)
- **Data (data-driven):** `email=""`, `email` omitted entirely, `email="   "`.
- **Expected Result:** Each case returns a consistent, deliberate response (e.g. all three
  return 400) — documented explicitly, not assumed to behave the same.
- **Tags:** `@boundary` `@medium` `@api`

## TC-API-016 — Unexpected extra parameters

- **Objective:** Verify the API's handling of undocumented extra fields in the request.
- **Risk:** R-38
- **Endpoint:** `POST /api/createAccount`
- **Data:** All required fields plus one undocumented extra field (e.g. `randomField=test`).
- **Expected Result:** The extra field is ignored and the request succeeds as normal, or is
  explicitly rejected — documented as a baseline either way.
- **Tags:** `@boundary` `@low` `@api`
