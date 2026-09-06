# M15 — QA / Security / Legal / Clinical Gate

Status: **STOP — not production-ready for commercial/clinical release**

This gate records the verified project state through **P15**. It does not publish clinical content and does not authorize commercial or clinical release.

Reference state before P15 merge:

- Source of Truth: **v1.3 MASTER** — known to require later reconciliation with P06–P15.
- Repository: `BillBidias/bill-care`
- Reference branch: `main`
- Reference commit after P13: `e4eb06984ef52d49299b05ed878aae38f8ee6d95`

Status vocabulary:

- **DONE** — implemented for the validated scope.
- **PASS** — verified for the current scope.
- **PARTIAL** — foundation exists, launch requirements remain.
- **OPEN** — action still required.
- **BLOCKED** — external/owner/clinical/legal input required.
- **DEFERRED** — intentionally postponed.

## 1. Technical foundation — PASS with remaining launch hardening

Current verified foundation includes:

- React/Vite application with protected Patient and Account routes.
- server-verified Admin access and RBAC.
- Supabase Auth and RLS.
- entitlement as authoritative programme-access gate.
- enrollment separate from entitlement.
- patient progress based on completed prescribed exercises.
- versioned Supabase migrations.
- trusted server-side pricing/payment chain.
- DE / FR / EN foundations.

### P01 — Program Finder RED safety — DONE / PASS

- GREEN retains normal recommendation flow.
- AMBER retains guarded flow.
- RED blocks automatic programme recommendation/progression.
- RED preserves professional/medical referral messaging.

### P02 — npm lockfile consistency — DONE / PASS

- `package.json` / `package-lock.json` synchronization debt closed.
- `npm ci`, tests and build validated for P02.

### P03 — Stripe checkout redirect security — DONE / PASS

Browser redirects to Stripe require:

- HTTPS;
- exact `checkout.stripe.com` hostname;
- no non-default port;
- no embedded credentials;
- no lookalike/suffix host.

### P04 — SECURITY DEFINER RPC audit — DONE / PASS

- custom RPC exposure audited.
- no effective custom `PUBLIC`/`anon` execution identified in audited state.
- Admin RPC authorization and patient/user boundaries reviewed.
- payment mutation RPCs remain service-role only.

### P05 — Auth & RPC hardening — DONE / PASS

- least-privilege function EXECUTE defaults hardened for current postgres-owned functions.
- internal helper exposure reduced.
- RLS-required helpers preserved.

Follow-up remains for functions created under other owners, especially `supabase_admin` default ACL behavior.

### P06 — Preproduction gate reconciliation — DONE

Documentation-only reconciliation of P01–P05.

### P07 — Supabase Auth leaked-password validation — DEFERRED FINAL STEP

Verified:

- active backend `bill-care-dev`.
- organization currently Free.
- leaked-password protection warning remains.
- native feature requires Pro or above.

Owner-approved final sequence:

1. upgrade Supabase organization to Pro;
2. enable Leaked Password Protection;
3. rerun Security Advisor;
4. close only after warning is absent.

### P08 — External font privacy gate — DONE / PASS

Current frontend does not intentionally load Google Fonts from Google. Do not add a remote font provider without privacy/CSP/performance/provider review.

### P09 — Privacy & data-processing inventory audit — DONE / AUDIT

Verified that current flows process health-related information even though detailed Program Finder / checkout-safety answers are designed to remain transient.

Persistent application data includes, among other things:

- Auth/profile information;
- orders and order items;
- payment metadata;
- entitlements;
- programme enrollment/progress/completions;
- Admin/audit metadata.

Legal bases, Article 9 condition, retention, recipients and transfers were not invented.

### P10 — Privacy inventory reconciliation — DONE / PASS

`src/legal/privacyInventory.ts` now reflects actual processing:

- `HEALTH_DATA_PROCESSED = true`;
- detailed symptom/ICD-10/safety answers are not persistently stored in audited flows;
- purchase, entitlement, enrollment and progress may indirectly reveal a therapeutic pathway.

### P11 — Retention, deletion & user-rights architecture — DONE

Architecture separates:

1. transient health/safety input;
2. identity/profile;
3. therapeutic usage;
4. commerce ledger;
5. Admin/security audit;
6. minimal privacy-request evidence;
7. browser-local state.

No single global retention duration was invented.

### P12 — Privacy requests & export foundation — DONE / PASS

Implemented:

- own privacy requests;
- own request/event RLS;
- server-bound JSON export of own data;
- Account UI for export/history.

No public long-lived Storage export.

### P13 — Erasure orchestrator & commerce identity detachment — DONE / PASS, PRODUCTION LEGAL GATE OPEN

Implemented:

- server-side erasure orchestration;
- service-role-only destructive RPCs;
- server-side Auth user deletion;
- local browser session cleanup after successful erasure;
- deletion of targeted profile/therapeutic data;
- detachment of retained orders from live Auth identity;
- automatic blocking for active Admin membership, pending orders or active payments.

Commerce retention remains `pending_legal_tax_review`.

Important P14 consequence: P13 automatic deletion of therapeutic progress must **not** be considered production-ready until legal classification determines whether German treatment-record obligations (including possible §630f BGB applicability) affect those data.

### P14 — Legal classification & retention decision gate — VALIDATED

Approved decisions:

- **P14-D01:** MVP boundary = self-guided digital exercise programmes, non-diagnostic orientation and Safety Screening; no individualised treatment in the MVP.
- **P14-D02:** applicability of §630f BGB = **OPEN — LEGAL REVIEW REQUIRED**.
- **P14-D03:** preserve P13 architecture, but do not treat automatic erasure as production-ready until D02 is resolved.
- **P14-D04:** commerce records remain identity-detached; exact retention duration requires legal/tax classification.
- **P14-D05:** legal documents and this gate must be reconciled with actual checkout and health-data processing.

### P15 — Legal documents & preproduction gate reconciliation — CURRENT PHASE

P15 is limited to factual/documentary reconciliation. It does **not** approve legal texts for production and does not modify clinical, payment or Supabase authority.

Reconciled draft facts:

- checkout and Stripe integration are technically implemented, but commercial activation remains STOP;
- Medical Disclaimer no longer falsely states that no health information is processed;
- Terms no longer state that no payment system exists;
- Withdrawal draft now distinguishes technical checkout availability from legal/commercial readiness;
- legal document versions for Privacy, Terms, Withdrawal and Medical Disclaimer are advanced as **draft** only;
- the Privacy page was reviewed against P10 and remains factually aligned, so no unnecessary content rewrite is required;
- old EU ODR platform links must not be reintroduced; the platform ceased operation in 2025 and the applicable German dispute-resolution statement remains operator/legal input.

## 2. Commercial / payment gate — PARTIAL, NOT APPROVED

Technical chain exists for an authenticated user:

1. prepare checkout safety;
2. collect applicable transient safety answers;
3. require configured safety acknowledgement;
4. create a trusted server order;
5. keep final amount server-authoritative;
6. create Stripe Checkout Session;
7. redirect only to allowed Stripe Checkout destination;
8. confirm paid state only through verified server-side Stripe processing;
9. grant/maintain entitlement through backend authority.

A browser redirect or success page alone never grants paid access.

Before commercial activation:

- verify production Stripe endpoint/secrets/webhook configuration;
- run a controlled approved E2E payment test;
- finalize contract-formation wording and order-button requirements;
- finalize withdrawal information;
- implement/validate required express consent and acknowledgement for immediate digital-content delivery where applicable;
- provide required contract confirmation on durable medium where applicable;
- finalize price/tax presentation and consumer information;
- complete operator/legal identity.

## 3. Legal gate — BLOCKED

`src/legal/legalConfig.ts` intentionally contains `REQUIRED_INPUT` values that must not be invented.

Required before commercial publication includes:

- legal operator name/form;
- full business address;
- authorized representative;
- business contact information;
- register court/number and VAT ID where applicable;
- professional/regulatory information where applicable;
- privacy controller/contact and supervisory authority;
- verified hosting/processors/recipient inventory;
- applicable dispute-resolution statement;
- final professional review of Impressum, Terms/AGB, Privacy, Withdrawal and Medical Disclaimer.

Additional P14/P15 legal decisions still OPEN:

- applicability of §§630a/630f BGB to the real service;
- Article 6 legal bases;
- Article 9 condition(s) for health-related processing;
- exact retention mapping and durations;
- mapping of commerce records to HGB/AO categories;
- consumer digital-content contract requirements for the actual launch model;
- final German legal master text and review of FR/EN translations.

All legal documents remain **draft** until explicit professional approval.

## 4. Privacy / data-processing gate — PARTIAL

DONE / preserved:

- detailed Program Finder and safety answers designed as transient/non-persistent;
- privacy inventory aligned with actual finder/safety/checkout/payment/entitlement/progress flows;
- own privacy request foundation;
- own JSON export;
- server-side account erasure orchestration;
- commerce identity detachment;
- optional analytics/marketing consent defaults OFF in current consent model.

Still required:

- final legal bases and Article 9 condition;
- final processor/recipient and international-transfer documentation;
- validated retention matrix;
- legal decision on therapeutic progress / possible treatment-record retention;
- retention scheduler only after those durations are validated;
- final privacy notice review.

## 5. Clinical content gate — BLOCKED

No exercise, phase, session or programme may be treated as clinically released merely because technical content structures exist.

Before clinical publication, each programme/content set requires review of at least:

- intended target;
- exercise selection and execution;
- dosage / sets / repetitions / hold / tempo / rest;
- variants / progression / regression;
- mistakes and safety instructions;
- contraindications and stop criteria;
- sequencing and progression;
- translations;
- named author/reviewer, date and evidence governance;
- final media demonstration.

## 6. Safety / recommendation gate — FOUNDATION READY, CLINICAL REVIEW REQUIRED

- safety remains authoritative over recommendation and commerce;
- RED blocks automatic programme recommendation/start and cannot be bypassed by acknowledgement;
- checkout safety is revalidated before trusted order/payment creation;
- automated guidance must never be represented as medical diagnosis;
- clinical wording, mappings and safety rules still require clinical review before broad activation.

## 7. Media gate — DEFERRED

Final therapeutic video production remains separate from technical development. Placeholders do not imply clinical approval.

## 8. Security gate — PASS WITH OPEN FOLLOW-UP

Preserve least privilege rather than artificially chasing zero linter warnings.

Open items:

- final leaked-password protection after Supabase Pro upgrade;
- `supabase_admin`/future-owner function ACL review;
- final CSP after provider inventory;
- load/performance validation;
- scoped dependency security audit/remediation; do not run `npm audit fix` blindly;
- `main` branch protection/governance remains a known follow-up.

## 9. MUST PRESERVE

- B2C-first strategy;
- Safety Screening;
- P01 RED blocking;
- checkout RED/AMBER safety behavior;
- detailed safety answers transient/non-persistent;
- minimal acknowledgement proof/version/timestamp only where designed;
- server-authoritative pricing;
- verified server-side Stripe payment authority;
- browser cannot mark paid;
- entitlement access gate;
- entitlement/enrollment separation;
- Patient ownership boundaries;
- Auth/RLS;
- Admin RBAC;
- service-role-only payment/destructive privacy functions where designed;
- Patient App and existing routes;
- DE / FR / EN;
- Design System;
- versioned Supabase migrations;
- synchronized lockfile;
- published Git history;
- P05 privilege hardening;
- P10 privacy distinctions;
- P11 domain-specific retention principle;
- P12 own-request/export boundaries;
- P13 server erasure orchestration, blockers and commerce identity detachment;
- all legal texts as drafts until explicit approval.

## 10. MUST NOT BREAK

No future phase may:

- let RED automatically proceed to programme recommendation/start;
- let browser state create paid status or entitlement;
- allow cross-user protected-data access;
- let ordinary users self-assign Admin;
- expose `service_role` or backend secrets to browser code;
- weaken RLS or RPC privileges merely to silence warnings;
- reintroduce broad function EXECUTE defaults;
- accept untrusted Stripe redirects;
- persist detailed health/safety answers without an explicitly approved architecture;
- invent legal bases, Article 9 conditions or retention periods;
- automatically purge commerce records before validated legal/tax mapping;
- treat sign-out, soft delete or frontend-only deletion as GDPR erasure;
- expose destructive privacy RPCs directly to browser-authenticated users;
- automatically erase accounts with active Admin/pending-order/active-payment blockers;
- claim legal, clinical or commercial approval from technical implementation;
- claim P13 automatic therapeutic-data deletion is production-ready before P14-D02 is resolved.

## 11. Release decision

**Technical foundations through P13 are materially implemented for their validated scopes.**

**P14 decisions are validated. P15 reconciles legal drafts with the real technical state but does not legally approve them.**

**Commercial/clinical production release: STOP.**

Recommended next launch-gate work should resolve actual blockers rather than repeat completed phases. Priority candidates include:

1. legal/operator input and professional legal review, including P14-D02 and retention mapping;
2. clinical programme/safety-content review;
3. scoped dependency security audit;
4. Stripe production E2E gate when commercial activation is deliberately approached;
5. final CSP/provider inventory and performance validation;
6. final Supabase Pro leaked-password step;
7. deliberate Source of Truth reconciliation after the current phase sequence.

## 12. P15 non-regression statement

P15 must not modify:

- Supabase schema/RLS/functions;
- Stripe/payment authority;
- pricing logic;
- entitlement/enrollment logic;
- Patient progress logic;
- Program Finder RED behavior;
- checkout safety logic;
- Admin RBAC;
- clinical programme content.

P15 changes are limited to legal-document factual reconciliation, legal-document draft metadata, legal tests and this preproduction gate.
