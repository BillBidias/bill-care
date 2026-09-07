# P18 — Vite & Build-Chain Security Remediation Gate

Status: **VALIDATED / TESTED — BUILD-CHAIN REMEDIATION COMPLETE, RESIDUAL DEPENDENCY DEBT OPEN**

Reference base before P18: `main` at `e6bf91010a4e58311824f07b0855e8f0a79248e9`.

## Objective

Remediate the Vite/build-tooling security debt left after P16/P17 without widening scope into React, React Router, Tailwind, Supabase, Stripe, clinical logic, routing, entitlements, Patient App or Admin behavior.

## Baseline after P17

Full dependency tree:
- 17 vulnerabilities total;
- 1 low;
- 4 moderate;
- 12 high;
- 0 critical.

Production tree (`npm audit --omit=dev`):
- 7 vulnerabilities total;
- 1 low;
- 1 moderate;
- 5 high;
- 0 critical.

The detailed P18 audit confirmed direct Vite 5.4.19 advisories and vulnerable build-chain versions including `esbuild 0.21.5` and `rollup 4.24.0`.

## Decision

P18 migrates to Vite 7, not Vite 8.

Reason:
- Vite 5 no longer has a patched line that resolves the audited direct advisories;
- Vite 7 is a smaller compatibility step;
- Vite 8 changes the build architecture from Rollup/esbuild to Rolldown/Oxc and would widen the migration scope unnecessarily;
- Node 22.23.2 already satisfies Vite 7 requirements;
- `@vitejs/plugin-react-swc` 4.3.3 supports Vite 4 through 8.

## Implemented changes

- `vite`: `^5.4.19` → `^7.3.6`;
- `@vitejs/plugin-react-swc`: `^3.11.0` → `^4.3.3`;
- regenerated the npm lockfile under Node 22;
- validated and persisted the exact lockfile produced by the successful CI run.

Validated resolved build-chain versions include:
- Vite 7.3.6;
- `@vitejs/plugin-react-swc` 4.3.3;
- esbuild 0.28.2 through Vite;
- Rollup 4.63.1 through Vite;
- PostCSS 8.5.28.

## Validation

GitHub Actions validation run: `34119745065`.

Environment:
- Node 22.23.2;
- npm 10.9.8.

Results:
- lockfile refresh — SUCCESS;
- `npm ci` — SUCCESS;
- `npm test` — SUCCESS;
- 15 test files PASS;
- 127 tests PASS;
- Program Finder GREEN/AMBER/RED regression tests PASS;
- auth/account/cart/legal/payment/profile/privacy/catalogue tests PASS;
- `npm run build` — SUCCESS;
- Vite 7.3.6 production build SUCCESS.

Known non-blocking warnings remain:
- existing React test `act(...)` warnings in cart tests;
- stale Browserslist/caniuse-lite data warning;
- existing large bundle chunk warning (>500 kB).

These were not introduced as functional failures by P18 and are not silently reclassified as resolved.

## Security impact

Full dependency tree after P18:
- 14 vulnerabilities total;
- 1 low;
- 3 moderate;
- 10 high;
- 0 critical.

Production tree after P18:
- 7 vulnerabilities total;
- 1 low;
- 1 moderate;
- 5 high;
- 0 critical.

Therefore P18 reduces build/dev dependency exposure by three findings but **does not reduce the production-tree count**. The remaining seven production findings are not treated as Vite migration failures; they belong to other dependency chains and require separate ownership analysis.

## MUST PRESERVE

- B2C-first product architecture;
- Program Finder RED hard stop;
- RED/AMBER checkout safety;
- Auth and RLS security boundaries;
- server-authoritative pricing and payment confirmation;
- Stripe redirect allowlist;
- entitlements/enrollments/progress;
- Patient App and Admin routes;
- privacy P10–P13 protections;
- legal/preproduction STOP gates;
- React 18;
- React Router 7.18.2;
- Tailwind 3.x unless separately scoped;
- synchronized package.json/package-lock.json.

## MUST NOT BREAK

- no `npm audit fix --force`;
- no Vite 8/Rolldown migration inside P18;
- no React 19 migration;
- no route redesign;
- no Supabase/RLS/Auth authority change;
- no Stripe/payment authority change;
- no clinical/safety logic change;
- no claim that P18 eliminates all dependency vulnerabilities.

## Conclusion

**P18 BUILD-CHAIN REMEDIATION COMPLETE FOR THE VALIDATED SCOPE.**

Vite is migrated from 5.4.19 to 7.3.6, the React SWC plugin is aligned, the Vite-associated esbuild/Rollup versions are moved to current patched lines, the full test suite and production build remain green, and the full dependency audit count is reduced from 17 to 14 with zero critical findings.

**RESIDUAL DEPENDENCY SECURITY DEBT REMAINS OPEN, INCLUDING 7 FINDINGS IN THE PRODUCTION TREE.**
