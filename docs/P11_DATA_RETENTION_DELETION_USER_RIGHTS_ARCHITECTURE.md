# P11 — Data Retention, Deletion & User Rights Architecture

Status: **ARCHITECTURE COMPLETE — IMPLEMENTATION NOT STARTED**

Date: 2026-09-06

Reference repository: `BillBidias/bill-care`

Reference branch before P11: `main`

Reference commit before P11: `b1997b1cb8c0edb74bd92b54e8c92381a86c2667`

P11 is an architecture/governance phase only. It does not delete user data, does not change Supabase schema/RLS/functions, does not create an account-deletion endpoint and does not activate any retention schedule.

Legal/tax applicability remains subject to professional validation before any destructive automation is enabled.

---

## 1. Objective

Create one coherent architecture for:

- data retention;
- access requests;
- user data export / portability;
- rectification;
- erasure / account closure;
- restriction / objection handling;
- legal-retention exceptions;
- auditability of privacy requests;
- safe deletion of Supabase Auth users without breaking commerce, payment, RBAC or therapeutic data boundaries.

The architecture must preserve Privacy by Design and avoid a parallel identity/payment system.

---

# CURRENT STATE

## 2. Current processing inventory

P10 reconciled the privacy inventory with the real application.

Current user-linked domains include:

1. Supabase Auth identity and sessions;
2. `profiles`;
3. transient Program Finder / safety inputs;
4. `orders` / `order_items`;
5. `payment_attempts` / `payment_events`;
6. `entitlements`;
7. `programme_enrollments`;
8. `programme_session_progress`;
9. `programme_exercise_completions`;
10. Admin memberships, assignments and audit events;
11. browser-local cart, consent and Supabase Auth session data.

Detailed symptom / ICD-10 / safety answers are not persistently stored by the audited current Finder/checkout flows. This minimisation must be preserved.

## 3. Current user-rights implementation

Verified current state:

- profile display name / language can be edited;
- user can sign out;
- there is no self-service personal-data export;
- there is no self-service account deletion;
- there is no privacy-request workflow/status tracking;
- there is no automated retention/purge engine;
- there is no implemented legal-hold mechanism;
- no Supabase Storage bucket currently exists for user uploads or generated exports.

## 4. Current deletion constraints in the live schema

The current foreign-key graph means a naïve `auth.users` deletion is not a safe account-erasure mechanism.

Verified constraints include:

- `profiles.id -> auth.users(id) ON DELETE CASCADE`;
- `entitlements.user_id -> auth.users(id) ON DELETE CASCADE`;
- `programme_enrollments.user_id -> auth.users(id) ON DELETE CASCADE`;
- `orders.user_id -> auth.users(id) ON DELETE RESTRICT`;
- `admin_memberships.user_id -> auth.users(id) ON DELETE CASCADE`;
- `admin_customer_assignments.customer_user_id/admin_user_id -> auth.users(id) ON DELETE CASCADE`;
- `admin_audit_log.actor_user_id/target_user_id -> auth.users(id) ON DELETE SET NULL`;
- `programme_session_progress` and `programme_exercise_completions` depend on enrolment;
- enrolments reference entitlements with `ON DELETE RESTRICT`;
- entitlements can reference orders and order items with `ON DELETE RESTRICT`;
- payment attempts reference orders with `ON DELETE RESTRICT`.

Consequences:

1. an Auth hard-delete can be blocked by an existing order;
2. relying only on cascades can collide with therapeutic/payment dependencies;
3. deleting a whole commerce chain can destroy evidence that may need statutory retention;
4. a deterministic, server-side deletion sequence is required.

---

# PROBLEMS

## 5. Problems to solve

### P11-P1 — Identity is too tightly coupled to the commerce ledger

`orders.user_id` is mandatory and `ON DELETE RESTRICT`.

A future user cannot be fully removed from Auth while a retained order remains linked directly to the Auth identity.

### P11-P2 — Therapeutic usage and commerce retention have different purposes

Programme enrolment/progress may reveal health or care-pathway information and should not automatically inherit the retention period of accounting/payment records.

### P11-P3 — No request lifecycle exists

The system currently cannot prove when a privacy request was received, verified, processed, partially retained or completed.

### P11-P4 — No safe export boundary exists

An export must include the user's information without exposing:

- another user's data;
- service-role secrets;
- internal security secrets;
- third-party data embedded in audit metadata;
- raw payment credentials.

### P11-P5 — No retention rules are legally approved

P10 intentionally left retention and legal-basis fields unresolved.

P11 must not manufacture definitive durations.

---

# KEEP

## 6. Existing architecture that must be preserved

- Supabase Auth remains the account identity provider.
- RLS remains the primary per-user database access boundary.
- service-role credentials remain server-only.
- Stripe webhook/server payment status remains authoritative.
- browser success never creates paid status or entitlement.
- entitlements remain authoritative for programme access.
- enrollment remains separate from entitlement.
- detailed Program Finder and checkout Safety answers remain transient.
- Program Finder RED blocking remains unchanged.
- checkout RED / AMBER safety blocking remains unchanged.
- Admin RBAC remains server-verified.
- privacy/legal texts remain draft until operator/legal inputs are validated.
- DE / FR / EN foundations remain intact.

---

# IMPROVE

## 7. Retention architecture principle

Retention must operate by **data purpose/domain**, not by one global “keep account for X years” rule.

Target domains:

| Domain | Current data | P11 target treatment | Duration status |
| --- | --- | --- | --- |
| Transient health/safety input | Finder state, checkout safety answers | Process only as needed; no persistent user record | Current minimisation preserved |
| Account identity | Auth email/user, profile | Keep while account is required; erase on validated closure unless a specific exception applies | **LEGAL_REVIEW_REQUIRED** for exceptional retention |
| Therapeutic usage | entitlement, enrollment, session/exercise progress | Treat as sensitive; erase/anonymise when no longer necessary and on valid erasure where no exception applies | **LEGAL/CLINICAL REVIEW_REQUIRED** |
| Commerce ledger | orders, items, payment records | Retain only the minimum required for contract/accounting/tax/legal claims; decouple from live Auth identity | **LEGAL/TAX REVIEW_REQUIRED** |
| Admin/security audit | roles, assignments, audit events | Retain minimum evidence needed for governance/security; remove or null user links when no longer necessary | **LEGAL/SECURITY REVIEW_REQUIRED** |
| Privacy-request evidence | request status/events | Keep minimum evidence that a request was processed, without re-creating erased data | **LEGAL_REVIEW_REQUIRED** |
| Browser local state | cart, consent, Auth tokens | Clear current-device account/auth state on closure; no hidden server copy | Technical rules already partly defined |

No future implementation may use one retention duration for all these domains.

## 8. Storage limitation rule

For every persistent data domain, a future retention rule must have all of the following before activation:

- purpose;
- data category;
- retention trigger (for example order year-end, account closure, request completion);
- duration or review interval;
- action at expiry (`delete`, `anonymise`, `review`, `retain-under-hold`);
- legal/contractual/clinical justification reference;
- owner/approver;
- rule version;
- effective date.

If one of these fields is missing, automatic deletion for that category must remain disabled.

---

# ADD

## 9. Future privacy-request foundation

Future implementation should introduce a private, auditable request lifecycle rather than handling deletion through a frontend-only button.

Recommended conceptual records:

### `privacy_requests`

Purpose: one record per data-subject request.

Required concepts:

- request id;
- request type: `access`, `export`, `rectification`, `erasure`, `restriction`, `objection`;
- requester user id while the account still exists, nullable after final account deletion;
- request status;
- requested timestamp;
- identity-verification timestamp/method;
- processing start/completion timestamp;
- legal response deadline;
- outcome category;
- optional narrowly scoped retention/exception reason;
- request version / implementation version.

The record must not contain symptom answers, ICD-10 data, clinical free text, passwords, tokens or payment-card data.

### `privacy_request_events`

Purpose: append-only operational trace of material privacy-request actions.

Examples:

- request received;
- identity verified;
- export generated;
- erasure started;
- data category erased;
- category retained under approved exception;
- Auth user removed;
- request completed;
- request rejected/partially fulfilled with reason.

This is compliance evidence, not a place to duplicate the user's erased personal data.

### Legal hold / retention exception

If legally required, implement a narrowly scoped hold concept linked to a data domain rather than an all-account “do not delete anything” flag.

Every hold must have:

- reason;
- affected category;
- owner/approver;
- start date;
- review/expiry date where applicable.

No indefinite silent hold.

## 10. User-facing request channels

Target model:

1. **Primary:** authenticated self-service from Account/Privacy settings.
2. **Fallback:** manual contact channel for a user who cannot access the account, followed by appropriate identity verification.

Do not execute erasure solely from possession of an email address.

Do not expose an Admin Auth delete operation directly to the browser.

## 11. Rights workflow

### Access

The platform must be able to confirm whether personal data is processed and provide a user-specific copy plus the required processing information.

### Export / portability

Recommended MVP export format: versioned UTF-8 JSON, generated server-side on demand.

Suggested sections:

- account identity data safe to disclose;
- profile;
- orders / order items;
- payment status and safe provider references where appropriate;
- entitlements;
- enrollments;
- session progress;
- exercise completions;
- relevant user-linked Admin/privacy-request information where disclosure does not expose another person or internal security data.

Do not export:

- service-role keys;
- Stripe secret/webhook secrets;
- password hashes;
- other users' records;
- internal permission material not constituting the user's personal data;
- unfiltered audit metadata that contains third-party information.

For the initial implementation, prefer streaming/downloading the export rather than creating a long-lived public file. If a generated export must later be stored, it must use private storage and short-lived access with an explicit deletion rule.

### Rectification

- Keep the existing self-service profile correction.
- Historical payment/order state must not be silently overwritten simply because the user requests a correction; corrections must preserve required accounting/audit integrity.
- Any correction to therapeutic progress must preserve patient ownership and clinical traceability rules.

### Restriction / objection

These rights depend on the applicable legal basis and circumstances. Until those bases are validated, implement them first as a tracked privacy request requiring review, not as an automatic destructive frontend action.

### Erasure

Erasure is a controlled workflow, not a single SQL cascade.

---

# TARGET STATE

## 12. Target account-erasure sequence

The target implementation must be server-side, authenticated/verified, idempotent and safe to retry.

### Step 1 — Verify the request

- identify the requesting account;
- require suitable recent authentication / identity verification;
- create or update the privacy request;
- prevent duplicate destructive execution for the same request.

### Step 2 — Resolve retention exceptions

Before deletion:

- determine whether an active order/payment/refund/dispute requires temporary processing;
- determine which commerce records are subject to an approved retention obligation;
- determine whether a legal hold exists;
- record each retained category and reason.

A valid exception for one category must not automatically block deletion of unrelated health/profile data.

### Step 3 — Produce export when required/requested

Generate the user's data export before destructive deletion if the workflow requires it.

### Step 4 — Erase therapeutic usage data that is not required to be retained

Perform an explicit dependency-aware deletion, including as applicable:

1. exercise/session progress;
2. programme enrollments;
3. entitlements.

Do not rely on uncertain cascade ordering across the existing RESTRICT relationships.

### Step 5 — Remove account/profile/admin assignments

Remove data whose purpose depends on the live account, including as applicable:

- profile;
- customer/admin assignments;
- admin membership for the deleted account.

Existing audit actor/target foreign keys can become null, but audit metadata must also be checked for unnecessary personal identifiers.

### Step 6 — Decouple retained commerce from live Auth identity

A future schema migration must remove the current hard blocker:

`orders.user_id NOT NULL -> auth.users(id) ON DELETE RESTRICT`

Recommended target principle:

- allow the retained order ledger to survive account deletion without retaining a live Auth foreign key;
- use `ON DELETE SET NULL` or another explicitly reviewed detached-identity design;
- do not invent an extra permanent customer identifier unless a validated legal/business purpose requires it;
- retain only identity fields that are specifically required for the approved retention purpose.

Current owner-only RLS can continue using `orders.user_id = auth.uid()` while the account is active. Once identity is detached, the former user must no longer be able to read the retained ledger through the user API.

### Step 7 — Delete the Supabase Auth user server-side

Use the Supabase Admin API only from a trusted server/Edge Function context.

Final erasure should not be implemented as a browser call and must never expose the service-role/secret key.

A Supabase Auth soft delete is not automatically equivalent to final erasure because it retains an Auth record in a pseudonymised/disabled form. It may be useful only if a deliberately approved intermediate retention state requires it.

### Step 8 — Verify deletion

After execution, verify at minimum:

- no live Auth user remains for final hard deletion;
- no profile remains;
- no entitlement/enrollment/progress remains unless a separately approved exception explicitly requires it;
- no admin membership/assignment remains for that account;
- retained commerce rows are no longer directly attached to the deleted Auth account;
- no unexpected Storage objects exist for the user;
- privacy request contains only the minimal completion evidence.

### Step 9 — Complete request and notify

Record completion/partial retention outcome and communicate clearly which categories were erased and which, if any, were retained under a validated exception.

---

## 13. Auth/session non-regression requirement

Supabase Auth uses JWTs. Removing a user removes server-side Auth sessions/refresh capability, but an already issued access JWT can remain cryptographically valid until expiry.

Therefore future deletion implementation must:

- execute destructive operations server-side;
- ensure deleted-user rows/entitlements are gone or detached before completion;
- use suitably short JWT expiry and/or session-id validation for especially sensitive operations when needed;
- never assume that deleting browser localStorage alone revokes every session.

This requirement must be considered together with the final preproduction Auth hardening step already deferred in P07.

---

# LEGAL / REGULATORY GUARDRAILS

## 14. GDPR operational requirements to design for

Current official EU guidance requires organisations to support rights including access, rectification, erasure, restriction, objection and portability and to establish clear procedures.

Electronic requests should be supportable electronically, and the normal response deadline is one month, subject to the GDPR rules on extensions and exceptions.

The architecture must track request receipt/deadline/status rather than relying on an untracked mailbox conversation.

Storage limitation requires personal data to be kept no longer than necessary and for controllers to establish deletion or review limits.

Official reference points used for P11:

- European Commission — GDPR principles / storage limitation:
  `https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en`
- European Commission — dealing with data-subject requests:
  `https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/dealing-requests-individuals_en`
- European Data Protection Board — data-subject rights:
  `https://www.edpb.europa.eu/topics/key-gdpr-concepts/data-subject-rights_en`
- EDPB — Guidelines 01/2022 on the right of access:
  `https://www.edpb.europa.eu/documents/guideline/guidelines-012022-on-data-subject-rights-right-of-access_en`

## 15. German commercial/tax retention references

Current German law includes different statutory retention periods for different accounting/business-record categories.

As of P11 review:

- HGB §257(4) states 10 years for the records listed in §257(1) no. 1, 8 years for accounting vouchers under no. 4, and 6 years for the other listed records;
- AO §147(3) likewise includes 10-year, 8-year and 6-year categories.

Official references:

- `https://www.gesetze-im-internet.de/hgb/__257.html`
- `https://www.gesetze-im-internet.de/ao_1977/__147.html`

**P11 does not decide that every `orders`, `order_items`, `payment_attempts` or `payment_events` row is legally one of those documents.**

The mapping between application records and legally required accounting/contract records must be validated with the operator's legal/tax/accounting advisers before a retention duration is activated.

Do not hard-code “8 years” merely because the database row relates to a payment.

---

# CHANGE PLAN

## 16. Recommended incremental implementation after P11

### P12 — Privacy Requests & Export Foundation

Non-destructive first implementation:

- privacy request data model;
- RLS/least-privilege model;
- authenticated request creation;
- access/export generation for own data;
- request status/audit trail;
- no account erasure yet;
- no retention scheduler yet.

### P13 — Erasure Orchestrator & Commerce Identity Detachment

Only after legal/tax retention categories have been reviewed sufficiently to avoid destroying required records:

- make retained commerce compatible with Auth deletion;
- implement dependency-aware therapeutic/account erasure;
- implement server-only Auth deletion;
- implement idempotency and post-delete verification;
- add negative cross-user tests.

### Later retention scheduler

Automated expiry/purge should be introduced only after each retention rule has an approved versioned duration/trigger/action.

---

# RISKS

## 17. Main risks

### Risk A — deleting too much

Could destroy accounting, payment, dispute, security or legal evidence.

Mitigation: domain-specific retention + approved exception handling.

### Risk B — retaining too much

Could retain health-related progression indefinitely merely because an order must be retained.

Mitigation: decouple therapeutic data from commerce ledger.

### Risk C — incomplete Auth deletion

Could leave a live account/session after “account deleted” is shown to the user.

Mitigation: server-side Auth deletion + verification + session/JWT consideration.

### Risk D — cross-user export

A poorly scoped export could become a serious privacy breach.

Mitigation: ownership filters, RLS, server-side allowlist, negative tests.

### Risk E — audit log becomes a hidden PII archive

Free-form metadata could reintroduce data that was supposedly erased.

Mitigation: structured metadata allowlist; no clinical/free-text payloads in privacy/audit logs.

### Risk F — irreversible deletion during payment dispute/refund

Mitigation: evaluate active transaction state and approved holds before destructive execution.

---

# MUST PRESERVE

## 18. Non-regression requirements

- B2C-first journey.
- clinical Safety Screening.
- RED recommendation/start block.
- checkout RED/AMBER block.
- server-authoritative pricing.
- server-authoritative Stripe confirmation.
- browser cannot mark paid.
- browser cannot create entitlement.
- entitlement remains access authority.
- patient ownership boundaries.
- Auth + RLS + Admin RBAC.
- payment service-role mutation boundary.
- detailed health/safety-answer minimisation.
- DE / FR / EN.
- versioned Supabase migrations.
- published Git history.
- P07 final-preproduction leaked-password task remains deferred, not forgotten.

---

# MUST NOT BREAK

## 19. Prohibited shortcuts

Do not:

- expose `service_role`/secret keys to implement account deletion;
- implement account deletion as `supabase.auth.signOut()` only;
- treat a frontend row delete as full data-subject erasure;
- hard-delete all order/payment records without retention review;
- retain therapeutic progress for an accounting period by default;
- assume soft-delete equals GDPR erasure;
- put health answers/ICD-10/free text into privacy-request audit metadata;
- make a privacy export readable by another user;
- create a public Storage bucket for exports;
- silently change payment/entitlement semantics;
- weaken RLS for convenience;
- invent a legal basis or retention period.

---

# TEST PLAN

## 20. Tests required for future implementation

### Access/export

- authenticated user can request own export;
- unauthenticated user cannot obtain an export;
- user A can never export user B data;
- export contains expected own-data sections;
- export contains no secrets;
- export does not leak third-party audit data;
- malformed/replayed request is safely rejected/idempotent as appropriate.

### Erasure

- deletion of a user with no order succeeds safely;
- deletion of a user with retained orders succeeds after identity detachment;
- programme progress/completions are removed according to the approved rule;
- enrollments are removed before entitlements where required by FK dependencies;
- retained commerce does not preserve an unnecessary live Auth link;
- Admin assignments/membership are removed;
- audit actor/target behaves as designed;
- Auth user is removed server-side;
- refresh-session access cannot be renewed after deletion;
- post-delete verification returns no unexpected user-linked rows;
- repeated execution does not corrupt data.

### Non-regression

- P01 RED safety tests remain green;
- checkout safety remains green for expected GREEN/AMBER/RED behavior;
- payment webhook remains authoritative;
- entitlements for non-deleted users remain unchanged;
- patient A cannot access patient B;
- Admin RBAC remains intact;
- build/tests pass.

---

# P11 DECISION

## 21. Architecture decision

**P11 establishes the target architecture but does not authorize destructive implementation.**

The key technical decision is:

> Account erasure must be a verified server-side orchestration that deletes/detaches identity and health-related usage data by purpose while allowing only the minimum legally validated commerce/audit records to survive independently of the live Supabase Auth identity.

No retention duration is considered validated by P11.

Commercial/clinical production release remains **STOP**.
