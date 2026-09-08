# ARCHITECTURE.md — Dein Digital-PHYSIO

> Digital physiotherapy platform offering therapeutic video exercise programmes, with patient-facing and admin-facing features, Stripe checkout, and GDPR compliance. German market (HTML `lang="de"`), trilingual UI (FR/EN/DE).

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Flow](#3-data-flow)
4. [API Communication](#4-api-communication)
5. [State Management](#5-state-management)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Testing](#7-testing)

---

## 1. Folder Structure

```
bill-care/
├── .env / .env.example              # Supabase public env vars (VITE_*)
├── components.json                   # shadcn/ui configuration
├── eslint.config.js                  # ESLint flat config
├── index.html                        # Vite SPA entry point (lang="de")
├── package.json                      # Dependencies & scripts
├── postcss.config.js                 # PostCSS: tailwindcss + autoprefixer
├── tailwind.config.ts                # Tailwind + shadcn/ui theme tokens
├── tsconfig.json                     # Root TS config (project references)
├── tsconfig.app.json                 # App TS config
├── tsconfig.node.json                # Node TS config (vite.config only)
├── vercel.json                       # SPA rewrites + security headers
├── vite.config.ts                    # Vite 7 + SWC + path aliases
├── vitest.config.ts                  # Vitest test config
│
├── dev/workshops/                    # Development workshop materials
│
├── docs/                             # Security & production gate documents
│   ├── M15_PREPRODUCTION_GATE.md
│   ├── P11_DATA_RETENTION_DELETION_USER_RIGHTS_ARCHITECTURE.md
│   ├── P16_DEPENDENCY_SECURITY_AUDIT.md
│   ├── P17_REACT_ROUTER_7_SECURITY_MIGRATION.md
│   ├── P18_VITE_BUILD_CHAIN_SECURITY_REMEDIATION.md
│   ├── P19_RESIDUAL_PRODUCTION_DEPENDENCY_SECURITY.md
│   └── P20_DEV_TOOLING_DEPENDENCY_SECURITY.md
│
├── public/                           # Static assets (images, favicon, robots.txt)
│
├── src/
│   ├── main.tsx                      # React entry: createRoot → <App />
│   ├── App.tsx                       # Root: providers + routing
│   ├── App.css / index.css           # Global styles + Tailwind theme
│   │
│   ├── auth/                         # Authentication module (6 files)
│   │   ├── AuthProvider.tsx           # Supabase Auth context
│   │   ├── RequireAuth.tsx           # Auth route guard
│   │   ├── RequireAdmin.tsx          # Admin RBAC route guard
│   │   ├── useAuth.ts               # useAuth() hook
│   │   ├── validation.ts            # Zod schemas (login/register)
│   │   └── messages.ts              # Localized auth error messages
│   │
│   ├── components/                   # Shared UI components
│   │   ├── Navbar.tsx               # Top nav with language switch
│   │   ├── Footer.tsx               # Footer with legal links
│   │   ├── HeroSection.tsx          # Landing page hero
│   │   ├── ConsentBanner.tsx        # Cookie consent dialog
│   │   ├── LegalLayout.tsx          # Shared legal document layout
│   │   └── ui/                      # shadcn/ui component library (49 files)
│   │       ├── button.tsx, card.tsx, dialog.tsx, form.tsx, ...
│   │       └── use-toast.ts
│   │
│   ├── data/                         # Repository layer (20 files)
│   │   ├── programs.ts              # Local fallback programme catalogue
│   │   ├── categories.ts            # 10 programme category keys
│   │   ├── catalogueRepository.ts   # Supabase catalogue reads
│   │   ├── adminRepository.ts       # Admin RBAC + dashboard RPCs
│   │   ├── assessmentRepository.ts  # Assessment config + ranking
│   │   ├── checkoutRepository.ts    # Trusted checkout order via RPC
│   │   ├── enrollmentRepository.ts  # Enrollment lifecycle via RPCs
│   │   ├── entitlementRepository.ts # Programme entitlement checks
│   │   ├── patientHomeRepository.ts # Patient dashboard data via RPC
│   │   ├── paymentRepository.ts     # Stripe checkout + order status
│   │   ├── privacyRepository.ts     # GDPR export/erasure
│   │   ├── profileRepository.ts     # User profile CRUD (RLS)
│   │   ├── programFinderRepository.ts # Finder config + safety + ranking
│   │   ├── progressRepository.ts    # Exercise progress tracking
│   │   ├── recommendationRepository.ts # Recommendation engine
│   │   ├── safetyRepository.ts      # Safety screening engine
│   │   ├── sessionExperienceRepository.ts # Session detail loading
│   │   ├── checkoutRepository.test.ts    # Co-located tests
│   │   └── recommendationRepository.test.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-mobile.tsx           # Responsive breakpoint hook
│   │   ├── use-toast.ts             # Toast notification hook
│   │   └── useCatalogue.ts          # Catalogue with local fallback
│   │
│   ├── integrations/supabase/        # Supabase client setup
│   │   ├── client.ts                # Lazy singleton createClient()
│   │   └── config.ts                # Public key parser + env leak guard
│   │
│   ├── legal/                        # Legal/compliance module
│   │   ├── documents.ts             # Legal document version metadata
│   │   ├── legalConfig.ts           # Business identity config
│   │   ├── privacyInventory.ts      # GDPR data processing inventory
│   │   └── storageInventory.ts      # Browser storage audit
│   │
│   ├── lib/                          # Shared utilities & context providers
│   │   ├── utils.ts                 # cn() = clsx + tailwind-merge
│   │   ├── i18n.tsx                 # Trilingual i18n (FR/EN/DE)
│   │   ├── cart.tsx                 # Shopping cart context (localStorage)
│   │   └── consent.tsx              # Cookie consent manager (localStorage)
│   │
│   ├── pages/                        # Route-level page components (22 files)
│   │   ├── Index.tsx                # Landing page
│   │   ├── LoginPage.tsx            # Login form
│   │   ├── RegisterPage.tsx         # Registration form
│   │   ├── AccountPage.tsx          # Profile/account management
│   │   ├── PatientHomePage.tsx      # Patient dashboard
│   │   ├── PatientSessionPlaceholderPage.tsx # Session detail
│   │   ├── AdminDashboardPage.tsx   # Admin dashboard (RBAC)
│   │   ├── ProgramsPage.tsx         # Programme catalogue
│   │   ├── ProgramFinderPage.tsx    # 8-step finder wizard
│   │   ├── CartPage.tsx             # Shopping cart + Stripe checkout
│   │   ├── CheckoutSuccessPage.tsx  # Post-payment page
│   │   ├── TrainingVideosPage.tsx   # Training videos
│   │   ├── PurchaseSimulationPage.tsx # Purchase simulation
│   │   ├── AboutPage.tsx            # About page
│   │   ├── ExamplePage.tsx          # Example/demo page
│   │   ├── NotFound.tsx             # 404 page
│   │   ├── ImpressumPage.tsx        # Legal: Impressum
│   │   ├── PrivacyPage.tsx          # Legal: Privacy policy
│   │   ├── TermsPage.tsx            # Legal: T&C
│   │   ├── WithdrawalPage.tsx       # Legal: Withdrawal
│   │   ├── CookiesPage.tsx          # Legal: Cookie policy
│   │   └── MedicalDisclaimerPage.tsx # Legal: Medical disclaimer
│   │
│   └── test/                         # Test files (14 files)
│       ├── setup.ts                 # Vitest setup: jest-dom + matchMedia
│       ├── example.test.ts          # Smoke test
│       ├── auth.test.tsx            # Auth component tests
│       ├── account.test.tsx         # Account page tests
│       ├── cart.test.tsx            # Cart context tests
│       ├── categories.test.ts       # Category key tests
│       ├── catalogueRepository.test.ts
│       ├── legal-consent.test.tsx   # Consent manager tests
│       ├── paymentRepository.test.ts
│       ├── privacyRepository.test.ts
│       ├── profileRepository.test.ts
│       ├── programs.test.ts
│       ├── program-finder-red-safety.test.tsx
│       └── supabase-config.test.ts
│
└── supabase/                         # Supabase backend
    ├── config.toml                   # Project ID: ezwkeoapkmeftbbhdjua
    ├── functions/                    # Edge Functions (3)
    │   ├── stripe-checkout/index.ts  # Creates Stripe checkout sessions
    │   ├── stripe-webhook/index.ts   # Handles Stripe webhooks
    │   └── privacy-erasure/index.ts  # GDPR data erasure
    └── migrations/                   # 58 SQL migration files
```

---

## 2. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     VERCEL (Hosting)                     │
│          SPA + Security Headers + Edge Caching           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────────────────────────────────────┐      │
│   │              React SPA (Client)               │      │
│   │  ┌─────────┬──────────┬──────────┬────────┐  │      │
│   │  │  Pages  │ Components│  Hooks   │  Lib   │  │      │
│   │  └────┬────┴─────┬────┴────┬─────┴───┬────┘  │      │
│   │       │          │         │          │       │      │
│   │  ┌────▼──────────▼─────────▼──────────▼────┐  │      │
│   │  │         Data / Repository Layer          │  │      │
│   │  │       (20 *Repository.ts files)          │  │      │
│   │  └────────────────┬────────────────────────┘  │      │
│   │                   │                           │      │
│   │  ┌────────────────▼────────────────────────┐  │      │
│   │  │     Supabase JS Client (browser)        │  │      │
│   │  └────────────────┬────────────────────────┘  │      │
│   └───────────────────┼───────────────────────────┘      │
│                       │                                   │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTPS
         ┌──────────────┼──────────────────┐
         │              │                  │
    ┌────▼────┐   ┌─────▼─────┐   ┌───────▼───────┐
    │Supabase │   │ Supabase  │   │    Stripe      │
    │Database │   │   Auth    │   │  (Checkout +   │
    │(Postgres│   │           │   │   Webhooks)    │
    │ + RLS)  │   └───────────┘   └───────────────┘
    └────┬────┘
         │
    ┌────▼──────────┐
    │   Supabase    │
    │ Edge Functions│
    │ (3 functions) │
    └───────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18.3 + TypeScript 5.8 |
| **Build** | Vite 7.3 + SWC (fast compilation) |
| **Routing** | react-router-dom 7.18 (BrowserRouter) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui (Radix UI primitives) |
| **Animation** | Framer Motion 11 |
| **Charts** | Recharts 3.10 |
| **Forms** | react-hook-form 7.61 + Zod 3.25 validation |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions, RLS) |
| **Payments** | Stripe (Checkout Sessions via Edge Functions) |
| **Testing** | Vitest 3.2 + Testing Library + jsdom |
| **Deployment** | Vercel (SPA with security headers) |

### Architectural Patterns

- **Repository Pattern**: All database interactions abstracted behind `*Repository.ts` files; UI never calls Supabase directly
- **Provider Pattern**: Auth, Cart, Consent, and i18n state delivered via React Context
- **Route Guards**: `RequireAuth` and `RequireAdmin` components wrap protected routes
- **Local-First Fallback**: Programme catalogue falls back to local JSON when Supabase is unavailable
- **Fail-Closed Defaults**: Consent manager defaults to denied; Supabase client returns `null` when unconfigured

---

## 3. Data Flow

### 3.1 Programme Discovery Flow

```
User lands on /finder
    │
    ▼
ProgramFinderPage (8-step wizard)
    │
    ├── Step 1: Select body region
    ├── Step 2: Describe symptoms
    ├── Step 3: Movement limitations
    ├── Step 4: Treatment goal
    ├── Step 5: ICD-10 diagnosis (optional)
    ├── Step 6: Safety screening questions  ◄── safetyRepository
    ├── Step 7: Warning/acknowledgement     ◄── safetyRepository
    └── Step 8: Ranked recommendations      ◄── programFinderRepository
                                              (body region + assessment signals
                                               + goals + ICD-10 → weighted scoring)
    │
    ▼
Programme cards with relevance scores
    │
    ▼
User clicks "Add to Cart"  ◄── CartProvider (localStorage: bill-care:cart:v1)
```

### 3.2 Purchase Flow

```
CartPage
    │
    ├── Display cart items (programme IDs → catalogue lookup)
    ├── Login prompt if not authenticated
    │
    ▼
"Proceed to Checkout" button
    │
    ├── Re-validate safety answers     ◄── checkoutSafetyRepository
    ├── Create server-side order       ◄── checkoutRepository (RPC: create_trusted_checkout_order)
    ├── Create Stripe checkout session ◄── paymentRepository (Edge: stripe-checkout)
    │
    ▼
Browser redirects to Stripe-hosted checkout page
    │
    ├── User completes payment on Stripe
    │
    ▼
Stripe webhook fires                   ◄── Edge: stripe-webhook
    │
    ├── Updates order status in DB
    │
    ▼
CheckoutSuccessPage
    │
    ▼
Entitlement created → Programme appears in PatientHomePage
```

### 3.3 Patient Exercise Flow

```
PatientHomePage
    │
    ├── Fetch enrolled programmes     ◄── patientHomeRepository (RPC: get_patient_app_home)
    ├── Display progress bars         ◄── progressRepository (RPC: get_my_programme_progress)
    │
    ▼
User clicks "Start Session"
    │
    ├── Load session exercises        ◄── sessionExperienceRepository
    │   (phases → sessions → exercises → translations)
    │
    ▼
PatientSessionPlaceholderPage
    │
    ├── User completes exercises
    ├── Mark exercises as done        ◄── progressRepository (RPC: complete_programme_exercise)
    │
    ▼
Progress updated in dashboard
```

### 3.4 Safety Evaluation Flow

```
safetyRepository
    │
    ├── Load safety questions          ◄── safety_questions + translations
    ├── Load body-region mappings      ◄── safety_question_body_regions
    ├── User answers questions
    │
    ▼
Evaluate against safety_outcomes
    │
    ├── GREEN  → Proceed normally
    ├── AMBER  → Warning screen, user must acknowledge
    └── RED    → BLOCKED: Cannot proceed to checkout
```

---

## 4. API Communication

### 4.1 Supabase Client Setup

**`src/integrations/supabase/config.ts`** — Parses and validates public env vars:
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Validates URL format; guards against server-only secret leaks
- Returns `null` when unconfigured (graceful degradation for local dev)

**`src/integrations/supabase/client.ts`** — Lazy singleton:
- `getSupabaseClient()` returns a cached `createClient()` instance
- Uses `localStorage` for session persistence
- Returns `null` when unconfigured → app functions as static prototype

### 4.2 Repository Layer

All database interactions go through **20 repository files** in `src/data/`. Components and pages never call Supabase directly.

**Common pattern in every repository:**

```typescript
import { getSupabaseClient } from "@/integrations/supabase/client";

export async function fetchSomething(): Promise<Something[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return fallbackData;    // graceful degradation

  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapRowToInterface);    // manual row → type mapping
}
```

### 4.3 Supabase RPC Calls

Heavy business logic lives in PostgreSQL functions called via `.rpc()`:

| RPC | Purpose |
|-----|---------|
| `create_trusted_checkout_order` | Server-validated order creation with safety answers |
| `start_programme_enrollment` | Begin programme access |
| `pause_programme_enrollment` | Pause active programme |
| `resume_programme_enrollment` | Resume paused programme |
| `get_patient_app_home` | Aggregate patient dashboard data |
| `get_my_programme_progress` | Programme-level progress summary |
| `get_enrollment_completed_exercises` | Per-session exercise completions |
| `complete_programme_exercise` | Mark exercise done |
| `generate_my_privacy_export` | GDPR data export |
| `admin_get_my_access` | Check admin role |
| `admin_get_dashboard_summary` | Admin dashboard stats |
| `admin_list_customers` | Customer list with filters |
| `admin_list_team` | Team member list |
| `admin_grant_role_by_email` | Assign admin role |
| `admin_revoke_role` | Remove admin role |
| `admin_assign_customer` | Link customer to team member |
| `admin_unassign_customer` | Unlink customer |

### 4.4 Supabase Edge Functions

Three serverless functions for operations requiring secrets:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `stripe-checkout` | Client call | Creates Stripe Checkout Session with programme items |
| `stripe-webhook` | Stripe HTTP | Processes payment confirmation, updates order status |
| `privacy-erasure` | Client call | Executes GDPR right-to-erasure |

### 4.5 External APIs

| Service | Communication | Purpose |
|---------|--------------|---------|
| **Stripe** | Edge Function → Stripe API (server-side) | Payment processing |
| **Stripe** | Browser redirect to Stripe-hosted page | Checkout UI |
| **Stripe** | Stripe → Edge Function (webhook) | Payment confirmation |

---

## 5. State Management

**No external state library** (no Redux, Zustand, or MobX). The app uses:

### 5.1 React Context Providers (4)

Wrapped in `App.tsx`, outermost to innermost:

```
QueryClientProvider          ← React Query (configured, limited use)
  └─ I18nProvider            ← Language selection (FR/EN/DE, in-memory)
      └─ TooltipProvider     ← shadcn/ui tooltip context
          └─ AuthProvider    ← Supabase Auth session/user
              └─ ConsentProvider  ← Cookie consent (localStorage)
                  └─ CartProvider ← Shopping cart (localStorage)
                      └─ BrowserRouter
                          └─ Routes
```

| Provider | Storage | Key |
|----------|---------|-----|
| `AuthProvider` | Supabase SDK (localStorage) | `sb-*-auth-token` |
| `CartProvider` | localStorage | `bill-care:cart:v1` |
| `ConsentProvider` | localStorage | `bill-care:consent:v1` |
| `I18nProvider` | In-memory (resets on reload) | — |

### 5.2 React Query

`@tanstack/react-query` is configured at root level but most data fetching currently uses manual `useEffect` + `useState` patterns in page components. The QueryClient is set up for future migration.

### 5.3 Local Component State

Pages and components use standard React patterns:
- `useState` / `useEffect` for data loading and UI toggles
- `react-hook-form` with Zod resolvers for form state and validation
- `useCatalogue()` hook for catalogue data with local fallback + Supabase upgrade

### 5.4 localStorage Schema

| Key | Contents | Provider |
|-----|----------|----------|
| `bill-care:cart:v1` | Array of programme IDs | CartProvider |
| `bill-care:consent:v1` | Consent preferences (necessary, analytics, marketing) | ConsentProvider |
| `sb-ezwkeoapkmeftbbhdjua-auth-token` | Supabase session token | Supabase SDK |

---

## 6. Authentication & Authorization

### 6.1 Authentication (Supabase Auth)

**`src/auth/AuthProvider.tsx`** — Central auth context:

```
┌──────────────────────────────────────────────┐
│                 AuthProvider                   │
│                                               │
│  State: user, session, loading, isAuthAvailable│
│  Actions: signIn, signUp, signOut             │
│                                               │
│  Init: supabase.auth.onAuthStateChange()     │
│        + getSession() on mount               │
│                                               │
│  Error handling: toSafeAuthError()            │
│    → maps raw errors to safe localized keys  │
│    → never exposes internal error details    │
└──────────────────────────────────────────────┘
```

- **Method**: Email/password only (no social logins)
- **Session persistence**: Supabase SDK handles via localStorage
- **Form validation**: Zod schemas in `validation.ts`
  - Login: email + password
  - Register: email + password + confirmPassword (8-char minimum)
- **Error messages**: Fully localized in `messages.ts` (FR/EN/DE)

### 6.2 Route Protection (UX Layer)

**`src/auth/RequireAuth.tsx`**:
- Checks `useAuth().user`
- Shows loading spinner during session check
- Redirects to `/login?from=<currentPath>` if unauthenticated
- Safe return-path whitelist to prevent open redirect

**`src/auth/RequireAdmin.tsx`**:
- Wraps `RequireAuth` logic
- Calls `fetchAdminAccess()` RPC to verify admin role
- Redirects to `/account` if not admin

### 6.3 Authorization (Supabase RLS — Authoritative)

**The route guards above are UX-only.** Actual data authorization is enforced by Supabase Row-Level Security (RLS) policies on every table. Even if a user bypasses the frontend guard, RLS prevents unauthorized data access.

```
Frontend guard (RequireAuth/RequireAdmin)  ← UX convenience
        │
        ▼
Supabase RLS policies                     ← True security boundary
        │
        ▼
PostgreSQL row-level access control
```

### 6.4 Admin RBAC

Four roles managed via `adminRepository.ts`:
- Roles assigned/revoked via RPCs (`admin_grant_role_by_email`, `admin_revoke_role`)
- Role checks via `admin_get_my_access` RPC
- All admin operations are server-side validated

### 6.5 Key Security Points

- No server-only secrets exposed to browser (env leak guard in `config.ts`)
- `isAuthAvailable` flag allows app to run as static prototype without Supabase
- Auth errors never expose internal details to users
- Consent manager uses fail-closed defaults

---

## 7. Testing

### 7.1 Framework & Configuration

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 3.2 | Test runner |
| **@testing-library/react** | 16 | Component testing utilities |
| **@testing-library/jest-dom** | 6.6 | DOM assertion matchers |
| **@testing-library/user-event** | 14.6 | User interaction simulation |
| **jsdom** | 20 | Browser environment simulation |

**`vitest.config.ts`**: jsdom environment, globals enabled, `@` alias resolution.

**`src/test/setup.ts`**: Imports `@testing-library/jest-dom`, mocks `window.matchMedia`.

### 7.2 Test Scripts

```bash
npm test              # Single run (vitest run)
npm run test:watch    # Watch mode (vitest)
```

### 7.3 Test Coverage

16 test files covering key modules:

| Test File | Module Under Test |
|-----------|-------------------|
| `example.test.ts` | Basic smoke test |
| `auth.test.tsx` | AuthProvider, RequireAuth, RequireAdmin |
| `account.test.tsx` | AccountPage rendering |
| `cart.test.tsx` | Cart context (readStoredCart, localStorage) |
| `categories.test.ts` | Programme category key validation |
| `catalogueRepository.test.ts` | Catalogue data mapping & fallback |
| `legal-consent.test.tsx` | Consent manager behavior |
| `paymentRepository.test.ts` | Payment repository logic |
| `privacyRepository.test.ts` | Privacy repository (GDPR) |
| `profileRepository.test.ts` | Profile CRUD operations |
| `programs.test.ts` | Programme data integrity |
| `program-finder-red-safety.test.tsx` | Safety evaluation (RED outcome blocking) |
| `supabase-config.test.ts` | Supabase config validation |
| `checkoutRepository.test.ts` | Checkout order creation (co-located) |
| `recommendationRepository.test.ts` | Recommendation engine scoring (co-located) |

### 7.4 Testing Strategy

- **Co-located tests**: Repository tests placed alongside source in `src/data/`
- **Centralized tests**: Page, component, and context tests in `src/test/`
- **No E2E framework**: No Playwright, Cypress, or similar configured
- **Coverage gaps**: No tests for Supabase Edge Functions, no integration tests against a test database

### 7.5 Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode during development
npm run test:watch

# Run specific test file
npx vitest run src/test/cart.test.tsx
```

---

## Appendix: Production Readiness Notes

| Area | Status |
|------|--------|
| **Legal documents** | All 6 pages in `draft` status with `REQUIRED_INPUT` placeholders |
| **RLS policies** | 58 migrations deployed; RLS is the security boundary |
| **Consent** | Fail-closed; no third-party trackers active |
| **Storage** | Only 3 localStorage keys (cart, consent, auth) |
| **Deployment** | Vercel with CSP, HSTS, X-Frame-Options DENY |
| **Dependencies** | Security audit documented in `docs/P16-P20` |
