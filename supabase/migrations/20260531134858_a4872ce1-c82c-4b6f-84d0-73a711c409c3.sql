
-- =========================================================
-- PARTIES
-- =========================================================
CREATE TABLE public.parties (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  leader_id   TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parties TO anon, authenticated;
GRANT ALL ON public.parties TO service_role;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties_public_read"   ON public.parties FOR SELECT USING (true);
CREATE POLICY "parties_public_insert" ON public.parties FOR INSERT WITH CHECK (true);
CREATE POLICY "parties_public_update" ON public.parties FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "parties_public_delete" ON public.parties FOR DELETE USING (true);

-- =========================================================
-- PARTY MEMBERS
-- =========================================================
CREATE TABLE public.party_members (
  party_id    UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  player_id   TEXT NOT NULL,
  player_name TEXT NOT NULL,
  level       INTEGER NOT NULL DEFAULT 1,
  map_id      TEXT,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (party_id, player_id)
);
CREATE UNIQUE INDEX party_members_player_unique ON public.party_members(player_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.party_members TO anon, authenticated;
GRANT ALL ON public.party_members TO service_role;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "party_members_public_read"   ON public.party_members FOR SELECT USING (true);
CREATE POLICY "party_members_public_insert" ON public.party_members FOR INSERT WITH CHECK (true);
CREATE POLICY "party_members_public_update" ON public.party_members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "party_members_public_delete" ON public.party_members FOR DELETE USING (true);

-- =========================================================
-- PARTY INVITES
-- =========================================================
CREATE TABLE public.party_invites (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id    UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  party_name  TEXT NOT NULL,
  from_id     TEXT NOT NULL,
  from_name   TEXT NOT NULL,
  target_id   TEXT NOT NULL,
  target_name TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX party_invites_target_idx ON public.party_invites(target_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.party_invites TO anon, authenticated;
GRANT ALL ON public.party_invites TO service_role;
ALTER TABLE public.party_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "party_invites_public_read"   ON public.party_invites FOR SELECT USING (true);
CREATE POLICY "party_invites_public_insert" ON public.party_invites FOR INSERT WITH CHECK (true);
CREATE POLICY "party_invites_public_update" ON public.party_invites FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "party_invites_public_delete" ON public.party_invites FOR DELETE USING (true);

-- =========================================================
-- GROUP LEGENDARY STATE (captura competitiva)
-- =========================================================
CREATE TABLE public.group_legendary_state (
  spawn_id      TEXT NOT NULL PRIMARY KEY,
  map_id        TEXT NOT NULL,
  species       TEXT NOT NULL,
  party_id      UUID,
  captured_by   TEXT,
  captured_name TEXT,
  captured_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_legendary_state TO anon, authenticated;
GRANT ALL ON public.group_legendary_state TO service_role;
ALTER TABLE public.group_legendary_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gls_public_read"   ON public.group_legendary_state FOR SELECT USING (true);
CREATE POLICY "gls_public_insert" ON public.group_legendary_state FOR INSERT WITH CHECK (true);
CREATE POLICY "gls_public_update" ON public.group_legendary_state FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "gls_public_delete" ON public.group_legendary_state FOR DELETE USING (true);

-- =========================================================
-- REALTIME
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.parties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.party_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.party_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_legendary_state;
