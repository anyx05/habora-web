# Habora — Canonical Database Schema

## Overview

All tables are in the `public` schema. Row Level Security (RLS) is enabled on all tables. See `RLS_POLICIES.sql` for the full policy definitions.

The application is **multi-tenant by design** — multiple port owners can use the platform from a single deployment. All port-scoped data is isolated via `port_id` and `owner_id` columns with corresponding RLS policies.

---

## Tables

### `public.ports`

The top-level entity. Each port/marina is owned by one authenticated user.

```sql
CREATE TABLE public.ports (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  location        text NOT NULL,
  description     text,
  contact_email   text NOT NULL,
  coordinates     text,        -- Format: "lat, lng" (e.g. "59.4370, 24.7536")
  created_at      timestamptz  DEFAULT now(),
  updated_at      timestamptz  DEFAULT now()
);
```

**Relationships:** Has many `berths`, `agent_settings` (1:1), `chat_history`.

---

### `public.berths`

Individual berths within a port. Status determines chatbot availability reporting.

```sql
CREATE TABLE public.berths (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  port_id         uuid NOT NULL REFERENCES public.ports(id) ON DELETE CASCADE,
  name            text NOT NULL,
  max_length_m    numeric NOT NULL,    -- Maximum vessel length in meters
  max_draft_m     numeric NOT NULL,    -- Maximum vessel draft in meters
  max_beam_m      numeric,             -- Maximum vessel beam (width) in meters
  price_per_night numeric NOT NULL,    -- Nightly rate in EUR
  amenities       text[],              -- Array of amenity tags (e.g. '{electricity, water}')
  status          text NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'occupied', 'maintenance')),
  is_active       boolean NOT NULL DEFAULT true,
  -- Legacy/duplicate columns added during iterative development (keep in sync with max_* columns)
  length          numeric,
  draft           numeric,
  price           numeric,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

> [!NOTE]
> `length`, `draft`, and `price` are legacy columns mirroring `max_length_m`, `max_draft_m`, and `price_per_night`. They exist for backwards compatibility with early dashboard queries. New code should use the `max_*` / `price_per_night` columns. These will be consolidated in a future migration.

**Relationships:** Has many `bookings`.

---

### `public.bookings`

Customer reservations. Created by the AI chatbot's `create_booking` tool call.

```sql
CREATE TABLE public.bookings (
  id               uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  berth_id         uuid NOT NULL REFERENCES public.berths(id) ON DELETE RESTRICT,
  customer_name    text NOT NULL,
  customer_email   text NOT NULL,
  vessel_name      text NOT NULL,
  vessel_length_m  numeric NOT NULL,
  vessel_draft_m   numeric,
  arrival_date     date NOT NULL,
  departure_date   date NOT NULL,
  status           text NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  total_price      numeric,
  notes            text,
  created_at       timestamptz DEFAULT now()
);
```

**Lifecycle:** Bookings are inserted by the edge function with `status: 'confirmed'`. Port managers can update the status via the dashboard.

---

### `public.agent_settings`

Per-port AI chatbot configuration. One row per port (1:1 with ports).

```sql
CREATE TABLE public.agent_settings (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  port_id         uuid UNIQUE NOT NULL REFERENCES public.ports(id) ON DELETE CASCADE,
  system_prompt   text NOT NULL,
  mode            text NOT NULL DEFAULT 'full_booking'
                    CHECK (mode IN ('info_only', 'full_booking')),
  language_hint   text NOT NULL DEFAULT 'auto',
  updated_at      timestamptz DEFAULT now()
);
```

- `mode: 'info_only'` — Chatbot can list ports and check availability but cannot create bookings.
- `mode: 'full_booking'` — Full booking flow enabled.
- `language_hint: 'auto'` — Detect from user's message. Override with `'en'` or `'et'`.

---

### `public.chat_history`

Audit log of all chatbot interactions. Stored by session and optionally linked to a port.

```sql
CREATE TABLE public.chat_history (
  id          uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id  text NOT NULL,
  port_id     uuid REFERENCES public.ports(id) ON DELETE SET NULL,
  role        text NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content     text NOT NULL,
  tool_name   text,
  created_at  timestamptz DEFAULT now()
);
```

`session_id` is a client-generated UUID (`guest-<uuid>`) created per chat session.

---

## Key Database Functions (RPCs)

### `check_berth_availability`

Called by the `check_availability` chatbot tool.

```sql
check_berth_availability(
  p_port_id       uuid,
  p_arrival       date,
  p_departure     date,
  p_vessel_length numeric DEFAULT 0,
  p_vessel_draft  numeric DEFAULT 0
)
RETURNS TABLE (berth data)
```

Returns berths at the given port that:
- Have `status = 'available'` and `is_active = true`
- Have `max_length_m >= p_vessel_length` and `max_draft_m >= p_vessel_draft`
- Are **not** already booked for the requested date range (no overlapping confirmed bookings)

---

## Indexes (Recommended)

```sql
CREATE INDEX ON public.berths(port_id);
CREATE INDEX ON public.bookings(berth_id);
CREATE INDEX ON public.bookings(arrival_date, departure_date);
CREATE INDEX ON public.chat_history(session_id);
CREATE INDEX ON public.agent_settings(port_id);
```

---

## Migration Notes

When making schema changes:
1. Update this file.
2. Update `RLS_POLICIES.sql` if new columns affect access control.
3. Update `lib/queries/*.ts` TypeScript types to match.
4. Run `supabase db push` (or apply via Supabase Dashboard SQL Editor).
