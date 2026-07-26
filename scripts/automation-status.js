#!/usr/bin/env node
/**
 * Cross-references documented UI test cases (docs/test-cases/*.md) against
 * what's actually implemented in Playwright (playwright/tests/*.spec.ts).
 *
 * Scope: Playwright/UI only. The API layer (TC-API-*) is intentionally
 * excluded - Postman request names don't carry TC-API-### IDs (they're
 * tagged by severity, e.g. "[Critical] POST createAccount - happy path"),
 * so there's no reliable way to cross-reference them the same way. API
 * coverage is tracked via docs/coverage-matrix.md instead.
 *
 * Three states per documented TC-ID:
 *   - Automated:    ID found in a playwright/tests/*.spec.ts test() or
 *                    test.describe() title.
 *   - Manual-only:   ID is in the MANUAL_ONLY map below, with a rationale.
 *                    A deliberate decision, not a gap.
 *   - NOT COVERED:  neither of the above - a real gap. Documented, not
 *                    automated, and no rationale on record for why not.
 *
 * Also flags the reverse drift: a TC-ID referenced in a spec file that
 * doesn't exist in any docs/test-cases/*.md file (test written without a
 * matching design doc, or doc renamed/deleted after the test was written).
 *
 * Usage:
 *   node scripts/automation-status.js
 *   node scripts/automation-status.js --check   (exit 1 on NOT COVERED or drift - for CI)
 *
 * Writes docs/automation-status.md and prints the same summary to stdout.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const TEST_CASE_DOCS = [
  { file: 'registration-login.md', module: 'Registration & Login' },
  { file: 'search-filtering.md', module: 'Search & Filtering' },
  { file: 'cart.md', module: 'Cart' },
  { file: 'checkout.md', module: 'Checkout' },
];
const SPEC_DIR = path.join(REPO_ROOT, 'playwright', 'tests');
const OUTPUT_FILE = path.join(REPO_ROOT, 'docs', 'automation-status.md');

/**
 * Deliberate non-automation decisions for a documented TC-ID, with the
 * reason on record. Empty today - all 26 documented UI test cases are
 * automated - but the mechanism stays here for the next one that isn't.
 * Scenario-level (non-TC-ID) manual decisions belong in
 * docs/tests-not-automated.md instead, not here.
 *
 * Example entry:
 *   'TC-CART-999': 'Requires a second physical device to verify push
 *                    notifications; not automatable in this environment.',
 */
const MANUAL_ONLY = {};

const TC_ID_PATTERN = /TC-[A-Z]+-\d+/;

function extractDocumentedIds(mdContent) {
  // Matches "## TC-XXX-### — Title" headers (also tolerates a plain "-").
  const headerPattern = /^##\s+(TC-[A-Z]+-\d+)\s*[—-]\s*(.+)$/gm;
  const ids = new Map();
  let match;
  while ((match = headerPattern.exec(mdContent)) !== null) {
    ids.set(match[1], match[2].trim());
  }
  return ids;
}

function extractSpecIds(tsContent) {
  // Matches the first string literal passed to test(...) or
  // test.describe(...), regardless of quote style. Deliberately loose -
  // this is a status report, not a compiler, and false negatives here are
  // worse than the small risk of a false positive.
  const titlePattern = /test(?:\.describe)?\(\s*[`'"]([^`'"]*)[`'"]/g;
  const ids = new Set();
  let match;
  while ((match = titlePattern.exec(tsContent)) !== null) {
    const idMatch = match[1].match(TC_ID_PATTERN);
    if (idMatch) ids.add(idMatch[0]);
  }
  return ids;
}

function loadSpecIds() {
  const allIds = new Set();
  const files = fs.readdirSync(SPEC_DIR).filter((f) => f.endsWith('.spec.ts'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(SPEC_DIR, file), 'utf-8');
    for (const id of extractSpecIds(content)) allIds.add(id);
  }
  return allIds;
}

function statusFor(id, specIds) {
  if (specIds.has(id)) return { state: 'automated', label: '✅ Automated' };
  if (MANUAL_ONLY[id]) return { state: 'manual', label: `🟡 Manual-only — ${MANUAL_ONLY[id]}` };
  return { state: 'not_covered', label: '🔴 NOT COVERED' };
}

function main() {
  const checkMode = process.argv.includes('--check');
  const specIds = loadSpecIds();
  const documentedIds = new Set();

  const moduleResults = [];
  let automatedCount = 0;
  let manualCount = 0;
  let notCoveredCount = 0;

  for (const { file, module } of TEST_CASE_DOCS) {
    const filePath = path.join(REPO_ROOT, 'docs', 'test-cases', file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const idsWithTitles = extractDocumentedIds(content);

    const rows = [];
    for (const [id, title] of idsWithTitles) {
      documentedIds.add(id);
      const { state, label } = statusFor(id, specIds);
      if (state === 'automated') automatedCount++;
      else if (state === 'manual') manualCount++;
      else notCoveredCount++;
      rows.push({ id, title, label });
    }
    moduleResults.push({ module, rows });
  }

  // Reverse drift: IDs in spec files with no matching doc entry.
  const undocumented = [...specIds].filter((id) => !documentedIds.has(id)).sort();

  const totalDocumented = automatedCount + manualCount + notCoveredCount;
  const lines = [];
  lines.push('# Automation Status — Playwright (UI)');
  lines.push('');
  lines.push(
    `Generated by \`scripts/automation-status.js\`. Cross-references ` +
      `\`docs/test-cases/*.md\` against \`playwright/tests/*.spec.ts\`. ` +
      `API layer (TC-API-*) is out of scope here - see \`docs/coverage-matrix.md\`.`
  );
  lines.push('');
  lines.push(
    `**Summary:** ${automatedCount}/${totalDocumented} automated, ` +
      `${manualCount} manual-only (documented rationale), ` +
      `${notCoveredCount} NOT COVERED.`
  );
  lines.push('');

  for (const { module, rows } of moduleResults) {
    lines.push(`## ${module}`);
    lines.push('');
    lines.push('| Test Case | Title | Status |');
    lines.push('|---|---|---|');
    for (const { id, title, label } of rows) {
      lines.push(`| ${id} | ${title} | ${label} |`);
    }
    lines.push('');
  }

  if (undocumented.length > 0) {
    lines.push('## ⚠️ Drift: implemented but undocumented');
    lines.push('');
    lines.push(
      'These IDs appear in a Playwright spec file but have no matching ' +
        '`## TC-ID` header in `docs/test-cases/*.md`. Either the doc is ' +
        'missing/renamed, or the test was written without one.'
    );
    lines.push('');
    for (const id of undocumented) {
      lines.push(`- ${id}`);
    }
    lines.push('');
  }

  const output = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log(output);
  console.log(`Written to ${path.relative(REPO_ROOT, OUTPUT_FILE)}`);

  if (checkMode && (notCoveredCount > 0 || undocumented.length > 0)) {
    console.error(
      `\n--check failed: ${notCoveredCount} NOT COVERED test case(s), ` +
        `${undocumented.length} undocumented spec ID(s). Either automate, ` +
        `add a MANUAL_ONLY entry with rationale, or fix the doc.`
    );
    process.exit(1);
  }
}

main();
