# Test Strategy — E-commerce QA Portfolio

**Application under test:** automationexercise.com (public demo, no SLA)

---

## 1. Objective

The objective is not exhaustive coverage but demonstrating how testing is prioritised under
realistic time constraints. Testing focuses on business-critical user journeys that would
typically influence a release decision: registration/login, search and filtering, cart,
checkout, and the supporting API layer (productsList, searchProduct, verifyLogin,
createAccount).

Out of scope:
- Payment gateway — the application does not process real payments.
- `deleteAccount` / `updateAccount` API — outside the original scope.
- Cross-browser matrix — timeboxed to Chromium; a time constraint, not an impact decision.
- Wishlist, Contact Us, Subscription — low impact on the core purchase flow.

## 2. Test Approach

| Type | Coverage |
|---|---|
| Smoke / health check | Yes — first step in CI |
| Functional E2E (UI) | Primary focus |
| API | Primary focus |
| Exploratory | Used for undocumented behaviour before writing assertions |
| Regression | Full suite on every run (currently small scope) |
| Visual / accessibility | Out of scope |

Test case coverage follows the full risk analysis (`docs/risk-analysis.md`), not only the
top risks — the goal is complete risk-based coverage, not just rescuing the worst-case
scenarios. Effort, however, is weighted by priority: Critical/High risks get the most
detailed scenarios (e.g. double-submit, concurrent sessions), while Low-priority areas get
a single representative test case each.

## 3. Strategy

- **Test data:** accounts use randomised emails (timestamp/UUID) so parallel CI runs don't
  collide and tests don't depend on a specific product/ID remaining in the catalogue.
- **Environment stability:** CI starts with a health-check step (site availability + a basic
  API endpoint). If it fails, the suite is skipped instead of producing dozens of meaningless
  timeouts.
- **API as a chain:** createAccount → verifyLogin is tested as a connected scenario as well
  as in isolation, since a created account should actually be verifiable.
- **Exploratory testing before automation:** several scenarios had no documented expected
  behaviour (cart persistence, duplicate item handling, checkout quantity changes, filter
  persistence, duplicate-email registration). These were explored manually first; the
  observed behaviour is now the baseline documented directly in the relevant test cases
  (`docs/test-cases/`). A baseline is not the same as correct behaviour — if observed
  behaviour looks like a bug, it is filed as an issue regardless of being used as the current
  regression baseline.
- **Not everything is automated.** Some scenarios (multi-tab interactions, rapid typing in
  search, reload mid-request) are documented but intentionally not automated — see
  `docs/tests-not-automated.md` for the rationale.
- **Defect triage:** severity (technical/user impact) and priority (urgency to fix) are
  assessed separately. Defects are logged with reproduction steps, expected/actual
  behaviour, environment, and severity/priority (tracked as GitHub Issues in this project).

## 4. Risk Assessment

Full analysis: [`docs/risk-analysis.md`](./risk-analysis.md). Prioritisation is driven by
impact on completing a purchase and on money/data correctness, not by estimated usage
frequency — this is why login, checkout, and cart pricing dominate the top risks.

Top risks:
1. Login/registration with valid data fails — blocks everything downstream (R-01, R-02).
2. Invalid credentials treated as valid, in UI or API (R-04, R-27) — security risk.
3. Inconsistent cart price/count across UI locations (R-15) — directly affects money.

## 5. Entry Criteria

- Application reachable (health check).
- Test email domain/format verified in advance.
- Baseline behaviour for previously-undocumented scenarios recorded (see section 3).

## 6. Exit Criteria

- No open Critical defects.
- High defects have an approved workaround or are explicitly accepted as residual risk.
- CI pipeline green on the main branch.

## 7. Environment & Tools

Playwright (TypeScript), Postman/Newman, GitHub Actions. Test environment is the public
production instance of automationexercise.com — no dedicated test environment exists.

## 8. Roles & Responsibilities

Solo QA engineer — analysis, test cases, and automation without a second-person code review.
A known limitation of the portfolio format, not an ideal state for a production project.

## 9. Assumptions

- The demo environment may change at any time (catalogue, prices, availability).
- Test data is not stable between runs.
- The third-party application may become unavailable without notice.
- Results are not authoritative for a production release decision — this is an exercise, not
  a certification of the application's quality.

## 10. Deliverables

- Risk analysis (`docs/risk-analysis.md`)
- Test cases (`docs/test-cases/`)
- Automation notes (`docs/automation-notes.md`)
- Coverage matrix (`docs/coverage-matrix.md`)
- Tests intentionally not automated (`docs/tests-not-automated.md`)
- Automated suite (Playwright + Postman)
- CI pipeline (GitHub Actions)
- Bug reports (GitHub Issues)

## 11. Traceability

Every risk in the risk analysis maps to at least one test case via its Risk ID — see
`docs/coverage-matrix.md`.

---

## Open Discussion Points

- How much third-party infrastructure (rate limiting, performance) is reasonable to test on
  a public demo application — risk of overloading someone else's server.
- Retry strategy for flaky tests caused by third-party instability — how many retries are
  acceptable before they start masking real bugs.
