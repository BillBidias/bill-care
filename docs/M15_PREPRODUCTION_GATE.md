# M15 — QA / Security / Legal / Clinical Gate

Status: **STOP — not production-ready for commercial/clinical release**

This gate records the verified state of Dein Digital Physio through P08. It does not publish clinical content and does not authorize commercial/clinical release.

Reference state:

- Source of Truth: **v1.3 MASTER**
- Repository: `BillBidias/bill-care`
- Reference branch: `main`
- Reference commit after P06: `39191b3eb99dcb7a08cab4d0f7661c34975bd605`

Status vocabulary used below:

- **DONE** — implemented and no longer an open task.
- **PASS** — verified for the current scope.
- **PARTIAL** — foundation exists, but launch requirements remain.
- **OPEN** — still requires action.
- **BLOCKED** — cannot be completed without required external/owner/clinical/legal input.
- **DEFERRED** — intentionally postponed by product decision.

## 1. Technical foundation — PASS with remaining launch hardening

Current verified foundation:

- React/Vite patient application builds through the GitHub → Vercel pipeline.
- Patient routes `/patient`, `/patient/session/:enrollmentId` and `/account` require authentication.
- `/admin` requires server-verified admin access.
- Entitlement remains the authoritative programme-access gate.
- Enrollment is separate from entitlement.
- Progress is based on completed prescribed exercises, not page views or logins.
- Patient content reads remain constrained by publication/entitlement rules.
- Conservative Vercel security headers remain part of the current foundation.
- Existing Supabase security/performance hardening migrations remain in place.

### P01 — Program Finder RED safety — DONE / PASS

- GREEN keeps the normal recommendation flow.
- AMBER keeps the existing guarded recommendation flow.
- RED blocks automatic programme recommendation/progression.
- RED preserves professional/medical referral messaging.
- P01 was tested and merged into `main`.

### P02 — npm lockfile consistency — DONE / PASS

- `package.json` / `package-lock.json` synchronization debt is closed.
- `npm ci`, tests and build were validated in P02.
- No source-code behavior was changed by P02.

### P03 — Stripe checkout redirect security — DONE / PASS

Stripe browser redirects are restricted to the canonical Checkout host boundary:

- HTTPS required;
- exact hostname `checkout.stripe.com` required;
- non-default ports rejected;
- embedded username/password rejected;
- lookalike/suffix domains rejected.

P03 validation included 14 test files and 117 passing tests, plus a successful build.

### P04 — authenticated SECURITY DEFINER RPC audit — DONE / PASS

The manual audit previously listed as an open technical item has been completed.

Verified during P04:

- 34 custom `SECURITY DEFINER` functions were reviewed across `public` / `app_private`;
- no custom function was effectively executable by `PUBLIC` or `anon` in the audited state;
- authenticated RPC exposure was reviewed function by function;
- Admin RPCs bind authorization to the actual caller and RBAC permissions;
- patient/progress RPCs bind access to the current user and entitlement/safety rules;
- payment mutation RPCs remain server/service-role only;
- no critical privilege bypass was identified.

P04 was audit-only and made no repository/database change.

### P05 — Auth & RPC hardening — DONE / PASS

P05 implemented least-privilege hardening through migration:

`supabase/migrations/20260905223039_p05_auth_rpc_hardening.sql`

Key effects:

- future `postgres`-owned functions no longer inherit implicit `PUBLIC` EXECUTE;
- `anon` and `authenticated` no longer receive automatic EXECUTE on future functions in `public` / `app_private` through the hardened defaults;
- direct authenticated EXECUTE was removed from internal helpers that did not require client access:
  - `app_private.admin_can_view_customer(uuid, uuid)`;
  - `app_private.admin_has_permission(uuid, text)`;
  - `app_private.enrollment_progress_counts(uuid)`;
- entitlement helpers required directly by RLS remain executable where necessary.

Negative authorization checks confirmed that an ordinary authenticated user did not gain Admin access and could not invoke Stripe server-only mutation RPCs.

### P06 — Preproduction gate reconciliation — DONE / PASS

P06 reconciled this document with the validated P01–P05 implementation state.

It was documentation-only and changed no frontend, backend, Supabase, Stripe, package or clinical-content behavior.

### P07 — Supabase Auth security validation — AUDIT PASS / DEFERRED FINAL STEP

P07 verified the active hosted backend `bill-care-dev` and the current application Auth foundation.

Verified findings:

- Supabase Security Advisor still reports `Leaked Password Protection Disabled`;
- the Supabase organization is currently on the Free plan;
- current Supabase documentation states leaked-password protection is available on Pro and above;
- application registration requires a minimum password length of 8 characters;
- Auth access is centralized through the existing Supabase Auth provider;
- browser code uses public/publishable Supabase configuration only and does not reference `service_role`;
- login return paths are restricted to known internal application routes;
- Admin UX checks server-verified Admin access and does not replace backend RBAC/RLS authorization;
- audited application policies/functions did not rely on user-editable `raw_user_meta_data`, deprecated `auth.role()`, or `auth.jwt()` authorization shortcuts.

No GitHub or Supabase mutation was required for P07.

Owner decision:

**Leaked Password Protection is DEFERRED TO FINAL PREPRODUCTION.**

Final required sequence:

1. upgrade the Supabase organization to Pro;
2. enable Leaked Password Protection on `bill-care-dev`;
3. rerun the Supabase Security Advisor;
4. close the item only after the `auth_leaked_password_protection` warning is confirmed absent.

This deferred item does not block current development but remains mandatory before final production readiness.

### P08 — External font privacy gate closure — DONE / PASS

The previous external Google Fonts privacy blocker was rechecked against the actual repository and found to be obsolete.

Verified current state:

- `index.html` contains no Google Fonts stylesheet or preconnect request;
- `src/index.css` contains no remote `@import` for fonts;
- the active font variables use `Inter` with system-font fallbacks;
- repository search found no `fonts.googleapis.com` reference;
- repository search found no `fonts.gstatic.com` reference;
- repository search found no active `Nunito` or `Playfair` reference.

Conclusion:

**The current frontend does not intentionally load Google Fonts from Google.**

Therefore the former requirement to replace/self-host Google Fonts or preserve a Nunito / Playfair Display remote-font identity is no longer a current launch blocker.

Non-regression rule:

Do not introduce a new remote font provider later without a fresh privacy, CSP, performance and consent/provider review.

### Technical items still OPEN before commercial/clinical release

- **DEFERRED FINAL PREPRODUCTION — Supabase Auth leaked-password protection:** upgrade to Pro, enable the feature and rerun Security Advisor before final production readiness.
- **FOLLOW-UP — `supabase_admin` default function ACL:** current application functions are `postgres`-owned and covered by P05, but future functions created under another owner must be reviewed explicitly. Do not assume P05 globally hardens every possible future owner.
- **OPEN — production Stripe verification:** verify the production webhook endpoint/secrets and run an approved end-to-end payment test before commercial activation.
- **OPEN — load/performance validation:** consider additional indexes only after realistic load testing; do not add every linter-suggested index blindly.
- **OPEN — Content-Security-Policy:** add CSP only after the final asset/provider inventory is known; do not deploy a speculative policy that breaks required services.

## 2. Commercial / payment gate — PARTIAL, NOT APPROVED FOR RELEASE

The technical checkout chain is materially implemented.

### Implemented technical chain — DONE

For an authenticated user, the current cart can:

1. prepare checkout safety;
2. collect the applicable transient safety answers;
3. require the configured safety acknowledgement;
4. create a trusted checkout order server-side;
5. keep the final amount server-authoritative;
6. create a Stripe Checkout Session;
7. redirect only to an allowed Stripe Checkout URL.

Server-side payment foundations remain authoritative:

- Stripe webhook signature verification is server-side;
- verified Stripe events are the source of paid status;
- the browser cannot set an order to `paid`;
- paid status creates/maintains entitlement through the backend foundation;
- a browser redirect alone never unlocks programme content.

### `/checkout/success` UX — DONE

A real checkout-success page exists.

It:

- reads `session_id` from the Stripe return URL;
- looks up the authenticated user's own order server-side;
- polls briefly while webhook confirmation may still be asynchronous;
- shows success only after authoritative order status is `paid`;
- clears the cart only after confirmed paid status;
- explicitly avoids premature programme access if confirmation is delayed.

### Still required before commercial activation

Technical implementation does **not** equal approval for commercial release.

Before activation:

- account/authentication remains mandatory before payment;
- final amount must remain server-authoritative;
- verified Stripe webhook confirmation must remain the source of paid status;
- paid status must remain the entitlement source; browser success must never unlock content;
- production Stripe configuration and webhook secrets must be verified;
- one controlled end-to-end production/test-mode payment validation must be run only when checkout activation is approved;
- withdrawal information and required express acknowledgements for immediate digital-content delivery must be legally reviewed and implemented before relying on the checkout commercially;
- order/contract confirmation requirements must be reviewed for Germany/EU launch.

## 3. Legal gate — BLOCKED

`src/legal/legalConfig.ts` contains required operator/legal inputs that must not be invented.

Required before commercial publication:

- confirmed operator legal name and legal form;
- full business address;
- authorized representative;
- business contact email/phone as applicable;
- register court/number and VAT ID where legally applicable;
- profession/regulatory information where applicable to the actual offer/operator;
- privacy controller/contact and competent supervisory authority;
- hosting/processors inventory;
- current dispute-resolution statement;
- professional legal review of Impressum, Terms/AGB, Privacy, Withdrawal and Medical Disclaimer.

Legal texts must be reconciled with the actual checkout and health-data processing before commercial publication. Any text still describing checkout as inactive must be updated before a real commercial launch.

## 4. Privacy / data-processing gate — PARTIAL

Privacy by Design and data minimization remain mandatory.

Current intended safety/checkout design keeps detailed safety answers transient and stores only the required acknowledgement proof/version/timestamp where applicable.

Before launch or broader health-data processing:

- update the privacy processing inventory to match the actual finder/safety/checkout flow;
- verify that symptom answers, free text and clinician-provided ICD-10 values are not persisted unless a separate lawful health-data architecture is deliberately approved;
- document the safety acknowledgement proof without unnecessarily storing detailed safety answers;
- document payment/admin/entitlement/enrollment/progress processing activities;
- define retention, deletion, export, recipients, legal bases and international-transfer information after legal/provider review;
- keep analytics and marketing disabled unless explicitly integrated behind the required consent model.

Cookie/consent infrastructure must remain aligned with the actual providers enabled in production.

## 5. Clinical content gate — BLOCKED

The technical platform may contain catalogue/programme/content foundations, but clinical publication cannot be inferred from technical availability.

No exercise, phase, session or programme content may be moved to a patient-facing clinically released state merely to make the UI visible.

Before clinical publication each programme/content set requires an intentional clinical release review covering at minimum:

- exercise selection and intended target;
- starting position and movement execution;
- dosage / sets / repetitions / hold / tempo / rest;
- variants/progression/regression where used;
- common mistakes;
- contraindications;
- safety instructions and stop criteria;
- programme sequencing and session progression;
- translations used clinically;
- named author/reviewer, review date and evidence/reference governance;
- final media demonstration review when videos are produced.

Any previously recorded content counts/statuses should be re-verified against the live database before being used for a release decision; this document must not treat historical counts as permanently current.

## 6. Safety / recommendation gate — FOUNDATION READY, CLINICAL REVIEW REQUIRED

- Safety remains authoritative over recommendation and commerce.
- RED safety outcomes must block automatic programme recommendation/start and cannot be overridden by acknowledgement.
- Checkout safety is revalidated before a trusted order/payment begins.
- Safety questions, wording and recommendation mappings still require clinical review before broad public clinical activation.
- Automated guidance must never be represented as a medical diagnosis.

P01 establishes the RED blocking behavior and must remain a non-regression requirement for every future phase.

## 7. Media gate — DEFERRED BY PRODUCT DECISION

Real final exercise-video production remains a separate product/clinical workflow.

Development placeholders are acceptable for QA only. Final therapeutic media must not be implied to exist or be clinically approved before production and review.

Before final media publication:

- content must be clinically validated;
- demonstration technique must be reviewed;
- language/voice/text overlays must match the validated clinical content;
- accessibility requirements must be considered;
- final media must be linked only to the approved programme/exercise version.

## 8. Security Advisor interpretation — PASS WITH OPEN FOLLOW-UP

The goal is **real least-privilege security**, not artificially achieving zero warnings.

Therefore:

- intentional authenticated `SECURITY DEFINER` RPCs may remain when they are the designed secure API boundary and perform their own authentication/authorization checks;
- RLS-enabled internal tables may intentionally have no permissive client policy when direct client access is supposed to be denied;
- do not add permissive policies merely to silence a linter/advisor warning;
- every new RPC must receive an explicit exposure/owner/EXECUTE review.

The leaked-password warning is a separate Auth configuration item and remains deferred until final preproduction because the current organization is on the Free plan.

## 9. MUST PRESERVE

Future work must preserve:

- B2C-first product strategy;
- Program Finder RED blocking;
- checkout RED/AMBER safety behavior;
- server-authoritative pricing;
- signed/server-authoritative Stripe payment confirmation;
- entitlement as the access gate;
- separation of entitlement and enrollment;
- patient ownership boundaries;
- Auth and RLS;
- Admin RBAC;
- service-role-only payment mutation functions;
- DE / FR / EN foundations;
- existing routes and Patient App behavior;
- versioned Supabase migrations;
- synchronized npm lockfile;
- published Git history;
- no unreviewed third-party font/provider dependency.

## 10. MUST NOT BREAK

No future phase may:

- let a RED clinical result proceed automatically to a programme recommendation/start;
- let the browser mark an order paid;
- let the browser manufacture entitlement;
- let a patient read another patient's protected data;
- let an ordinary user self-assign Admin privileges;
- expose service-role/backend secrets to the browser;
- reintroduce permissive function EXECUTE defaults unintentionally;
- weaken RLS simply to remove advisor warnings;
- accept untrusted Stripe redirect destinations;
- introduce an external font/provider silently;
- silently treat technical implementation as legal/clinical/commercial approval.

## 11. Release decision

**Technical foundations through P08: substantially implemented, audited and reconciled for the validated scope.**

**Commercial/clinical production release: STOP.**

The remaining work should resolve the real launch gates rather than repeat completed P01–P08 work.

Recommended next order:

1. complete the privacy/data-processing inventory and health-data governance for the actual live flows;
2. verify any remaining owner/default-ACL exposure for future Supabase function creation as needed;
3. supply and legally review operator/legal information;
4. conduct structured clinical review and governance of programmes/exercises/safety wording;
5. verify Stripe production configuration and execute a controlled E2E payment test only when legal/commercial activation is approved;
6. publish only clinically approved programme content;
7. produce/replace final exercise media when the video-production workflow is approved;
8. at final preproduction, upgrade Supabase to Pro, enable Leaked Password Protection and rerun Security Advisor.

## 12. Phase reconciliation results

### P06

Documentation-only reconciliation of the preproduction gate with P01–P05.

### P07

Auth security audit completed. No code/database mutation required. Leaked Password Protection is deliberately deferred to final preproduction because the current Supabase organization is on Free and the native feature requires Pro or above.

### P08

Documentation-only closure of an obsolete external-font privacy blocker after verifying the current repository does not intentionally load Google Fonts or reference the previously documented Nunito / Playfair remote-font identity.

P06–P08 do **not**:

- authorize a commercial or clinical launch;
- weaken clinical safety;
- weaken Auth/RLS/RBAC;
- change Stripe payment authority;
- publish clinical content.
