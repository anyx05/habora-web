# Habora

> AI-powered maritime berth reservation platform for Estonian ports and marinas.

Habora is a full-stack Next.js 16 application that enables boat owners to discover available marinas, check berth availability, and complete bookings through a natural-language AI chatbot — all from a public-facing landing page. Port managers access a dedicated dashboard to manage their berths, bookings, and AI agent settings.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Edge Functions](#edge-functions)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Deployment](#deployment)
- [Further Development](#further-development)

---

## Features

### Public Landing Page (`/`)
- **Interactive Marina Map** — Leaflet-powered dark-themed map centered on Estonia (or user's geolocation). Custom markers for each port with click popups showing berth summary and a direct-to-chat CTA.
- **AI Chatbot Widget** — Floating chat button powered by a Supabase Edge Function backed by Google Gemini 2.5 Flash. Supports port discovery, availability checking, and end-to-end booking.
- **How It Works** section and localized footer.

### Port Manager Dashboard (`/dashboard`)
- **Overview** — KPI stats (total berths, active bookings, occupancy rate, revenue).
- **Berths Management** — Full CRUD with inline editing and form validation.
- **Bookings Management** — View, filter, and manage all reservations.
- **Settings** — Profile, notifications, AI agent configuration, and password management.

### Auth
- Email/password authentication via Supabase Auth.
- Server-side session management via middleware (`proxy.ts`).
- Automatic redirect to `/login` for unauthenticated dashboard access.

---

## Architecture Overview

```
Public User
    │
    ▼
Landing Page (Next.js SSR)
    ├─ Interactive Map → port discovery → opens ChatWidget
    └─ ChatWidget → Supabase Edge Function (chat-handler)
                        └─ Gemini 2.5 Flash + Function Calling
                              ├─ list_ports (Supabase DB query)
                              ├─ check_availability (Supabase RPC)
                              └─ create_booking (Supabase insert)

Port Manager
    │
    ▼
Dashboard (auth-protected Next.js pages)
    └─ TanStack Query → Supabase JS Client → PostgreSQL + RLS
```

See `specs/ARCHITECTURE.md` for strict guardrails all contributors must follow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4 + custom `globals.css` |
| Auth | Supabase Auth (email/password) |
| Database | Supabase PostgreSQL + RLS |
| AI Backend | Google Gemini 2.5 Flash via Supabase Edge Functions |
| Data Fetching | TanStack React Query v5 |
| Map | Leaflet + react-leaflet |
| i18n | next-intl (EN / ET) |
| Email | Resend (via `send-email` edge function) |
| UI Components | Radix UI + shadcn/ui primitives |
| Animations | Framer Motion |
| E2E Testing | Playwright |
| Unit Testing | Vitest + Testing Library |

---

## Project Structure

```
/
├── app/
│   └── [locale]/           # All routes scoped to locale (en/et)
│       ├── page.tsx         # Landing page
│       ├── layout.tsx       # Root layout with providers
│       ├── login/           # Login page
│       ├── signup/          # Signup page
│       └── dashboard/       # Protected dashboard pages
│           ├── page.tsx     # Overview/Stats
│           ├── berths/      # Berth management
│           ├── bookings/    # Bookings management
│           └── settings/    # User & AI settings
│
├── components/
│   ├── landing/             # Public page components
│   │   ├── chat-widget.tsx  # AI chatbot floating widget
│   │   ├── ports-map.tsx    # Leaflet map (SSR-safe core)
│   │   ├── map-wrapper.tsx  # Dynamic SSR wrapper for the map
│   │   ├── port-marker.tsx  # Custom Leaflet marker + popup
│   │   ├── featured-ports.tsx # Map section wrapper
│   │   ├── hero-section.tsx
│   │   ├── how-it-works.tsx
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── dashboard/           # Dashboard layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── stats-card.tsx
│   │   ├── bookings-table.tsx
│   │   └── activity-feed.tsx
│   ├── ui/                  # Shared shadcn/ui primitives
│   └── providers.tsx        # App-level providers (Query, Theme, Toasts)
│
├── lib/
│   ├── queries/             # TanStack Query hooks (client-side data fetching)
│   │   ├── public.ts        # Unauthenticated port/berth queries
│   │   ├── berths.ts        # Dashboard berth CRUD
│   │   ├── bookings.ts      # Dashboard booking queries
│   │   ├── stats.ts         # Dashboard stats aggregation
│   │   └── settings.ts      # AI agent settings
│   ├── supabase/            # Supabase client factories
│   │   ├── client.ts        # Browser-side client
│   │   └── server.ts        # Server-side client (for RSC / Server Actions)
│   ├── validations.ts       # Shared client+server validation utilities
│   └── utils.ts             # cn() helper
│
├── supabase/
│   ├── functions/
│   │   ├── chat-handler/    # AI booking chatbot Edge Function
│   │   └── send-email/      # Post-booking email notification Edge Function
│   ├── config.toml          # Supabase local dev config
│   └── seed_test_data.sql   # Test data seeding script for QA
│
├── specs/                   # Living project specification documents
│   ├── ARCHITECTURE.md      # Design guardrails for contributors
│   ├── DATABASE_SCHEMA.sql  # Canonical DB schema reference
│   ├── RLS_POLICIES.sql     # Row Level Security policies
│   ├── SEED_DATA.sql        # Initial/reference seed data
│   ├── SEED_TEST_USER.sql   # Test user setup for QA
│   ├── CHATBOT.md           # AI chatbot system design and tools
│   └── WEBHOOK_DEPLOYMENT.md # How to activate the email webhook
│
├── tests/
│   ├── e2e/                 # Playwright E2E specs
│   ├── unit/                # Vitest unit tests (validations, utils)
│   ├── helpers/             # Playwright Page Object Models
│   ├── logs/                # Test run logs (gitignored)
│   └── setup.ts             # Vitest global setup
│
├── messages/
│   ├── en.json              # English translations
│   └── et.json              # Estonian translations
│
├── i18n/                    # next-intl routing config
├── proxy.ts                 # Next.js middleware (auth guard + i18n routing)
├── next.config.mjs
├── tsconfig.json
├── playwright.config.ts
└── vitest.config.mts
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase project (see [supabase.com](https://supabase.com))
- A Google Gemini API key
- A Resend API key (optional, for booking emails)

### Installation

```bash
git clone <your-repo>
cd b_bpzd8tRe1td
npm install
```

### Configure Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Run Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
RESEND_API_KEY=re_...
GEMINI_API_KEY=AIza...
```

> **Never commit `.env.local` or `.env.test`.** These are listed in `.gitignore`.

---

## Database

The canonical schema is documented in `specs/DATABASE_SCHEMA.sql`.

### Key Tables
| Table | Description |
|---|---|
| `ports` | Port/marina entities owned by a user |
| `berths` | Individual berths within a port (status: available/occupied/maintenance) |
| `bookings` | Customer reservations for berths |
| `agent_settings` | Per-port AI chatbot configuration (system prompt, mode) |
| `chat_history` | Logged chat sessions per session_id and port_id |

RLS policies are in `specs/RLS_POLICIES.sql`.

### Seeding Test Data

```sql
-- Run this in the Supabase SQL Editor
-- Located at: supabase/seed_test_data.sql
-- Creates "Sadama Testing Port" with 3 berths (available, occupied, maintenance)
-- linked to test@sadama.com
```

---

## Edge Functions

Deployed to Supabase, these run as serverless Deno functions.

### `chat-handler`
The core AI booking agent. Receives a chat history from the client, runs an agentic loop using Gemini function calling, and returns the AI's response.

**Tools available:**
- `list_ports` — Query ports from DB (supports search)
- `check_availability` — Run `check_berth_availability` RPC for given dates/vessel size
- `create_booking` — Insert a confirmed booking into the `bookings` table

**Deployment:**
```bash
npx supabase functions deploy chat-handler --no-verify-jwt
```
> `--no-verify-jwt` is required because the client uses a publishable key, not a JWT.

### `send-email`
Triggered by a Supabase Database Webhook on `bookings` INSERT events. Sends a booking confirmation email via Resend.

See `specs/WEBHOOK_DEPLOYMENT.md` for step-by-step activation instructions.

---

## Internationalization

The app supports **English (en)** and **Estonian (et)** via `next-intl`.

- All routes live under `app/[locale]/`
- Translation strings are in `messages/en.json` and `messages/et.json`
- The locale is resolved by middleware in `proxy.ts` and injected via `i18n/request.ts`
- Language switching is available in the header

---

## Testing

See `tests/README.md` for full instructions. The test strategy document is at `specs/TEST_STRATEGY.md`.

### Run Unit Tests
```bash
npm run test:unit
```

### Run E2E Tests
```bash
npm run dev           # in one terminal
npm run test:e2e      # in another
```

### View E2E Report
```bash
npm run test:report
```

---

## Deployment

The application is deployed on **Vercel** (live at `habora.vercel.app`).

Deployments are triggered automatically on push to the main branch.

**Required Vercel environment variables** (set in Vercel Dashboard):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `RESEND_API_KEY`
- `GEMINI_API_KEY`

---

## Further Development

Consult the `specs/` directory before making any changes. Key documents:

| Document | When to Read |
|---|---|
| `specs/ARCHITECTURE.md` | Before any code changes — contains hard constraints |
| `specs/CHATBOT.md` | Before modifying AI behavior or adding new tools |
| `specs/DATABASE_SCHEMA.sql` | Before any schema migrations |
| `specs/RLS_POLICIES.sql` | Before adding new tables or changing data access |
| `specs/WEBHOOK_DEPLOYMENT.md` | To activate the email notification pipeline |

### Planned Next Features
- Interactive map provider swap (Mapbox/custom) for richer visuals
- CI/CD pipeline (GitHub Actions) running Playwright + Vitest on every PR
- Mobile app (Flutter) consuming the Supabase backend directly
