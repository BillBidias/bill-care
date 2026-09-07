# P20 — DEV / TOOLING DEPENDENCY SECURITY AUDIT & REMEDIATION

Date: 2026-09-07
Status: **VALIDATED FOR SECURITY SCOPE — FULL NPM AUDIT CLEAN — EXISTING LINT / DEPRECATION DEBT OPEN**

## 1. Objective

P20 addresses the dependency-security findings that remained outside the production dependency tree after P19.

The phase is intentionally limited to dependency security and non-regression. It does not modify application behavior, clinical safety logic, Supabase/RLS/Auth, Stripe/payment authority, routing, Patient App, Admin, entitlement/enrollment/progress, legal rules or commercial-release gates.

## 2. Baseline inherited from P19

P19 ended with:

- production dependency audit: **0 vulnerabilities**;
- full dependency-tree audit: **9 vulnerabilities**;
- severity: **7 high, 2 moderate, 0 critical**.

P20 had to preserve the clean production tree while determining whether the remaining development/tooling findings could be safely remediated.

## 3. Baseline vulnerability ownership

The nine full-tree findings were mapped to three main tooling chains.

### ESLint 9.32.0 chain

Findings included:

- `@humanfs/node`;
- `ajv`;
- `minimatch`;
- `brace-expansion`;
- `js-yaml`;
- `flatted`.

These were reached through ESLint / ESLint configuration and cache dependencies.

### Autoprefixer 10.4.21 chain

- `browserslist`.

### jsdom 20.0.3 chain

- `form-data`;
- `ws`.

`jsdom` is used by the test environment, not by the browser runtime dependency tree.

## 4. No blind npm audit fix

A read-only command was used to inspect npm's automatic proposal:

`npm audit fix --package-lock-only --dry-run --json`

It proposed no package changes.

P20 therefore did **not** use:

- blind `npm audit fix`;
- `npm audit fix --force`;
- arbitrary major framework migrations merely to silence the audit.

## 5. Major migrations deliberately avoided

Registry inspection showed newer major generations such as ESLint 10 and jsdom 30.

They were not adopted in P20 because they would unnecessarily widen the regression surface of a security-remediation phase.

Instead P20 first searched for supported or compatible same-major remediation paths.

## 6. Implemented dependency changes

Direct development dependencies were updated within their existing major versions:

- `@eslint/js`: `^9.32.0` → `^9.39.5`;
- `eslint`: `^9.32.0` → `^9.39.5`;
- `autoprefixer`: `^10.4.21` → `^10.5.5`;
- `typescript-eslint`: `^8.38.0` → `^8.69.0`.

`jsdom` remains on `^20.0.3` because there is no newer 20.x release and a major migration was unnecessary for this phase.

Targeted parent-scoped overrides were added where the parent version range already accepts the patched transitive version:

- `jsdom` → `form-data 4.0.6`;
- `jsdom` → `ws 8.21.0`;
- `eslint` → `@humanfs/node 0.16.8`;
- `flat-cache` → `flatted 3.4.2`.

Existing P19 production-security overrides remain preserved.

## 7. Lint non-regression finding

P20 added lint observation because ESLint itself was being updated.

The current `main` baseline before P20 already produced:

- **42 lint problems**;
- **17 errors**;
- **25 warnings**.

The P20 candidate produced exactly the same counts:

- **42 lint problems**;
- **17 errors**;
- **25 warnings**.

Therefore P20 did not introduce a lint regression.

Important: this does **not** mean lint is clean. Existing lint debt remains open and must be handled separately instead of being silently mixed into a dependency-security phase.

Examples of existing lint debt include:

- `@typescript-eslint/no-explicit-any` findings in data repositories and Stripe webhook code;
- `@typescript-eslint/no-empty-object-type` in UI components;
- `@typescript-eslint/no-require-imports` in Tailwind configuration;
- React Fast Refresh warnings;
- a React Hooks exhaustive-deps warning.

## 8. Final validation

Final GitHub Actions run:

**34132715661**

Environment:

- Node `22.23.2`;
- npm `10.9.8`.

Results:

- lockfile refresh: PASS;
- `npm ci`: PASS;
- lint regression snapshot: baseline preserved at 42 / 17 / 25;
- `npm test`: PASS;
- test files: **15/15 PASS**;
- tests: **127/127 PASS**;
- Program Finder GREEN / AMBER / RED regression tests: PASS;
- `npm run build`: PASS with Vite `7.3.6`;
- `npm audit`: **0 vulnerabilities**;
- `npm audit --omit=dev`: **0 vulnerabilities**.

Final resolved security-relevant versions include:

- `eslint 9.39.5`;
- `@eslint/js 9.39.5`;
- `@humanfs/node 0.16.8`;
- `flatted 3.4.2`;
- `autoprefixer 10.5.5`;
- `browserslist 4.28.9`;
- `jsdom 20.0.3` with `form-data 4.0.6` and `ws 8.21.0`;
- `typescript-eslint 8.69.0`.

The exact validated lockfile was persisted after the successful validation run.

## 9. Security result

### Full dependency tree

Before P20:

- 9 vulnerabilities;
- 7 high;
- 2 moderate;
- 0 critical.

After P20:

- **0 vulnerabilities**.

### Production dependency tree

Before P20:

- 0 vulnerabilities.

After P20:

- **0 vulnerabilities**.

P20 therefore closes the npm-audit vulnerability debt known at the time of this validation, while preserving the clean production result established by P19.

## 10. Residual technical debt — not security findings in the final npm audit

A clean npm audit does not mean the tooling stack has no maintenance debt.

Known remaining warnings/debt include:

- ESLint 9.39.5 is reported by npm metadata as no longer supported;
- `glob 10.5.0` emits an old-version/deprecation warning in the inherited Tailwind/Sucrase tooling chain;
- jsdom 20 still brings deprecated packages such as `abab`, `whatwg-encoding` and `domexception`;
- the existing lint baseline remains 42 problems;
- existing React test `act(...)` warnings remain;
- existing multiple GoTrueClient test warning remains;
- Vite still reports a large bundle chunk warning.

These are explicit follow-up technical-debt candidates. They must not be misrepresented as current npm-audit vulnerabilities.

## 11. MUST PRESERVE

- P19 production audit clean state;
- Program Finder GREEN / AMBER / RED safety behavior;
- RED automated recommendation hard stop;
- checkout safety and server-authoritative pricing/payment;
- Auth, RLS and role boundaries;
- entitlements, enrollment and progress;
- Patient App and Admin behavior;
- DE / FR / EN;
- existing Design System and routes;
- current React, React Router and Vite application behavior;
- synchronized `package.json` / `package-lock.json`;
- release STOP until independent clinical/legal/preproduction gates are cleared.

## 12. MUST NOT BREAK

- no application-code rewrite solely to satisfy this dependency phase;
- no blind or forced npm audit fix;
- no unnecessary ESLint 10 or jsdom 30 migration in P20;
- no weakening of lint rules merely to make lint appear green;
- no claim that existing lint/deprecation debt is fixed;
- no interpretation of npm-audit cleanliness as clinical, legal or commercial production approval.

## 13. Conclusion

P20 is validated for its defined security scope.

The full npm dependency tree and the production dependency tree both report **0 vulnerabilities** under the validated Node/npm environment.

Existing lint and tooling-modernization debt remains open and should be treated in separately scoped incremental phases.

**Final P20 status: VALIDATED FOR SECURITY SCOPE — FULL NPM AUDIT CLEAN — EXISTING LINT / DEPRECATION DEBT OPEN.**
