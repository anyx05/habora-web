-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Habora — Revised RLS Policies                           ║
-- ║  Chatbot Service Account: d50a1af2-084d-42cd-a8e5-b6e73342504a║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Enable RLS on all tables ─────────────────────────────────────
ALTER TABLE ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE berths ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════
-- 1. PORTS
-- ══════════════════════════════════════════════════════════════════

-- Public landing page needs port names/locations (limited columns enforced by query)
-- The chatbot service account also needs to list ports for tool calls
CREATE POLICY "Ports are viewable by everyone"
ON ports FOR SELECT USING (true);

-- Only port owners can modify their ports
CREATE POLICY "Port owners can update their ports"
ON ports FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Port owners can delete their ports"
ON ports FOR DELETE USING (auth.uid() = owner_id);

-- Authenticated users can create new ports (for onboarding)
CREATE POLICY "Authenticated users can create ports"
ON ports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════════════════════════
-- 2. BERTHS
-- ══════════════════════════════════════════════════════════════════

-- Public landing page and chatbot need to read active berths
CREATE POLICY "Active berths are viewable by everyone"
ON berths FOR SELECT USING (is_active = true);

-- Port owners get full CRUD on their own berths (including inactive)
CREATE POLICY "Port owners can manage their berths"
ON berths FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ports
    WHERE ports.id = berths.port_id AND ports.owner_id = auth.uid()
  )
);

-- ══════════════════════════════════════════════════════════════════
-- 3. BOOKINGS (strictly private)
-- ══════════════════════════════════════════════════════════════════

-- Port owners can view bookings for their berths
CREATE POLICY "Port owners can view their bookings"
ON bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM berths
    JOIN ports ON ports.id = berths.port_id
    WHERE berths.id = bookings.berth_id AND ports.owner_id = auth.uid()
  )
);

-- Port owners can update bookings for their berths (cancel, status change)
CREATE POLICY "Port owners can update their bookings"
ON bookings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM berths
    JOIN ports ON ports.id = berths.port_id
    WHERE berths.id = bookings.berth_id AND ports.owner_id = auth.uid()
  )
);

-- Chatbot service account can insert bookings (AI-created reservations)
CREATE POLICY "Chatbot can insert bookings"
ON bookings FOR INSERT WITH CHECK (
  auth.uid() = 'd50a1af2-084d-42cd-a8e5-b6e73342504a'::uuid
);

-- Port owners can also insert bookings manually from dashboard
CREATE POLICY "Port owners can insert bookings for their berths"
ON bookings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM berths
    JOIN ports ON ports.id = berths.port_id
    WHERE berths.id = berth_id AND ports.owner_id = auth.uid()
  )
);

-- ══════════════════════════════════════════════════════════════════
-- 4. AGENT SETTINGS
-- ══════════════════════════════════════════════════════════════════

-- Port owners manage their agent settings
CREATE POLICY "Port owners can manage agent settings"
ON agent_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ports
    WHERE ports.id = agent_settings.port_id AND ports.owner_id = auth.uid()
  )
);

-- Chatbot can read agent settings to load custom system prompts
CREATE POLICY "Chatbot can read agent settings"
ON agent_settings FOR SELECT USING (
  auth.uid() = 'd50a1af2-084d-42cd-a8e5-b6e73342504a'::uuid
);

-- ══════════════════════════════════════════════════════════════════
-- 5. CHAT HISTORY
-- ══════════════════════════════════════════════════════════════════

-- Port operators can read chat history for their ports
CREATE POLICY "Port operators can read chat history"
ON chat_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ports
    WHERE ports.id = chat_history.port_id AND ports.owner_id = auth.uid()
  )
);

-- Chatbot service account can insert chat history
CREATE POLICY "Chatbot can insert chat history"
ON chat_history FOR INSERT WITH CHECK (
  auth.uid() = 'd50a1af2-084d-42cd-a8e5-b6e73342504a'::uuid
);
