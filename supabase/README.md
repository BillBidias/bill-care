# Supabase (foundation only)

State: no Supabase project is connected yet. This directory exists so future schema
changes are expressed as explicit, reviewable migrations in `supabase/migrations/`
instead of manual dashboard edits.

Rules:
- One timestamped SQL file per change, forward-only; do not rewrite applied migrations.
- Every `CREATE TABLE` in `public` must be followed by GRANTs, then RLS enable, then policies.
- No business schema exists yet (P03 is infrastructure foundation only).
- `config.toml` is intentionally absent until a real project is linked.

Server-only secrets (service role, payment, video, email keys) must never appear here or in `src/`.
