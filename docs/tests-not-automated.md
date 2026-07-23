# Tests Intentionally Not Automated

Automation isn't the goal by itself — some scenarios are more efficiently covered by
occasional manual/exploratory checks than by a maintained automated test. Documenting them
here keeps them visible without inflating the automated suite with low-value or inherently
flaky checks.

| Scenario | Why it's not automated |
|---|---|
| Multi-tab cart synchronisation (remove item in Tab B, check Tab A) | Low value relative to cost — the account-level cart persistence (TC-CART-003) already covers the underlying mechanism; a dedicated multi-tab cart test adds little beyond that. |
| Reload triggered immediately during an in-flight "Add to cart" request | Timing-dependent; inherently flaky in CI, better suited to occasional manual/exploratory checks. |
| Rapid retyping in the search box (race conditions / autocomplete) | Requires human judgement to assess "did it feel right", not a binary pass/fail. |
| Visual layout / pixel-level regressions | Explicitly out of scope for this portfolio (see test-strategy.md) — low value relative to cost for a demo application with no design system to protect. |
| Undocumented behaviour not yet explored | Anything not yet manually verified is not automated until an expected-behaviour baseline exists (see the "exploratory testing before automation" principle in test-strategy.md). |
| Third-party ad/banner content interactions | Not part of the application under test; unstable and outside test control. |

If a scenario in this list turns out to reveal a real defect during manual exploration, it
gets promoted to a proper test case with a confirmed baseline — the same process used for the
five scenarios documented in `docs/automation-notes.md`.
