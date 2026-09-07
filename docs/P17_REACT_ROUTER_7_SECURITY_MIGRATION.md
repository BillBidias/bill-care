# P17 — React Router 7 Security Migration & Routing Regression Gate

Status: **VALIDATED — ROUTER MIGRATION PASSED REGRESSION GATE**

Reference base before P17: `main` at `66ae3914ea4957bd8de93a0209013ac375397b87`.

## Objective

Remove the React Router 6.x security debt identified in P16 without widening the scope into a broader React/Vite/application rewrite.

P17 upgrades only the router major version and validates that the existing declarative routing architecture continues to work.

## Current-state analysis

The application uses the standard declarative React Router APIs:

- `BrowserRouter`;
- `Routes`;
- `Route`;
- `Navigate`;
- `Link`;
- `useNavigate`;
- `useLocation`;
- `useSearchParams`;
- `MemoryRouter` in tests.

Critical route families that had to remain stable:

- public marketing/programme routes;
- `/finder` and `/quiz` Program Finder routes;
- `/cart`;
- `/login` and `/register`;
- `/checkout/success`;
- `/patient`;
- `/patient/session/:enrollmentId`;
- `/account`;
- `/admin`;
- legal routes;
- fallback `*` route.

Existing post-login return-path allowlisting remains unchanged and continues to prevent arbitrary external return targets.

## Compatibility decision

React Router 7.18.2 supports React `>=18` and Node `>=20`.

Therefore P17 deliberately keeps:

- React 18.3.1;
- React DOM 18.3.1;
- Vite 5.4.19;
- the current route component architecture;
- existing Auth/RLS/security boundaries.

No React 19 migration and no Vite major migration were included.

## Change implemented

Direct dependency:

- `react-router-dom`: `^6.30.1` → `^7.18.2`.

The lockfile was regenerated on Node 22 and the exact validated lockfile was committed from CI.

No application route definitions needed rewriting during this phase.

## Validation

GitHub Actions validation on Node 22.23.2 / npm 10.9.8:

- lockfile refresh — SUCCESS;
- `npm ci` — SUCCESS;
- `npm test` — SUCCESS;
- 15 test files PASS;
- 127 tests PASS;
- Program Finder GREEN/AMBER/RED regression tests PASS;
- account/auth tests PASS;
- cart tests PASS;
- legal-route tests PASS;
- payment repository tests PASS;
- `npm run build` — SUCCESS.

The React Router v6 future-flag warnings previously emitted by the test suite are no longer present after migration.

## Security audit impact

P16 post-remediation baseline:

Full tree:
- 20 vulnerabilities;
- 1 low;
- 4 moderate;
- 15 high;
- 0 critical.

Production tree:
- 10 vulnerabilities;
- 1 low;
- 1 moderate;
- 8 high;
- 0 critical.

P17 after React Router 7.18.2:

Full tree:
- 17 vulnerabilities;
- 1 low;
- 4 moderate;
- 12 high;
- 0 critical.

Production tree:
- 7 vulnerabilities;
- 1 low;
- 1 moderate;
- 5 high;
- 0 critical.

P17 therefore removes the audited React Router 6.x dependency-chain findings while preserving the application behavior covered by the current regression suite.

## Residual dependency debt

P17 does **not** claim a clean dependency tree.

Residual findings remain in Vite/build tooling and other transitive dependencies. They must be addressed through separately scoped, compatibility-tested phases rather than arbitrary overrides or forced audit remediation.

## MUST PRESERVE

- Program Finder RED hard stop;
- GREEN/AMBER behavior;
- authenticated route protection UX;
- RLS as the actual authorization boundary;
- safe internal login-return allowlist;
- checkout success route protection;
- Patient App routes;
- Admin route protection;
- legal routes;
- Stripe redirect allowlist;
- payment/entitlement/enrollment authority boundaries;
- React 18 during this phase;
- Vite 5 during this phase;
- synchronized package manifest and lockfile.

## MUST NOT BREAK

- no external/untrusted post-login redirect;
- no bypass of RequireAuth/RequireAdmin;
- no route rename/removal as part of dependency remediation;
- no React 19 migration bundled into P17;
- no Vite major migration bundled into P17;
- no `npm audit fix --force`;
- no weakening of clinical, privacy, payment, Auth or Admin protections.

## P17 conclusion

**REACT ROUTER 7 SECURITY MIGRATION VALIDATED.**

The existing application can run on `react-router-dom` 7.18.2 with React 18 and Vite 5. The full current regression suite and production build are green, and audited production dependency findings are reduced from 10 to 7.

**RESIDUAL NON-ROUTER DEPENDENCY SECURITY DEBT REMAINS OPEN.**

Commercial/clinical release remains **STOP**.
