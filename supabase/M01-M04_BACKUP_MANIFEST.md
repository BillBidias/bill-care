# Supabase M01–M04 Backup Manifest

Project: `bill-care-dev`
Project ref: `ezwkeoapkmeftbbhdjua`
Backup date: 2026-08-25

This manifest records the Supabase migrations now mirrored in GitHub under `supabase/migrations/`.

## Existing baseline already present

- 20260819222459_create_programme_catalogue.sql
- 20260820205121_seed_programme_catalogue.sql
- 20260820222829_catalogue_public_read_policy.sql
- 20260821231343_user_profile_foundation.sql
- 20260822111531_order_foundation.sql
- 20260822235637_order_items_programme_index.sql

## M01 — Clinical taxonomy

- 20260824233112_clinical_taxonomy_foundation.sql
- 20260824233520_seed_clinical_taxonomy.sql

## M02 — Exercise content

- 20260825000526_exercise_content_foundation.sql
- 20260825052429_multilingual_language_registry.sql
- 20260825052450_align_languages_with_competitor_benchmark.sql
- 20260825061128_seed_knee_exercise_pilot.sql

## M03 — Structured programme

- 20260825145305_structured_program_foundation.sql
- 20260825145338_seed_knee_structured_program_pilot.sql

## M04 — Discovery

- 20260825145757_programme_discovery_read_model.sql

## Safety notes

- External Supabase remains authoritative for database administration.
- Lovable Cloud must not be reactivated.
- Browser publishable keys are never administrative migration credentials.
- Exercise and structured programme content remains draft/private until entitlement-aware access is implemented.
- DE/FR/EN are active core languages; ES/PT/IT are registered for later reviewed activation.

## Working rule from this point forward

For every new database step:

1. Review migration.
2. Apply to `bill-care-dev`.
3. Save the corresponding SQL file in `supabase/migrations/`.
4. Commit to GitHub.
5. Verify Supabase and GitHub before continuing.
