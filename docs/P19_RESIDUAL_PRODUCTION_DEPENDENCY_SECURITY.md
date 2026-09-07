# P19 — RESIDUAL PRODUCTION DEPENDENCY SECURITY AUDIT & TARGETED REMEDIATION

Status: VALIDATED CANDIDATE — READY FOR PR
Date: 2026-09-07
Base main at start: `b6db3d99cc45147d98e8737c2e79fc80d9a4a608`

## 1. CURRENT STATE

P18 left the npm audit state at:

- production tree: 7 vulnerabilities
  - 0 critical
  - 5 high
  - 1 moderate
  - 1 low
- full dependency tree: 14 vulnerabilities
  - 0 critical

The seven production-audit findings were all transitive rather than direct application dependencies.

## 2. PROBLEMS FOUND

Production audit identified:

- `brace-expansion` through Tailwind/Sucrase/Glob
- `glob` through Tailwind/Sucrase
- `lodash` through `recharts@2.15.4`
- `minimatch` through Glob
- `picomatch` through Tailwind file-watching/glob tooling
- `postcss-selector-parser` through Tailwind/PostCSS tooling
- `yaml` through Tailwind/PostCSS/Vite dependency paths

A read-only `npm audit fix --omit=dev --package-lock-only --dry-run --json` proposed zero changes. Therefore an automatic audit fix was not used.

The audit also showed that the advisory-expected `lodash@4.17.24` does not exist in the npm registry, so no invented or unavailable Lodash version was forced.

## 3. KEEP

P19 preserves:

- React 18
- React Router 7
- Vite 7
- Tailwind CSS 3
- existing shadcn/ui chart wrapper
- all routes
- authentication and authorization behavior
- Program Finder GREEN / AMBER / RED safety behavior
- checkout and Stripe authority boundaries
- Supabase/RLS architecture
- entitlements and enrollments
- Patient App behavior
- Admin RBAC
- legal/privacy behavior
- current clinical safety gates

## 4. IMPROVE

### 4.1 Recharts

`recharts` was migrated from `^2.15.4` to `^3.10.1`.

Why:

- Recharts 2.15.4 pulled vulnerable `lodash@4.17.21`.
- Recharts 3.10.1 no longer depends on Lodash.
- Recharts 3.10.1 supports React 18.
- the existing `src/components/ui/chart.tsx` wrapper passed tests and build without source changes.

### 4.2 Targeted npm overrides

Overrides are intentionally scoped to the affected dependency parents / vulnerable locked lines rather than globally replacing every copy of a package.

Validated override intent:

- `minimatch@9.0.5` → `9.0.7`
- `yaml@2.6.0` → `2.8.3`
- Sucrase's Glob → `10.5.0`
- Readdirp / Anymatch / Micromatch Picomatch → `2.3.2`
- Tailwind / PostCSS Nested selector parser → `6.1.3`

This preserves already-safe major lines such as Vite's Picomatch 4.x and ESLint's distinct dependency graph.

## 5. REMOVE

P19 removes no application feature, route, clinical rule, database object, payment behavior, or patient functionality.

Lodash is removed indirectly from the Recharts dependency path by upgrading Recharts; it is not replaced with a nonexistent version.

## 6. ADD

- scoped npm `overrides` in `package.json`
- this P19 security decision record

No new runtime service or external provider is added.

## 7. TARGET STATE

Validated P19 target:

- production npm audit: 0 vulnerabilities
- no critical vulnerabilities
- Recharts 3 compatible with current React 18 application
- targeted transitive remediation only
- full application regression suite remains green
- production build remains green
- residual dev/tooling audit debt remains visible rather than being hidden

## 8. VALIDATION

Final validation run: GitHub Actions `34128314325`
Environment:

- Node 22.23.2
- npm 10.9.8

Results:

- lockfile refresh: SUCCESS
- `npm ci`: SUCCESS
- `npm test`: SUCCESS
- 15 test files PASS
- 127 tests PASS
- Program Finder GREEN / AMBER / RED regression tests PASS
- `npm run build`: SUCCESS
- Vite 7.3.6 production build: SUCCESS

Final audit:

### Production tree

- info: 0
- low: 0
- moderate: 0
- high: 0
- critical: 0
- total: 0

### Full dependency tree

- info: 0
- low: 0
- moderate: 2
- high: 7
- critical: 0
- total: 9

The remaining nine findings are therefore not production-tree findings in this audit. They remain separate dev/tooling security debt and are not silently declared resolved.

## 9. RISKS

### Recharts major-version migration

Risk: API/type differences between Recharts 2 and 3.

Mitigation: existing chart wrapper required no source modification; full tests and build passed.

### Overrides

Risk: broad overrides can unintentionally replace incompatible major lines.

Mitigation: P19 rejected broad global overrides and uses parent/version-targeted overrides instead. `npm ls` verified that Vite retains Picomatch 4.x while Tailwind-related vulnerable Picomatch 2.3.1 paths are remediated.

### Dev/tooling debt

Nine full-tree audit findings remain. They must not be represented as production runtime findings, but they still deserve a future scoped development-toolchain audit/remediation phase.

## 10. MUST PRESERVE

- B2C FIRST
- P14-D01 self-guided MVP boundary
- Safety Screening
- RED automated recommendation lock
- server-authoritative Stripe/payment flow
- RLS/Auth/Admin RBAC
- entitlement/enrollment/progress model
- privacy rights architecture P12/P13
- legal status remains draft/review-gated
- DE/FR/EN
- Design System
- existing routes
- Git history and incremental phase governance

## 11. MUST NOT BREAK

- no diagnostic claim
- no RED automated recommendation/start
- no browser authority to mark payment paid or grant entitlement
- no service-role secret in frontend
- no cross-user access
- no route removals/renames
- no Supabase schema/RLS/function changes in P19
- no Stripe logic changes in P19
- no clinical/safety logic changes in P19
- no blind `npm audit fix`
- no invented package versions
- no broad dependency override that downgrades already-safe major lines

## 12. TEST PLAN RESULT

Completed:

1. Baseline production audit — PASS / documented
2. Dependency ownership mapping — PASS
3. Audit-fix dry-run — PASS / zero automatic changes
4. Published fixed-version verification — PASS
5. Recharts React-18 compatibility verification — PASS
6. Scoped override validation — PASS
7. `npm ci` — PASS
8. 127-test regression suite — PASS
9. production build — PASS
10. production audit = 0 — PASS
11. full-tree residual debt explicitly retained — PASS

## 13. RELEASE STATUS

P19 does not change the project release decision.

**COMMERCIAL / CLINICAL PRODUCTION RELEASE: STOP**

Other preproduction legal, clinical, privacy, Supabase, Stripe, CSP, performance and governance gates remain subject to their existing decisions.
