# M15 — QA / Security / Legal / Clinical Gate

Status: **STOP — not production-ready for commercial/clinical release**

This gate records the verified state of Dein Digital-PHYSIO after M00–M14. It does not publish clinical content and does not activate checkout.

## 1. Technical foundation — PASS with remaining hardening

- React/Vite patient application builds through the GitHub → Vercel production pipeline.
- Patient routes `/patient`, `/patient/session/:enrollmentId` and `/account` require authentication.
- `/admin` requires server-verified admin access.
- M10 entitlement remains the authoritative programme-access gate.
- M11 enrollment is separate from entitlement.
- M14 progress is based on completed prescribed exercises, not page views or logins.
- M13 reads only published content covered by the patient's entitlement.
- Obsolete public `/example` route has been removed from the router; its source file is retained only as historical code.
- Conservative Vercel security headers were added: HSTS, nosniff, DENY framing, strict-origin referrer policy and disabled camera/microphone/geolocation for the current MVP.
- M15 Supabase migration `20260827222757_m15_security_performance_hardening` adds covering indexes for high-value relations and optimizes entitlement/progress RLS `auth.uid()` evaluation without changing access semantics.

### Technical items still required before launch

- Enable Supabase Auth leaked-password protection.
- Complete a final manual audit of every authenticated `SECURITY DEFINER` RPC and keep only functions intentionally exposed to authenticated clients.
- Verify production Stripe webhook endpoint/secrets and run an end-to-end test payment only when checkout activation is approved.
- Add/verify a real `/checkout/success` UX before enabling user-facing payment.
- Consider additional database indexes after realistic load testing; do not add every linter-suggested index blindly.
- Replace or self-host external Google Fonts before production, or obtain an explicit privacy/legal decision for the external font request. Preserve the existing Nunito / Playfair Display visual identity.
- Add a Content-Security-Policy only after the final asset/provider inventory is known; do not deploy a speculative CSP that could break required services.

## 2. Commercial / payment gate — NOT ACTIVE

The server-side Stripe/payment foundation exists, including authenticated checkout and signed webhook processing, but the current public cart remains purchase-intent only and does not call the trusted checkout RPC/Edge Function. Therefore the current site must not be represented as having a completed commercial checkout flow.

Before activation:

- account creation/authentication remains mandatory before payment;
- final amount must remain server-authoritative;
- verified Stripe webhook confirmation must be the source of paid status;
- paid status creates the M10 entitlement; a browser success return must never unlock content;
- withdrawal information and required express acknowledgements for immediate digital-content delivery must be legally reviewed and implemented before the payment button becomes active;
- order/contract confirmation requirements must be reviewed for Germany/EU launch.

## 3. Legal gate — BLOCKED

`src/legal/legalConfig.ts` intentionally contains `REQUIRED_INPUT` for the legal operator identity and related fields. No operator fact may be invented.

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

The legal pages remain drafts. They currently describe the user-facing checkout as inactive, which matches the current frontend state. They must be updated immediately when checkout or health-questionnaire processing is activated.

## 4. Privacy/data-processing gate — PARTIAL

Current public UI does not yet expose the M05 guided symptom/ICD-10 assessment, so the current frontend does not intentionally request those health-related answers. The database foundations for assessment/safety store configuration; the intended MVP design keeps patient answers transient.

Before M05/M06/M07 UI activation:

- update the privacy processing inventory to describe the actual transient assessment/safety processing;
- verify that symptom answers, free text and clinician-provided ICD-10 values are not persisted unless a separate lawful health-data architecture is deliberately approved;
- document the safety acknowledgement proof stored with checkout (version/timestamp) without storing detailed safety answers;
- add the actual payment/admin/entitlement/enrollment/progress processing activities to the privacy inventory before commercial launch;
- set retention, recipients, legal bases and international-transfer information after legal/provider review.

Cookie/consent infrastructure remains in place. Analytics and marketing must remain disabled unless explicitly integrated behind consent.

## 5. Clinical content gate — BLOCKED

Verified database state at M15:

- 12 catalogue programmes: `published`;
- 24 programme phases: `draft`;
- 48 programme sessions: `draft`;
- 60 exercises: `draft`;
- 180 exercise translations: complete FR/EN/DE coverage for starting position, movement, main tip, common mistakes, safety instructions, stop criteria and contraindications;
- 60/60 exercises currently lack `author_name`;
- 60/60 lack `reviewer_name`;
- 60/60 lack `reviewed_at`;
- 60/60 lack `evidence_reference`;
- 60/60 have no final video asset and no final thumbnail asset.

**No exercise, phase or session may be changed from `draft` to `published` merely to make the patient UI visible.**

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

## 6. Safety / recommendation gate — FOUNDATION READY, CLINICAL REVIEW REQUIRED

- Safety acknowledgement version `1.0.0` is active.
- Recommendation engine version `1.0.0` is active.
- Safety remains authoritative over recommendation and commerce.
- A RED safety outcome must block automatic programme recommendation/start and cannot be overridden by acknowledgement.
- The patient-facing M05/M06/M07 flow is not yet wired into the public frontend and therefore must not be considered launched.
- Safety questions, wording and recommendation mappings require clinical review before public activation.

## 7. Media gate — DEFERRED BY PRODUCT DECISION

Real exercise-video production is deliberately postponed. M13 uses image placeholders with a Play control. This is acceptable for development/QA only. Final exercise media must not be implied to exist before production and clinical review.

## 8. Release decision

**M00–M14 technical foundations: substantially implemented.**

**Commercial/clinical production release: STOP.**

The next safe work is to resolve the gates rather than mass-publish content. Recommended order:

1. finish M15 technical security/QA items that do not require external facts;
2. supply and legally review operator/legal information;
3. conduct structured clinical review and governance of content;
4. wire and QA the M05 → M06 → M07 patient-facing finder/safety/recommendation flow while keeping health answers transient;
5. activate checkout only after legal withdrawal/contract requirements and Stripe end-to-end testing are complete;
6. publish only clinically approved programme content;
7. produce/replace final exercise media when the video-production workflow is approved.
