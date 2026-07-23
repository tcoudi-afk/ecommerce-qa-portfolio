# E-commerce QA Portfolio

![CI](https://github.com/<your-github-username>/ecommerce-qa-portfolio/actions/workflows/ci.yml/badge.svg)

End-to-end QA portfolio demonstrating risk-based test design, manual test cases, UI
automation (Playwright), API testing (Postman/Newman), and CI execution, using a public
e-commerce application as the target.

## Highlights

- Risk-based test strategy (39 identified risks, prioritised by impact × likelihood)
- 35+ manual test cases across 5 modules, each traceable to a specific risk
- Playwright UI automation with Page Object Model
- Postman/Newman API test suite
- GitHub Actions CI pipeline
- Documented exploratory testing findings, including one confirmed candidate defect
- Explicit "tests intentionally not automated" section with reasoning

```
Risk Analysis → Test Strategy → Test Cases → Automation → CI → Reports
```

## What This Demonstrates

- UI functional testing, including negative and boundary scenarios
- API contract testing (status codes, error handling, edge-case parameter values)
- Risk-based prioritisation and scope decisions
- Test data management for a shared, unstable public environment
- Exploratory testing to establish behaviour baselines before automating
- Business-outcome assertions rather than implementation-detail checks

## Application Under Test

- **Web:** https://automationexercise.com
- **API:** https://automationexercise.com/api_list

Scope: registration/login, product search & filtering, cart, checkout, and the API layer
(createAccount, verifyLogin, searchProduct, productsList). Full scope decisions and
rationale: [`docs/test-strategy.md`](./docs/test-strategy.md).

The project intentionally focuses on business-critical workflows instead of exhaustive
coverage of every application feature.

## Known Limitations

- Public demo application, shared with other users — no SLA, no dedicated test environment.
- No access to source code or backend — black-box testing only.
- Test data (catalogue, product IDs) may change without notice.

## Tech Stack

| Layer | Tool |
|---|---|
| UI automation | Playwright (TypeScript) |
| API testing | Postman / Newman |
| CI/CD | GitHub Actions |
| Documentation | Markdown |

## Repository Structure

```
ecommerce-qa-portfolio/
├── docs/
│   ├── test-strategy.md        # test strategy and approach
│   ├── risk-analysis.md        # risk-based analysis (39 risks)
│   ├── coverage-matrix.md      # risk → test case traceability
│   ├── automation-notes.md     # Playwright implementation decisions
│   ├── tests-not-automated.md  # scenarios documented but not automated, and why
│   └── test-cases/             # test cases by module
├── postman/                    # API collection and environments
├── playwright/                 # UI automation (tests + Page Object Model)
└── .github/workflows/          # CI pipeline
```

## Running Tests Locally

### Requirements

- Node.js 22+
- npm
- Git

### Playwright (UI tests)

```bash
cd playwright
npm install
npx playwright test
```

### Postman / Newman (API tests)

```bash
cd postman
npm install -g newman
newman run ecommerce-api.postman_collection.json -e environments/production.postman_environment.json
```

## Author

**Tomáš Koudelka**
[LinkedIn](https://linkedin.com/in/tomas-koudelka-a95aab88/)
