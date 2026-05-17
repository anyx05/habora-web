-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Habora — Seed Data for test@sadama.com                   ║
-- ║                                                                 ║
-- ║  INSTRUCTIONS:                                                  ║
-- ║  1. Go to Supabase Dashboard → Authentication → Users           ║
-- ║  2. Find test@sadama.com and copy the UUID                      ║
-- ║  3. Replace YOUR_USER_UUID_HERE below with the actual UUID      ║
-- ║  4. Run this entire script in Supabase SQL Editor               ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Step 0: Set the test user UUID ──────────────────────────────────
-- REPLACE THIS with the actual UUID from Supabase Auth dashboard
DO $$
DECLARE
  test_user_id uuid := '417869b7-9925-4225-bcd0-d47e916dd6af';
  port_tallinn uuid;
  port_haapsalu uuid;
  berth_a1 uuid;
  berth_a2 uuid;
  berth_b1 uuid;
  berth_b2 uuid;
  berth_c1 uuid;
BEGIN

-- ── Step 1: Create two ports owned by the test user ─────────────────
INSERT INTO ports (id, name, location, description, contact_email, owner_id)
VALUES (
  uuid_generate_v4(),
  'Tallinn Old City Marina',
  'Tallinn, Harjumaa',
  'Premium marina in the heart of Tallinn Old Town. Walk to restaurants, museums, and the ferry terminal. Full-service facilities for yachts up to 25m.',
  'info@tallinnmarina.ee',
  test_user_id
)
RETURNING id INTO port_tallinn;

INSERT INTO ports (id, name, location, description, contact_email, owner_id)
VALUES (
  uuid_generate_v4(),
  'Haapsalu Yacht Harbour',
  'Haapsalu, Läänemaa',
  'Charming west-coast harbour in the historic spa town of Haapsalu. Protected bay, ideal for sailing boats and smaller yachts.',
  'harbour@haapsalu.ee',
  test_user_id
)
RETURNING id INTO port_haapsalu;

-- ── Step 2: Create berths for Tallinn Old City Marina ───────────────
INSERT INTO berths (id, port_id, name, max_length_m, max_draft_m, max_beam_m, price_per_night, amenities, status, is_active)
VALUES (
  uuid_generate_v4(), port_tallinn,
  'Berth A1 — Guest Slip',
  12.0, 2.5, 4.0, 45.00,
  ARRAY['power', 'water', 'wifi'],
  'available', true
)
RETURNING id INTO berth_a1;

INSERT INTO berths (id, port_id, name, max_length_m, max_draft_m, max_beam_m, price_per_night, amenities, status, is_active)
VALUES (
  uuid_generate_v4(), port_tallinn,
  'Berth A2 — Sailboat',
  15.0, 3.5, 5.0, 65.00,
  ARRAY['power', 'water', 'wifi', 'pump-out'],
  'occupied', true
)
RETURNING id INTO berth_a2;

INSERT INTO berths (id, port_id, name, max_length_m, max_draft_m, max_beam_m, price_per_night, amenities, status, is_active)
VALUES (
  uuid_generate_v4(), port_tallinn,
  'Berth B1 — Deep Water',
  24.0, 6.0, 7.0, 135.00,
  ARRAY['power', 'water', 'wifi', 'pump-out', 'fuel'],
  'available', true
)
RETURNING id INTO berth_b1;

-- ── Step 3: Create berths for Haapsalu Yacht Harbour ────────────────
INSERT INTO berths (id, port_id, name, max_length_m, max_draft_m, max_beam_m, price_per_night, amenities, status, is_active)
VALUES (
  uuid_generate_v4(), port_haapsalu,
  'Berth H1 — West Pier',
  10.0, 2.0, 3.5, 30.00,
  ARRAY['power', 'water'],
  'available', true
)
RETURNING id INTO berth_b2;

INSERT INTO berths (id, port_id, name, max_length_m, max_draft_m, max_beam_m, price_per_night, amenities, status, is_active)
VALUES (
  uuid_generate_v4(), port_haapsalu,
  'Berth H2 — Inner Basin',
  18.0, 4.5, 5.5, 75.00,
  ARRAY['power', 'water', 'wifi', 'shower'],
  'maintenance', true
)
RETURNING id INTO berth_c1;

-- ── Step 4: Create bookings ─────────────────────────────────────────
-- Confirmed booking (current)
INSERT INTO bookings (berth_id, customer_name, customer_email, vessel_name, vessel_length_m, vessel_draft_m, arrival_date, departure_date, status, total_price, notes)
VALUES (
  berth_a2,
  'Erik Mägi', 'erik.magi@gmail.com',
  'SV Tuulevaikne', 13.5, 2.8,
  CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days',
  'confirmed', 325.00,
  'Arriving from Helsinki. Needs power hookup on arrival.'
);

-- Confirmed booking (upcoming)
INSERT INTO bookings (berth_id, customer_name, customer_email, vessel_name, vessel_length_m, vessel_draft_m, arrival_date, departure_date, status, total_price, notes)
VALUES (
  berth_b1,
  'Anna Kask', 'anna.kask@maritime.ee',
  'MY Nordic Explorer', 22.0, 5.2,
  CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '12 days',
  'confirmed', 945.00,
  'VIP client. Prefers stern-to mooring. Fuel on arrival.'
);

-- Pending booking
INSERT INTO bookings (berth_id, customer_name, customer_email, vessel_name, vessel_length_m, vessel_draft_m, arrival_date, departure_date, status, total_price, notes)
VALUES (
  berth_a1,
  'Jaan Tamm', 'jaan@sailestonia.ee',
  'SV Laine', 10.5, 2.0,
  CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '10 days',
  'pending', 90.00,
  'First-time visitor. Requesting berth close to facilities.'
);

-- Cancelled booking
INSERT INTO bookings (berth_id, customer_name, customer_email, vessel_name, vessel_length_m, vessel_draft_m, arrival_date, departure_date, status, total_price, notes)
VALUES (
  berth_b2,
  'Mart Sepp', 'mart.sepp@outlook.com',
  'SV Vabadus', 9.0, 1.8,
  CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days',
  'cancelled', 90.00,
  'Cancelled due to weather.'
);

-- Confirmed past booking (completed)
INSERT INTO bookings (berth_id, customer_name, customer_email, vessel_name, vessel_length_m, vessel_draft_m, arrival_date, departure_date, status, total_price, notes)
VALUES (
  berth_a1,
  'Liisa Rebane', 'liisa.r@gmail.com',
  'SY Päikeseloojang', 11.0, 2.2,
  CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '7 days',
  'confirmed', 135.00,
  'Repeat customer from Pärnu.'
);

-- ── Step 5: Create agent settings ───────────────────────────────────
INSERT INTO agent_settings (port_id, system_prompt, mode, language_hint)
VALUES (
  port_tallinn,
  'You are the harbour assistant for Tallinn Old City Marina. Be professional, concise, and helpful. Our marina is located in the heart of Tallinn Old Town with easy access to restaurants and tourist attractions. Maximum stay is 30 days. Speed limit in harbour is 3 knots. Quiet hours: 22:00-07:00.',
  'full_booking',
  'auto'
);

INSERT INTO agent_settings (port_id, system_prompt, mode, language_hint)
VALUES (
  port_haapsalu,
  'You are the harbour assistant for Haapsalu Yacht Harbour. We are a cozy west-coast marina in the historic spa town of Haapsalu. Maximum stay is 14 days. The harbour is sheltered and ideal for smaller vessels. Town center is a 5-minute walk.',
  'full_booking',
  'auto'
);

RAISE NOTICE 'Seed data created successfully!';
RAISE NOTICE 'Port Tallinn ID: %', port_tallinn;
RAISE NOTICE 'Port Haapsalu ID: %', port_haapsalu;

END $$;
