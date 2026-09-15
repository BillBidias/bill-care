# P21 — Post-P20 Dependency Drift Reconciliation & Regression Gate

## Status

**VALIDATED — POST-P20 DRIFT RECONCILED — LINT CLEAN — DEEP-LINK REGRESSION FIXED**

Commercial and clinical release status remains **STOP**. P21 does not close legal, clinical, Supabase, Stripe, privacy, CSP, or other preproduction gates.

## Scope

P21 started as a lint-error remediation phase. Before changing lint-related source code, the actual `main` branch was re-audited because it had advanced after P20 through automated and maintenance pull requests.

Base inspected for P21:

- repository: `BillBidias/bill-care`
- base branch: `main`
- base SHA: `5d020ac12b4bb0debf40afd7c862f552a7166380`

P20 reference SHA:

- `d58593d38d31a37900a4c78db66230f273bf5e86`

## Current State Found

Post-P20 changes had already removed the old lint baseline of 42 issues. On the P21 branch, `npm run lint` completed cleanly before any dedicated lint refactor was required.

However, post-P20 dependency drift introduced a more serious compatibility regression:

- root `vite`: `8.2.2`
- `lovable-tagger`: `1.1.13`
- `lovable-tagger@1.1.13` requires Vite `>=5 <8`
- therefore `npm ci` on the then-current dependency declaration failed with an `ERESOLVE` peer dependency conflict.

P21 did not use `--force` or `--legacy-peer-deps`.

## Vite Compatibility Repair

Vite was restored from `8.2.2` to the already validated `7.3.6` line.

This preserves:

- React 18
- React Router 7.18.2
- the current application architecture
- the existing `lovable-tagger@1.1.13` integration
- the P18/P19/P20 Vite compatibility baseline

Vite 8 is therefore not accepted in this repository until the tagger dependency is removed, upgraded, or otherwise proven compatible in a dedicated phase.

## Deep-Link Regression Found

After restoring dependency installability, the expanded current test suite exposed one failure in:

`src/test/programs-deep-link.test.tsx`

The failing scenario was:

1. open `/programs?program=7`;
2. the requested programme dialog opens;
3. click the dialog Close button;
4. the `program` query parameter should be removed and the dialog should stay closed.

The dialog could reopen because `ProgramsPage` simultaneously maintained local `openProgram` state and a URL-derived `program` state. During close, local state was cleared before the URL update had propagated; the effect could still observe `program=7` and reopen the same programme.

## Hypotheses Tested and Rejected

Two recent dependency upgrades were tested as possible causes before modifying functional code:

- `jsdom 30.0.1` temporarily restored to `20.0.3` — failure remained;
- `@radix-ui/react-dialog 1.1.23` temporarily restored to `1.1.14` — failure remained.

Therefore neither rollback was retained. Final P21 keeps:

- `jsdom 30.0.1`
- `@radix-ui/react-dialog 1.1.23`

## Deep-Link Fix

`src/pages/ProgramsPage.tsx` was changed so that the URL query parameter is the authoritative source for programme-dialog state.

Key behavior:

- valid `?program=<id>` resolves the matching programme and opens it;
- absent `program` clears the dialog state;
- unknown IDs fail closed;
- opening a programme writes its ID to the URL;
- closing a deep-linked programme removes the URL parameter first, allowing the URL-driven effect to close the dialog deterministically.

This removes the local-state / URL-state race without weakening the regression test.

## Vitest Security Reconciliation

After the functional fix, the full npm audit reported two moderate findings in the development-only Vitest chain:

- advisory: `GHSA-82fw-gwwq-j7x9`
- affected package: `@vitest/mocker`
- affected Vitest line included the previously installed `3.2.x`

The patched Vitest `4.1.11` line was selected instead of using `npm audit fix --force`.

Final validated versions:

- Vite `7.3.6`
- Vitest `4.1.11`
- `@vitest/mocker` `4.1.11`
- `lovable-tagger` `1.1.13`

The project remains on Node 22. The lockfile regeneration hit an npm 10.9.8 resolver defect (`Cannot read properties of null (reading 'edgesOut')`), so the same dependency set was resolved with npm 11.6.0. No peer-dependency bypass flag was used.

## Final Validation

Final dedicated P21 validation run:

- GitHub Actions run: `35025443547`
- Node: `22.23.2`
- npm used to resolve/validate the updated lockfile: `11.6.0`

Results:

- lockfile refresh — PASS
- `npm ci` — PASS
- `npm run lint` — PASS
- test files — **16 / 16 PASS**
- tests — **130 / 130 PASS**
- Program Finder GREEN / AMBER / RED regression tests — PASS
- programme deep-link tests — **3 / 3 PASS**
- production build — PASS with Vite `7.3.6`
- full `npm audit` — **0 vulnerabilities**
- `npm audit --omit=dev` — **0 vulnerabilities**

Existing non-blocking test warnings remain visible, including React `act(...)` warnings in cart tests and the Supabase multiple-GoTrueClient test warning. They were not introduced by the P21 source fix.

The production bundle still emits the existing large-chunk warning and is not treated as a P21 functional regression.

## Must Preserve

- Program Finder RED hard stop and GREEN/AMBER behavior
- non-diagnostic product positioning
- checkout safety gates
- server-authoritative pricing/payment state
- Stripe webhook authority
- entitlements/enrollments/progress
- Auth/RLS/Admin boundaries
- DE/FR/EN architecture
- privacy and erasure foundations
- React 18 and React Router 7.18.2
- validated post-P20 dependency upgrades unless a specific regression is demonstrated

## Must Not Break

- no forced dependency resolution
- no `npm audit fix --force`
- no `--legacy-peer-deps`
- no weakening of regression tests
- no Vite 8 while `lovable-tagger@1.1.13` remains incompatible
- no automated recommendation after RED safety state
- no browser authority to mark orders paid or grant entitlements
- no weakening of RLS/Auth/privacy controls

## Residual Follow-Up

P21 does not close:

- existing cart `act(...)` test warnings;
- Supabase multiple-GoTrueClient test warning;
- production bundle size/code-splitting debt;
- Supabase leaked-password protection final-preproduction gate;
- Stripe production E2E/secrets/webhook gate;
- legal/clinical/privacy/CSP release gates;
- branch-protection governance risk.

The production release remains **STOP** until the independent release gates are closed.
