# Test Cases — Registration & Login

## TC-LOGIN-001 — Successful registration with valid data

- **Objective:** Verify a new user can register with valid data.
- **Risk:** R-01
- **Preconditions:** Email is not yet registered.
- **Data:** Randomly generated unique email; password meeting minimum requirements.
- **Steps:** Complete the signup form (name, email) → complete account details → submit.
- **Expected Result:** "Account Created!" confirmation is displayed; user is logged in;
  header shows the user's name.
- **Tags:** `@smoke` `@critical` `@registration`

## TC-LOGIN-002 — Successful login with valid credentials

- **Objective:** Verify an existing user can log in.
- **Risk:** R-02
- **Preconditions:** Account exists.
- **Data:** Valid email and password.
- **Steps:** Submit the login form with valid credentials.
- **Expected Result:** User is redirected to the home page; header shows "Logged in as
  {name}".
- **Tags:** `@smoke` `@critical` `@login`

## TC-LOGIN-003 — Registration with an already-registered email

- **Objective:** Verify duplicate registration is rejected.
- **Risk:** R-03
- **Preconditions:** An account with the given email already exists.
- **Data:** Existing account's email.
- **Steps:** Submit the signup form using the existing email.
- **Expected Result:** Error message "Email Address already exist!" is shown; no new account
  is created.
- **Tags:** `@negative` `@high` `@registration`

## TC-LOGIN-004 — Login with an incorrect password

- **Objective:** Verify invalid credentials are rejected.
- **Risk:** R-04
- **Preconditions:** Account exists.
- **Data:** Valid email, random invalid password.
- **Steps:** Submit the login form with a valid email and a wrong password.
- **Expected Result:** Error message "Your email or password is incorrect!" is shown; user
  remains logged out (header does not show a logged-in state).
- **Tags:** `@negative` `@critical` `@security` `@login`

## TC-LOGIN-005 — Session drops during an active purchase

- **Objective:** Verify graceful handling of session loss mid-flow.
- **Risk:** R-05
- **Preconditions:** Logged-in user with an item already in the cart.
- **Data:** Valid account; invalidated session token/cookie.
- **Steps:** Log in, add a product to the cart, invalidate the session, attempt to proceed
  to checkout.
- **Expected Result:** User is redirected to login; after re-authenticating, the cart
  contents are preserved (cart is tied to the account — confirmed, see R-17).
- **Tags:** `@edge-case` `@high` `@session`

## TC-LOGIN-006 — Email format validation

- **Objective:** Verify the registration form rejects malformed email addresses.
- **Risk:** R-06
- **Preconditions:** User is on the registration form.
- **Data:** Invalid formats: `test`, `test@`, `test@@test.com`, empty string.
- **Steps:** Submit the signup form with each invalid value (data-driven).
- **Expected Result:** Form is not submitted; a validation error is shown for each case.
- **Tags:** `@boundary` `@medium` `@registration`

## TC-LOGIN-007 — Password field boundary values

- **Objective:** Verify the registration form enforces minimum password requirements.
- **Risk:** R-07
- **Preconditions:** User is on the registration form.
- **Data:** Empty password, single character, very long string (200+ characters).
- **Steps:** Submit the signup form with each value (data-driven).
- **Expected Result:** Behaviour is documented as a baseline for whichever values are
  rejected/accepted — the site does not document password rules, so this test also serves to
  establish what the actual minimum requirement is.
- **Tags:** `@boundary` `@medium` `@registration`

## TC-LOGIN-008 — Logout

- **Objective:** Verify a logged-in user can log out.
- **Risk:** R-08 (session integrity, general)
- **Preconditions:** User is logged in.
- **Data:** –
- **Steps:** Click "Logout".
- **Expected Result:** User is redirected to the login page; header no longer shows a
  logged-in state; accessing an account-only page (e.g. cart under the account) reflects the
  logged-out state.
- **Tags:** `@smoke` `@high` `@login`

## TC-LOGIN-009 — Double-submit on "Create Account"

- **Objective:** Verify rapid double-clicking the submit button doesn't create duplicate
  accounts or duplicate requests.
- **Risk:** R-09
- **Preconditions:** Email is not yet registered.
- **Data:** Randomly generated unique email.
- **Steps:** Fill in the signup form, click "Create Account" twice in rapid succession.
- **Expected Result:** Exactly one account is created; no duplicate-request error surfaces to
  the user.
- **Tags:** `@edge-case` `@medium` `@registration`

## TC-LOGIN-010 — Session state across concurrent tabs

- **Objective:** Verify logging out in one tab is reflected in another open tab.
- **Risk:** R-10
- **Preconditions:** User is logged in, with the same account open in two browser tabs.
- **Data:** Valid account.
- **Steps:** Log in on Tab A. Open Tab B with the same session. Log out on Tab A. Reload
  Tab B.
- **Expected Result:** After reload, Tab B reflects the logged-out state (does not continue
  to show "Logged in as {name}").
- **Tags:** `@edge-case` `@medium` `@session`
