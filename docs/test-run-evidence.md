# API Test Run Evidence — Repeatability Check

This documents runs of `postman/ecommerce-api.postman_collection.json` against the
`Production` environment, executed with multiple iterations in a single run to demonstrate
that the suite is repeatable: the same run can execute back-to-back without account
collisions or leftover test data, thanks to the unique test-data generation
(`Date.now()`-based emails) and the `Teardown` folder added after the first review pass.

Two runs are documented below: an initial check via the Postman app's Runner, and a
follow-up via the Newman CLI — the same tool and command CI runs on every push/PR to `main`.

## Postman Runner run (3 iterations)

### Run summary

| | |
|---|---|
| Run date | 2026-07-23 |
| Iterations | 3 |
| Requests per iteration | 22 |
| Total requests executed | 66 |
| Total assertions | 204 |
| Passed | 204 |
| Failed | 0 |
| Total run time | 15.1 s |
| Response time (min / avg / max) | 196 ms / 229 ms / 825 ms |
| HTTP 302 (environment instability) occurrences | 0 |

All 204 assertions passed across all 3 iterations — no flaky or order-dependent behaviour
observed.

### What this confirms

- **Teardown works across iterations.** `[Cleanup] DELETE deleteAccount - main test account`
  and `[Cleanup] DELETE deleteAccount - boundary test account` both passed 3/3 in every
  iteration, confirming that accounts created by `createAccount` are actually removed at the
  end of each run and don't accumulate or collide with the next iteration.
- **Collection-level transport check works as intended.** The shared
  `Transport status is 200, as implemented by this API` assertion ran and passed on 20 of the
  22 requests, correctly skipping the two malformed-input edge cases
  (`empty body`, `invalid Content-Type`) it's not meant to apply to.
- **No environment flakiness during this run.** Zero HTTP 302 redirects across 66 requests —
  the known instability documented in `docs/automation-notes.md` didn't surface here, but the
  guard logic (`isEnvironmentIssue`) remains in place for when it does.
- **Chained scenarios held up across iterations** (`createAccount` → `verifyLogin`,
  duplicate-email check) — each iteration's prerequisite checks passed, confirming the account
  created earlier in the same iteration is the one verified/rejected against later in that same
  iteration.

### Per-request results (3/3 iterations passing unless noted)

| Request | Assertions | Pass |
|---|---|---|
| [Critical] POST createAccount - happy path | 3 | 3/3 |
| [High] POST createAccount - missing mandatory field | 3 | 3/3 |
| [High] POST createAccount - duplicate email (chained) | 4 | 3/3 |
| [Low] POST createAccount - unexpected extra parameter | 3 | 3/3 |
| [Critical] POST verifyLogin - happy path (chained) | 4 | 3/3 |
| [Critical] POST verifyLogin - invalid credentials | 3 | 3/3 |
| [High] POST verifyLogin - missing email parameter | 3 | 3/3 |
| [Medium] POST verifyLogin - empty string email | 3 | 3/3 |
| [Medium] POST verifyLogin - whitespace-only email | 3 | 3/3 |
| [Medium] POST verifyLogin - empty body | 2 | 3/3 |
| [Medium] POST verifyLogin - invalid Content-Type | 2 | 3/3 |
| [Low] DELETE verifyLogin - unsupported method | 3 | 3/3 |
| [High] GET productsList - happy path | 4 | 3/3 |
| [Low] POST productsList - unsupported method | 3 | 3/3 |
| [High] POST searchProduct - happy path | 3 | 3/3 |
| [High] POST searchProduct - missing parameter | 3 | 3/3 |
| [High] POST searchProduct - injection-like input | 4 | 3/3 |
| [Low] DELETE productsList - Allow header mismatch | 3 | 3/3 |
| [Low] PUT productsList - Allow header mismatch | 3 | 3/3 |
| [Low] OPTIONS productsList - endpoint metadata | 3 | 3/3 |
| [Cleanup] DELETE deleteAccount - main test account | 3 | 3/3 |
| [Cleanup] DELETE deleteAccount - boundary test account | 3 | 3/3 |

### Notes / scope of this evidence

- This run was executed manually via the Postman app's Runner (3 iterations), not via the
  Newman CLI used in CI. CI (`.github/workflows/ci.yml`) runs the same collection through
  Newman with `--iteration-count 2` on every push/PR to `main`; this is a point-in-time,
  higher-iteration local check rather than a replacement for CI evidence.
- Response times are informational only — the collection does not assert a response-time
  threshold, and this is a public demo API without an SLA (see `docs/test-strategy.md`).
- Sample size (3 iterations, single machine, single point in time) is enough to show the
  suite doesn't collide with itself on repeat runs; it is not a substitute for tracking flake
  rate over many CI runs.

---

## Newman CLI run (5 iterations)

This run used the **Newman CLI** directly — the same tool and command CI runs on every push/PR
to `main` — rather than the Postman app's Runner used above. It's the stronger of the two data
points for that reason: it exercises the exact execution path CI uses, just with more
iterations (5 instead of CI's 2) to put more repeatability pressure on the suite.

```bash
newman run ecommerce-api.postman_collection.json \
    -e environments/production.postman_environment.json \
    --iteration-count 5 \
    --delay-request 500 \
    --reporters "cli,json" \
    --reporter-json-export newman-run-5x.json
```

### Run summary

| | |
|---|---|
| Iterations | 5 |
| Requests executed | 110 (22 requests × 5 iterations) |
| Test scripts | 220 |
| Prerequest scripts | 20 |
| Assertions | 340 |
| Failed (any category) | 0 |
| Total run duration | 1m 30.8s |
| Response time (avg / min / max / s.d.) | 215 ms / 193 ms / 777 ms / 58 ms |
| HTTP 302 occurrences (environment instability) | 0 |

All 340 assertions passed across all 5 iterations. `newman`'s own failure list
(`run.failures`) came back empty, independently confirming the CLI summary table.

### What this confirms

- **Teardown is reliable under Newman/CLI too, not just the Postman app.**
  `[Cleanup] DELETE deleteAccount - main test account` and
  `[Cleanup] DELETE deleteAccount - boundary test account` both returned HTTP 200 with a
  passing cleanup assertion in every one of the 5 iterations — the accounts created earlier in
  each iteration are consistently removed before the next one starts.
- **Every one of the 22 requests executed exactly 5 times** — no skipped or dropped requests
  across the run, and no single request's failure took down the rest of an iteration.
- **Zero response codes other than 200** across all 110 executions — no environment flakiness
  (no 302 redirects) surfaced during this run, consistent with the Postman Runner evidence
  above.
- **This is the same code path as CI.** CI's `--iteration-count 2` is a subset of what this
  run exercises at `--iteration-count 5`; a clean 5-iteration Newman run is a reasonable proxy
  for confidence that CI's 2-iteration run will also stay green, without needing to push a
  throwaway commit just to test it.

### Notes / scope of this evidence

- Same caveats as the Postman Runner evidence above: no response-time assertion is made by the
  collection, this is a public demo API without an SLA, and this is a single point-in-time run,
  not a tracked flake rate over many CI executions.
- The raw Newman JSON report is committed at `docs/evidence/newman-run-5x.json` for anyone who
  wants to verify the numbers above directly (`run.stats`, `run.executions`,
  `run.failures`) rather than trusting the summary table.
