# Dein Digital-PHYSIO

Digital physiotherapy platform offering therapeutic video exercise programmes, with patient-facing and admin-facing features, a non-diagnostic programme finder, safety screening, trusted checkout, Stripe payments, and full GDPR compliance. Built for the German market with a trilingual UI (FR/EN/DE).

## Features

- **Programme Finder** — an 8-step wizard (body region → symptoms → limitations → goal → ICD-10 → safety check → acknowledgment → ranked recommendations) that recommends programmes without making a medical diagnosis
- **Programme catalogue** — browse therapeutic exercise programmes by body area
- **Safety engine** — screens users with a 3-tier risk evaluation (GREEN / AMBER / RED); RED blocks checkout, AMBER requires professional acknowledgment
- **Recommendation engine** — non-diagnostic weighted scoring from body region, assessment signals, goals, and ICD-10
- **Shopping cart & trusted checkout** — cart stores only programme IDs; a server-side PostgreSQL function recomputes the authoritative price and re-validates safety answers
- **Stripe payments** — Checkout Sessions created via a Supabase Edge Function, confirmed by a signed webhook
- **Patient dashboard** — enrolled programmes, progress tracking, start / resume / pause
- **Admin dashboard** — customer management, team, RBAC roles, revenue summary
- **Authentication** — Supabase Auth (email/password), UX route guards backed by Server (RLS) authorization
- **GDPR compliance** — consent manager (fail-closed), privacy export & erasure, full data-processing inventory

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5.8 |
| Build | Vite 7 (SWC) |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Server state | TanStack Query |
| Forms | react-hook-form + Zod |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, RLS) |
| Payments | Stripe |
| Testing | Vitest + Testing Library + jsdom |
| Deploy | Vercel |

## Prerequisites

- Node.js 18+
- npm
- (Optional) A Supabase project and a Stripe account for backend features

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# 3. Start the dev server (port 8080)
npm run dev
```

The app runs as a **static prototype** even when Supabase is not configured — the programme catalogue degrades to a local typed fallback.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

## Environment Variables

All values are **public, browser-safe** — never put server-only secrets here.

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable / anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference (non-secret) |

Server-only secrets belong in the Supabase Edge Function environment:

| Edge Function | Secrets |
|---|---|
| `stripe-checkout` | `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ORIGIN` |
| `stripe-webhook` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `privacy-erasure` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ORIGIN` |

## Project Structure

```
bill-care/
├── src/
│   ├── auth/               # AuthProvider, route guards, validation, messages
│   ├── components/         # Shared UI (Navbar, Footer, sections) + shadcn/ui
│   ├── data/               # Repository layer (*Repository.ts) — UI never queries Supabase directly
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Supabase client setup
│   ├── legal/              # Legal documents, GDPR privacy/storage inventories
│   ├── lib/                # i18n, cart, consent providers, utilities
│   ├── pages/              # Route-level page components
│   └── test/               # Vitest test files
├── supabase/
│   ├── functions/          # Edge Functions (stripe-checkout, stripe-webhook, privacy-erasure)
│   └── migrations/         # SQL migrations (58 files)
├── docs/                   # Security & production gate documents
└── .github/workflows/      # CI (push to any branch)
```

## Testing

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# Run a single test file
npx vitest run src/test/cart.test.tsx
```

## Deployment

Hosted on Vercel as an SPA. `vercel.json` configures:

- SPA catch-all rewrite to `index.html`
- Security headers (HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, permissions policy)

CI runs on push to any branch (`.github/workflows/ci.yml`): lint, typecheck, test, build.

## License

Proprietary — all rights reserved.
