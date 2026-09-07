# P16 — Dependency Security Audit & Targeted Remediation

Status: **VALIDATED FOR TARGETED SCOPE — RESIDUAL DEPENDENCY SECURITY DEBT OPEN**

Reference base before P16: `main` at `a7d5c95dff76934e4b96126d544ad204b00e2089`.

## Objective

Audit the current npm dependency tree, separate production/runtime exposure from development-only exposure, and apply only low-risk security patches that stay within the existing major versions. P16 deliberately does **not** perform a blind `npm audit fix` and does not use this phase to migrate the application stack.

## Baseline audit

Validated with Node 22.23.2 / npm 10.9.8.

Full dependency tree before remediation:

- 23 vulnerabilities total;
- 1 low;
- 4 moderate;
- 17 high;
- 1 critical.

Production tree (`npm audit --omit=dev`) before remediation:

- 12 vulnerabilities total;
- 1 low;
- 1 moderate;
- 10 high;
- 0 critical.

The critical finding was in `vitest` and was development/test-only. The production tree nevertheless contained high-severity findings, including the React Router dependency chain.

## Targeted remediation implemented

Only two direct development dependencies were moved to patched versions inside their existing major versions:

- `vitest`: `^3.2.4` → `^3.2.6` (lockfile resolved to 3.2.7 during validation);
- `postcss`: `^8.5.6` → `^8.5.23`.

The corresponding lockfile was regenerated in CI using Node 22, then the exact generated lockfile was committed to the P16 branch after successful validation.

No React, React Router, Vite, Supabase, Stripe, clinical, routing, RLS, entitlement, enrollment, Patient App or Admin behavior was changed.

## Validation

Targeted-remediation validation succeeded:

- `npm ci` — SUCCESS;
- `npm test` — SUCCESS;
- 15 test files PASS;
- 127 tests PASS;
- Program Finder GREEN/AMBER/RED regression tests PASS;
- `npm run build` — SUCCESS;
- Vite remains on the existing 5.x line for this phase.

## Audit after targeted remediation

Full dependency tree:

- 20 vulnerabilities total;
- 1 low;
- 4 moderate;
- 15 high;
- **0 critical**.

Production tree (`npm audit --omit=dev`):

- 10 vulnerabilities total;
- 1 low;
- 1 moderate;
- 8 high;
- 0 critical.

P16 therefore reduces the audited exposure but **does not claim a clean dependency tree**.

## Residual security debt

### React Router

The current application remains on React Router 6.x. The audited dependency tree reports high-severity findings in `react-router-dom`, `react-router` and `@remix-run/router`.

A complete remediation according to the current audit data would require migration beyond the current 6.x line for some advisories. That is a stack-level compatibility change and is intentionally **not** performed inside P16.

A future dedicated migration phase must first audit:

- route definitions and protected routes;
- navigation and redirect handling;
- authentication return paths;
- checkout success routing;
- Patient App routes;
- Admin routes;
- tests relying on React Router v6 behavior;
- v7 future-flag warnings already visible in tests.

### Vite and transitive build/dev dependencies

Residual findings also remain in the build/development dependency chain. A major Vite migration is not automatically authorized by a vulnerability count and must receive a dedicated compatibility and regression review.

### Other transitive packages

The remaining npm audit output includes transitive packages. They must be remediated through their owning direct dependency where possible, rather than by adding arbitrary top-level packages or overrides without compatibility analysis.

## Decisions

1. `npm audit fix` is **not** run blindly.
2. No `--force` remediation is accepted in P16.
3. Security patches inside the same major are preferred when testable and low-risk.
4. Major React Router / Vite migrations are deferred to separately scoped phases.
5. Vulnerability counts are not treated as proof of exploitability or production compromise; however, high-severity production-tree findings remain release-relevant debt.
6. Commercial/clinical production release remains **STOP**.

## MUST PRESERVE

- Program Finder RED hard stop;
- checkout RED/AMBER safety;
- server-authoritative pricing and payment confirmation;
- strict Stripe redirect allowlist;
- Auth/RLS/Admin RBAC boundaries;
- entitlement/enrollment/progress boundaries;
- privacy P10–P13 architecture;
- legal draft/release gates;
- synchronized `package.json` / `package-lock.json`;
- existing React/Vite/Router major versions unless a dedicated migration phase approves otherwise.

## MUST NOT BREAK

- do not upgrade React Router or Vite major versions opportunistically inside unrelated phases;
- do not use `npm audit fix --force` as a substitute for dependency analysis;
- do not introduce `overrides` solely to silence npm audit without validating owning dependency compatibility;
- do not weaken clinical, payment, Auth, RLS, privacy or Admin protections to accommodate a dependency update;
- do not describe P16 as eliminating all vulnerabilities.

## P16 conclusion

**TARGETED REMEDIATION COMPLETE.**

The critical development-only Vitest advisory in the baseline audit is removed, PostCSS is moved to a patched 8.5.x line, tests/build remain green, and the audited counts are reduced.

**RESIDUAL MAJOR-MIGRATION / TRANSITIVE DEPENDENCY SECURITY DEBT REMAINS OPEN.**
